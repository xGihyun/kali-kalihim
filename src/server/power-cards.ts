import { db } from "@/drizzle/db";
import {
  MatchesTable,
  MatchPlayersTable,
  PlayerPowerCardsTable,
  PowerCardsTable,
} from "@/drizzle/schema";
import type { Player, PlayerScore, PlayerSwap } from "@/types/player";
import type { MatchPlayerOutput } from "@/types/schemas/match";
import type { PlayerPowerCard } from "@/types/schemas/player";
import { and, desc, eq, exists, isNotNull, or, sql } from "drizzle-orm";

export async function getPowerCards(tx = db, userId: string): Promise<PlayerPowerCard[]> {
  const powerCards = await tx
    .select({
      playerPowerCardId: PlayerPowerCardsTable.playerPowerCardId,
      updatedAt: PlayerPowerCardsTable.updatedAt,
      status: PlayerPowerCardsTable.status,
      name: PowerCardsTable.name,
      description: PowerCardsTable.description,
      imageUrl: PowerCardsTable.imageUrl,
    })
    .from(PowerCardsTable)
    .innerJoin(
      PlayerPowerCardsTable,
      eq(PlayerPowerCardsTable.powerCardId, PowerCardsTable.powerCardId),
    )
    .where(eq(PlayerPowerCardsTable.userId, userId));

  return powerCards
}

export async function ancientsDomain(
  tx = db,
  player: PlayerScore,
  scoreDiff: number,
): Promise<boolean> {
  let query = tx
    .select()
    .from(PlayerPowerCardsTable)
    .where(
      and(
        eq(PlayerPowerCardsTable.powerCardId, 1), // Ancient's Domain
        eq(PlayerPowerCardsTable.userId, player.userId),
        eq(PlayerPowerCardsTable.status, "active"),
      ),
    );

  let [ancientsDomain] = await tx
    .select({ playerPowerCardId: PlayerPowerCardsTable.playerPowerCardId })
    .from(PlayerPowerCardsTable)
    .where(exists(query));

  if (scoreDiff > 0 || !ancientsDomain) {
    return false;
  }

  await tx
    .update(PlayerPowerCardsTable)
    .set({ status: "activated" })
    .where(
      eq(
        PlayerPowerCardsTable.playerPowerCardId,
        ancientsDomain.playerPowerCardId,
      ),
    );

  console.log("Player is protected by Ancient's Domain:", player.userId);

  return true;
}

// NOTE:
// This can be stacked when player activates two (2) Double-edged Swords
// after getting another from Extra Wind
export async function doubleEdgedSword(
  tx = db,
  player: PlayerScore,
): Promise<number> {
  let query = tx
    .select()
    .from(PlayerPowerCardsTable)
    .where(
      and(
        eq(PlayerPowerCardsTable.powerCardId, 3), // Double-edged Sword
        eq(PlayerPowerCardsTable.userId, player.userId),
        eq(PlayerPowerCardsTable.status, "active"),
      ),
    );

  let doubleEdgedSwords = await tx
    .select({ playerPowerCardId: PlayerPowerCardsTable.playerPowerCardId })
    .from(PlayerPowerCardsTable)
    .where(exists(query));

  if (!doubleEdgedSwords) {
    return 1;
  }

  for (const powerCard of doubleEdgedSwords) {
    await tx
      .update(PlayerPowerCardsTable)
      .set({ status: "activated" })
      .where(
        eq(
          PlayerPowerCardsTable.playerPowerCardId,
          powerCard.playerPowerCardId,
        ),
      );
  }

  return doubleEdgedSwords.length * 2;
}

export async function extraWind(
  tx = db,
  userId: string,
  powerCardId: number,
): Promise<void> {
  await tx.insert(PlayerPowerCardsTable).values({ userId, powerCardId });
}

// Viral x Rival

export async function getPersistedPlayers(
  tx = db,
): Promise<MatchPlayerOutput[]> {
  const latestMatchDateCTE = tx
    .$with("latest_match_date")
    .as(
      tx
        .select({ createdAt: MatchesTable.createdAt })
        .from(MatchesTable)
        .where(isNotNull(MatchesTable.finishedAt))
        .orderBy(desc(MatchesTable.createdAt))
        .limit(1),
    );

  const persistedMatchesCTE = tx.$with("persisted_matches").as(
    tx
      .with(latestMatchDateCTE)
      .select({ matchId: MatchesTable.matchId })
      .from(MatchesTable)
      .innerJoin(
        MatchPlayersTable,
        eq(MatchPlayersTable.matchId, MatchesTable.matchId),
      )
      .innerJoin(
        PlayerPowerCardsTable,
        eq(PlayerPowerCardsTable.userId, MatchPlayersTable.userId),
      )
      .where(
        and(
          eq(
            MatchesTable.createdAt,
            sql`( SELECT created_at FROM ${latestMatchDateCTE} )`,
          ),
          eq(
            PlayerPowerCardsTable.powerCardId,
            4, // Viral x Rival
          ),
          eq(PlayerPowerCardsTable.status, "active"),
        ),
      ),
  );

  const matchPlayers = await tx
    .with(persistedMatchesCTE)
    .select()
    .from(MatchPlayersTable)
    .where(
      eq(
        MatchPlayersTable.matchId,
        sql`( SELECT ${persistedMatchesCTE.matchId} FROM ${persistedMatchesCTE} )`,
      ),
    );

  console.log("Match Players:", matchPlayers);

  return matchPlayers;
}

export function getPersistedPairs(players: MatchPlayerOutput[]): Player[][] {
  console.log("Getting persisted pairs...");

  const matches = new Map<string, Player[]>([]);

  for (const player of players) {
    if (matches.has(player.matchId)) {
      matches.get(player.matchId)?.push({ userId: player.userId });
      continue;
    }

    matches.set(player.matchId, [{ userId: player.userId }]);
  }

  const pairs = Array.from(matches.values());

  console.log("Persisted Pairs:", pairs);

  return pairs;
}

// Twist of Fate

export async function twistOfFate(
  tx = db,
  currentPlayer: Player,
  playersToSwap: PlayerSwap
): Promise<void> {
  const [isPersisted] = await tx
    .select({ userId: PlayerPowerCardsTable.userId })
    .from(PlayerPowerCardsTable)
    .where(
      and(
        eq(PlayerPowerCardsTable.powerCardId, 4), // Viral x Rival
        eq(PlayerPowerCardsTable.status, "active"),
        or(
          eq(PlayerPowerCardsTable.userId, playersToSwap.current.userId),
          eq(PlayerPowerCardsTable.userId, playersToSwap.selected.userId),
          eq(PlayerPowerCardsTable.userId, currentPlayer.userId),
        ),
      ),
    )
    .limit(1);

  if (isPersisted) {
    console.log("Viral x Rival is active, swapping will be cancelled:", isPersisted);
    return;
  }

  // TODO: Do I need this?
  
  // NOTE:
  // Execute only if the record with the same `matchId` and `userId`
  // doesn't exist.
  // Only the original match of the swapped players need to be stored,
  // so a swapped opponent that has already been swapped before
  // shouldn't be stored.

  //await tx.insert(OriginalMatchPlayersTable).values({
  //  matchPlayerId: currentOpponent.matchPlayerId,
  //  userId: currentOpponent.userId,
  //  matchId: currentOpponent.matchId
  //})
  //
  //await tx.insert(OriginalMatchPlayersTable).values({
  //  matchPlayerId: selectedOpponent.matchPlayerId,
  //  userId: selectedOpponent.userId,
  //  matchId: selectedOpponent.matchId
  //})

  await swapPlayers(tx, playersToSwap);

  console.log("Successfully swapped.")
}

async function swapPlayers(tx = db, player: PlayerSwap): Promise<void> {
  await tx
    .update(MatchPlayersTable)
    .set({
      userId: player.current.userId,
    })
    .where(eq(MatchPlayersTable.matchPlayerId, player.selected.matchPlayerId));

  await tx
    .update(MatchPlayersTable)
    .set({
      userId: player.selected.userId,
    })
    .where(eq(MatchPlayersTable.matchPlayerId, player.current.matchPlayerId));
}
