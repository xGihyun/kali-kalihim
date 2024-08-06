import { db } from "@/drizzle/db";
import {
	MatchesTable,
	MatchPlayersTable,
	PlayerPowerCardsTable,
} from "@/drizzle/schema";
import type { Player, PlayerScore } from "@/types/player";
import { and, desc, eq, exists, ne, sql } from "drizzle-orm";

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

export async function getPersistedPairs(tx = db): Promise<Player[][]> {
	console.log("Getting persisted pairs...");

	const latestMatchDateCTE = tx
		.$with("latest_match_date")
		.as(
			tx
				.select({ createdAt: MatchesTable.createdAt })
				.from(MatchesTable)
				.where(eq(MatchesTable.status, "done"))
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

	const matches = new Map<string, Player[]>([]);

	for (const matchPlayer of matchPlayers) {
		if (matches.has(matchPlayer.matchId)) {
			matches.get(matchPlayer.matchId)?.push({ userId: matchPlayer.userId });
			continue;
		}

		matches.set(matchPlayer.matchId, [{ userId: matchPlayer.userId }]);
	}

	const pairs = Array.from(matches.values());

	console.log("PERSISTED:", pairs);

	return pairs;
}
