import { db } from "@/drizzle/db";
import {
  ArnisTechniquesTable,
  MatchArnisTechniquesTable,
  MatchesTable,
  MatchPlayerScoresTable,
  MatchPlayersTable,
  UserDetailsTable,
} from "@/drizzle/schema";
import { eq, isNotNull, sql } from "drizzle-orm";
import type { MatchResponseData } from "@/types/schemas/match";

export async function getRecentMatches(tx = db): Promise<MatchResponseData[]> {
  const data: MatchResponseData[] = [];

  const matches = await tx
    .select({
      matchId: MatchesTable.matchId,
      finishedAt: MatchesTable.finishedAt,
    })
    .from(MatchesTable)
    .where(isNotNull(MatchesTable.finishedAt));

  for (const match of matches) {
    const players = await tx
      .select({
        matchPlayerId: MatchPlayersTable.matchPlayerId,
        userId: MatchPlayersTable.userId,
        firstName: UserDetailsTable.firstName,
        middleName: UserDetailsTable.middleName,
        lastName: UserDetailsTable.lastName,
        score: sql<number>`(cast(sum(${MatchPlayerScoresTable.score}) as int))`,
      })
      .from(MatchPlayersTable)
      .innerJoin(
        UserDetailsTable,
        eq(UserDetailsTable.userId, MatchPlayersTable.userId),
      )
      .innerJoin(
        MatchPlayerScoresTable,
        eq(
          MatchPlayerScoresTable.matchPlayerId,
          MatchPlayersTable.matchPlayerId,
        ),
      )
      .where(eq(MatchPlayersTable.matchId, match.matchId))
      .groupBy(
        MatchPlayerScoresTable.matchPlayerId,
        MatchPlayersTable.matchPlayerId,
        UserDetailsTable.firstName,
        UserDetailsTable.middleName,
        UserDetailsTable.lastName,
      )
      .limit(2);

    const techniques = await tx
      .select({
        name: ArnisTechniquesTable.name,
        techniqueType: ArnisTechniquesTable.techniqueType,
      })
      .from(ArnisTechniquesTable)
      .innerJoin(
        MatchArnisTechniquesTable,
        eq(MatchArnisTechniquesTable.matchId, match.matchId),
      );

    data.push({
      players,
      matchId: match.matchId,
      // Manually do null assertion since we already checked if `finishedAt` is not null
      finishedAt: match.finishedAt!,
      arnisTechniques: techniques,
    });
  }

  return data;
}
