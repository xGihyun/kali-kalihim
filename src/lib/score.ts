import { db } from "@/drizzle/db";
import { PlayerSeasonDetailsTable } from "@/drizzle/schema";
import { and, eq, sql } from "drizzle-orm";

type PlayerScore = {
	userId: string;
	score: number;
};

export async function updateRating(tx = db, arnisSeasonId: number, player: PlayerScore, scoreDiff: number) {
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

	await tx
		.update(PlayerSeasonDetailsTable)
		.set({
			rating: sql`rating + ${scoreDiff}`,
		})
		.where(
			eq(
				PlayerSeasonDetailsTable.playerSeasonDetailId,
				playerSeasonDetails.playerSeasonDetailId,
			),
		);

  console.log("Updated rating:", player.userId, "New Rating:", scoreDiff)
}
