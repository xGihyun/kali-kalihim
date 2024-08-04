import { db } from "@/drizzle/db";
import {
  ArnisSeasonsTable,
  MatchArnisTechniquesTable,
  MatchCommentsTable,
  MatchesTable,
  MatchPlayersTable,
  MatchPlayerScoresTable,
  PlayerSeasonDetailsTable,
  SectionsTable,
} from "@/drizzle/schema";
import { PlayerSeasonSchema, RegisterSchema } from "@/types/schemas/auth";
import { SectionSchema } from "@/types/schemas/player";
import { defineAction } from "astro:actions";
import { ActionError } from "astro:actions";
import { UserDetailsTable, UsersTable } from "@/drizzle/schema";
import { MatchmakeSchema, MatchResultSchema } from "@/types/schemas/match";
import { and, asc, desc, eq } from "drizzle-orm";
import { matchmake } from "@/lib/matchmake";

// TODO: Rollback transactions on error

export const server = {
  register: defineAction({
    input: RegisterSchema,
    handler: async (data) => {
      console.log("Register:", data);

      const { email, password, confirmPassword, birthDate, ...userDetails } =
        data;

      if (password !== confirmPassword) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Passwords don't match.",
        });
      }

      await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(UsersTable)
          .values({ email, password })
          .returning({ userId: UsersTable.userId });

        await tx.insert(UserDetailsTable).values({
          userId: user.userId,
          birthDate: birthDate.toDateString(),
          ...userDetails,
        });
      });

      console.log("Successfully registered:", email);
    },
  }),
  player_season_register: defineAction({
    input: PlayerSeasonSchema,
    handler: async (data) => {
      await db.transaction(async (tx) => {
        const [latestSeason] = await tx
          .select({ arnisSeasonId: ArnisSeasonsTable.arnisSeasonId })
          .from(ArnisSeasonsTable)
          .where(eq(ArnisSeasonsTable.status, "ongoing"))
          .orderBy(desc(ArnisSeasonsTable.createdAt))
          .limit(1);

        await tx
          .insert(PlayerSeasonDetailsTable)
          .values({ arnisSeasonId: latestSeason.arnisSeasonId, ...data });
      });

      console.log("Successfully entered the new season.");
    },
  }),
  sections: defineAction({
    input: SectionSchema,
    handler: async (data) => {
      await db.insert(SectionsTable).values(data);
    },
  }),
  matchmake: defineAction({
    input: MatchmakeSchema,
    handler: async (data) => {
      console.log("Matchmaking...");

      await db.transaction(async (tx) => {
        const players = await tx
          .select({
            userId: PlayerSeasonDetailsTable.userId,
            rating: PlayerSeasonDetailsTable.rating,
          })
          .from(PlayerSeasonDetailsTable)
          .where(
            and(
              eq(PlayerSeasonDetailsTable.sectionId, data.sectionId),
              eq(PlayerSeasonDetailsTable.arnisSeasonId, data.arnisSeasonId),
            ),
          )
          .orderBy(asc(PlayerSeasonDetailsTable.rating));

        const matches = matchmake(players);

        for (const pairs of matches) {
          const [match] = await tx
            .insert(MatchesTable)
            .values({ cardBattleDuration: "6" })
            .returning({ matchId: MatchesTable.matchId });

          await tx.insert(MatchArnisTechniquesTable).values({
            matchId: match.matchId,
            arnisTechniqueId: data.arnisTechniqueId,
          });

          for (const player of pairs) {
            await tx
              .insert(MatchPlayersTable)
              .values({ matchId: match.matchId, userId: player.userId });
          }
        }
      });

      console.log("Successful matchmaking.");
    },
  }),
  matchResult: defineAction({
    input: MatchResultSchema,
    handler: async (data) => {
      await db.transaction(async (tx) => {
        for (const result of data.results) {
          for (const { score, rubricId } of result.rubricScores) {
            await tx.insert(MatchPlayerScoresTable).values({
              score,
              rubricId: rubricId,
              matchPlayerId: result.matchPlayerId,
            });
          }
        }

        await tx.insert(MatchCommentsTable).values({
          matchId: data.matchId,
          userId: data.comment.userId,
          content: data.comment.content,
        });
      });
    },
  }),
};
