import { db } from "@/drizzle/db";
import {
  ArnisTechniquesTable,
  MatchArnisTechniquesTable,
  MatchesTable,
  MatchPlayerScoresTable,
  MatchPlayersTable,
  PlayerSeasonDetailsTable,
  UserDetailsTable,
} from "@/drizzle/schema";
import {
  Verdict,
  type MatchPlayerScore,
  type PreviousMatchResponseData,
  type UpcomingMatchResponseData,
} from "@/types/schemas/match";
import { log } from "console";
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
): Promise<UpcomingMatchResponseData | null> {
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

  if (!match) {
    return null;
  }

  return match;
}

export async function getPreviousMatches(
  tx = db,
  userId: string,
  arnisSeasonId: number,
): Promise<PreviousMatchResponseData[]> {
  const data: PreviousMatchResponseData[] = [];

  const previousMatches = await tx
    .select({
      matchId: MatchesTable.matchId,
      finishedAt: MatchesTable.finishedAt,
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
    );

  for (const match of previousMatches) {
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
      .from(MatchArnisTechniquesTable)
      .innerJoin(
        ArnisTechniquesTable,
        eq(
          ArnisTechniquesTable.arnisTechniqueId,
          MatchArnisTechniquesTable.arnisTechniqueId,
        ),
      )
      .where(eq(MatchArnisTechniquesTable.matchId, match.matchId));

    data.push({
      players,
      matchId: match.matchId,
      finishedAt: match.finishedAt!,
      arnisTechniques: techniques,
      verdict: getPlayerMatchVerdict(players, userId),
    });
  }

  //const previousMatchesVerdictsCTE = tx.$with("previous_matches_verdicts").as(
  //  tx
  //    .select({
  //      matchId: MatchesTable.matchId,
  //      score:
  //        sql<number>`(cast(sum(${MatchPlayerScoresTable.score}) as int))`.as(
  //          "score",
  //        ),
  //      userId: MatchPlayersTable.userId,
  //      matchPlayerId: MatchPlayersTable.matchPlayerId,
  //    })
  //    .from(MatchesTable)
  //    .innerJoin(
  //      MatchPlayersTable,
  //      eq(MatchPlayersTable.matchId, MatchesTable.matchId),
  //    )
  //    .innerJoin(
  //      MatchPlayerScoresTable,
  //      eq(
  //        MatchPlayerScoresTable.matchPlayerId,
  //        MatchPlayersTable.matchPlayerId,
  //      ),
  //    )
  //    .where(
  //      and(
  //        isNotNull(MatchesTable.finishedAt),
  //        eq(MatchesTable.matchId, MatchPlayersTable.matchId),
  //      ),
  //    )
  //    .groupBy(
  //      MatchesTable.matchId,
  //      MatchPlayersTable.userId,
  //      MatchPlayersTable.matchPlayerId,
  //    ),
  //);
  //
  //const matches: PreviousMatchResponseData[] = await tx
  //  .with(previousMatchesCTE, previousMatchesVerdictsCTE)
  //  .select({
  //    matchId: MatchesTable.matchId,
  //    finishedAt: MatchesTable.finishedAt,
  //    arnisTechnique: {
  //      name: ArnisTechniquesTable.name,
  //      techniqueType: ArnisTechniquesTable.techniqueType,
  //    },
  //    opponent: {
  //      userId: MatchPlayersTable.userId,
  //      rating: PlayerSeasonDetailsTable.rating,
  //      firstName: UserDetailsTable.firstName,
  //      middleName: UserDetailsTable.middleName,
  //      lastName: UserDetailsTable.lastName,
  //      avatarUrl: UserDetailsTable.avatarUrl,
  //      bannerUrl: UserDetailsTable.bannerUrl,
  //    },
  //    score: sql<number>`(cast(sum(${MatchPlayerScoresTable.score}) as int))`,
  //  })
  //  .from(MatchesTable)
  //  .innerJoin(
  //    MatchArnisTechniquesTable,
  //    eq(MatchArnisTechniquesTable.matchId, MatchesTable.matchId),
  //  )
  //  .innerJoin(
  //    ArnisTechniquesTable,
  //    eq(
  //      ArnisTechniquesTable.arnisTechniqueId,
  //      MatchArnisTechniquesTable.arnisTechniqueId,
  //    ),
  //  )
  //  .innerJoin(
  //    MatchPlayersTable,
  //    eq(MatchPlayersTable.matchId, MatchesTable.matchId),
  //  )
  //  .innerJoin(
  //    MatchPlayerScoresTable,
  //    eq(MatchPlayerScoresTable.matchPlayerId, MatchPlayersTable.matchPlayerId),
  //  )
  //  .innerJoin(
  //    UserDetailsTable,
  //    eq(UserDetailsTable.userId, MatchPlayersTable.userId),
  //  )
  //  .innerJoin(
  //    PlayerSeasonDetailsTable,
  //    eq(PlayerSeasonDetailsTable.userId, MatchPlayersTable.userId),
  //  )
  //  //.innerJoin(
  //  //  previousMatchesVerdictsCTE,
  //  //  eq(
  //  //    previousMatchesVerdictsCTE.userId,
  //  //    MatchPlayersTable.userId,
  //  //  ),
  //  //)
  //  .where(
  //    and(
  //      isNotNull(MatchesTable.finishedAt),
  //      ne(MatchPlayersTable.userId, userId),
  //      inArray(
  //        MatchesTable.matchId,
  //        sql`(SELECT ${previousMatchesCTE.matchId} FROM ${previousMatchesCTE})`,
  //      ),
  //      eq(PlayerSeasonDetailsTable.arnisSeasonId, arnisSeasonId),
  //    ),
  //  )
  //  .orderBy(desc(MatchesTable.createdAt))
  //  .groupBy(
  //    MatchesTable.matchId,
  //    ArnisTechniquesTable.name,
  //    ArnisTechniquesTable.techniqueType,
  //    MatchPlayersTable.userId,
  //    PlayerSeasonDetailsTable.rating,
  //    UserDetailsTable.firstName,
  //    UserDetailsTable.middleName,
  //    UserDetailsTable.lastName,
  //    UserDetailsTable.avatarUrl,
  //    UserDetailsTable.bannerUrl,
  //  );

  return data;
}

function getPlayerMatchVerdict(
  players: MatchPlayerScore[],
  userId: string,
): Verdict {
  let scoreDiff = 0;

  for (const player of players) {
    if (scoreDiff === 0) {
      scoreDiff += player.score;
    } else {
      scoreDiff -= player.score;
    }
  }

  if (scoreDiff === 0) {
    return Verdict.Draw;
  }

  const winner = scoreDiff > 0 ? players[0] : players[1];

  if (winner.userId === userId) {
    return Verdict.Victory;
  }

  return Verdict.Defeat;
}
