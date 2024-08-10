import { db } from "@/drizzle/db";
import {
  ArnisTechniquesTable,
  MatchArnisTechniquesTable,
  MatchesTable,
  MatchPlayersTable,
  PlayerSeasonDetailsTable,
  UserDetailsTable,
} from "@/drizzle/schema";
import type { PreviousMatch, UpcomingMatch } from "@/types/schemas/match";
import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  ne,
  sql,
} from "drizzle-orm";

export async function getUpcomingMatch(
  tx = db,
  userId: string,
  arnisSeasonId: number,
): Promise<UpcomingMatch | null> {
  const upcomingMatchCTE = tx.$with("upcoming_match").as(
    tx
      .select({
        matchId: MatchesTable.matchId,
      })
      .from(MatchesTable)
      .innerJoin(
        MatchPlayersTable,
        eq(MatchPlayersTable.matchId, MatchesTable.matchId),
      )
      .where(
        and(
          isNull(MatchesTable.finishedAt),
          eq(MatchesTable.matchId, MatchPlayersTable.matchId),
          eq(MatchPlayersTable.userId, userId),
        ),
      )
      .limit(1),
  );

  const [match] = await tx
    .with(upcomingMatchCTE)
    .select({
      matchId: MatchesTable.matchId,
      arnisTechnique: {
        name: ArnisTechniquesTable.name,
        techniqueType: ArnisTechniquesTable.techniqueType,
      },
      opponent: {
        userId: MatchPlayersTable.userId,
        rating: PlayerSeasonDetailsTable.rating,
        firstName: UserDetailsTable.firstName,
        middleName: UserDetailsTable.middleName,
        lastName: UserDetailsTable.lastName,
        avatarUrl: UserDetailsTable.avatarUrl,
        bannerUrl: UserDetailsTable.bannerUrl,
      },
    })
    .from(MatchesTable)
    .innerJoin(
      MatchArnisTechniquesTable,
      eq(MatchArnisTechniquesTable.matchId, MatchesTable.matchId),
    )
    .innerJoin(
      ArnisTechniquesTable,
      eq(
        ArnisTechniquesTable.arnisTechniqueId,
        MatchArnisTechniquesTable.arnisTechniqueId,
      ),
    )
    .innerJoin(
      MatchPlayersTable,
      eq(MatchPlayersTable.matchId, MatchesTable.matchId),
    )
    .innerJoin(
      UserDetailsTable,
      eq(UserDetailsTable.userId, MatchPlayersTable.userId),
    )
    .innerJoin(
      PlayerSeasonDetailsTable,
      eq(PlayerSeasonDetailsTable.userId, MatchPlayersTable.userId),
    )
    .where(
      and(
        isNull(MatchesTable.finishedAt),
        ne(MatchPlayersTable.userId, userId),
        eq(
          MatchesTable.matchId,
          sql`(SELECT ${upcomingMatchCTE.matchId} FROM ${upcomingMatchCTE})`,
        ),
        eq(PlayerSeasonDetailsTable.arnisSeasonId, arnisSeasonId),
      ),
    )
    .orderBy(desc(MatchesTable.createdAt))
    .limit(1);

  if(!match) {
    return null
  }

  return match;
}

export async function getPreviousMatches(
  tx = db,
  userId: string,
  arnisSeasonId: number,
): Promise<PreviousMatch[]> {
  const previousMatchesCTE = tx.$with("previous_matches").as(
    tx
      .select({
        matchId: MatchesTable.matchId,
      })
      .from(MatchesTable)
      .innerJoin(
        MatchPlayersTable,
        eq(MatchPlayersTable.matchId, MatchesTable.matchId),
      )
      .where(
        and(
          isNotNull(MatchesTable.finishedAt),
          eq(MatchesTable.matchId, MatchPlayersTable.matchId),
          eq(MatchPlayersTable.userId, userId),
        ),
      ),
  );

  const matches = await tx
    .with(previousMatchesCTE)
    .select({
      matchId: MatchesTable.matchId,
      arnisTechnique: {
        name: ArnisTechniquesTable.name,
        techniqueType: ArnisTechniquesTable.techniqueType,
      },
      opponent: {
        userId: MatchPlayersTable.userId,
        rating: PlayerSeasonDetailsTable.rating,
        firstName: UserDetailsTable.firstName,
        middleName: UserDetailsTable.middleName,
        lastName: UserDetailsTable.lastName,
        avatarUrl: UserDetailsTable.avatarUrl,
        bannerUrl: UserDetailsTable.bannerUrl,
      },
    })
    .from(MatchesTable)
    .innerJoin(
      MatchArnisTechniquesTable,
      eq(MatchArnisTechniquesTable.matchId, MatchesTable.matchId),
    )
    .innerJoin(
      ArnisTechniquesTable,
      eq(
        ArnisTechniquesTable.arnisTechniqueId,
        MatchArnisTechniquesTable.arnisTechniqueId,
      ),
    )
    .innerJoin(
      MatchPlayersTable,
      eq(MatchPlayersTable.matchId, MatchesTable.matchId),
    )
    .innerJoin(
      UserDetailsTable,
      eq(UserDetailsTable.userId, MatchPlayersTable.userId),
    )
    .innerJoin(
      PlayerSeasonDetailsTable,
      eq(PlayerSeasonDetailsTable.userId, MatchPlayersTable.userId),
    )
    .where(
      and(
        isNotNull(MatchesTable.finishedAt),
        ne(MatchPlayersTable.userId, userId),
        inArray(
          MatchesTable.matchId,
          sql`(SELECT ${previousMatchesCTE.matchId} FROM ${previousMatchesCTE})`,
        ),
        eq(PlayerSeasonDetailsTable.arnisSeasonId, arnisSeasonId),
      ),
    )
    .orderBy(desc(MatchesTable.createdAt))
    .limit(1);

  return matches;
}
