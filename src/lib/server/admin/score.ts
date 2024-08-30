import { db } from "@/drizzle/db";
import { PlayerSeasonDetailsTable } from "@/drizzle/schema";
import type { PlayerScore } from "@/lib/types/player";
import { and, eq, sql } from "drizzle-orm";
import { ancientsDomain, doubleEdgedSword } from "../power-cards";

export async function updateRating(
	tx = db,
	arnisSeasonId: number,
	player: PlayerScore,
	scoreDiff: number,
): Promise<void> {
	const isProtected = await ancientsDomain(tx, player, scoreDiff);

	if (isProtected) {
		return;
	}

	let [playerSeasonDetails] = await tx
		.select({
			playerSeasonDetailId: PlayerSeasonDetailsTable.playerSeasonDetailId,
		})
		.from(PlayerSeasonDetailsTable)
		.where(
			and(
				eq(PlayerSeasonDetailsTable.userId, player.userId),
				eq(PlayerSeasonDetailsTable.arnisSeasonId, arnisSeasonId),
			),
		);

	const multiplier = await doubleEdgedSword(tx, player);

	await tx
		.update(PlayerSeasonDetailsTable)
		.set({
			rating: sql`rating + ${scoreDiff * multiplier}`,
		})
		.where(
			eq(
				PlayerSeasonDetailsTable.playerSeasonDetailId,
				playerSeasonDetails.playerSeasonDetailId,
			),
		);

	console.log("Updated rating:", player.userId, "New Rating:", scoreDiff);
}
