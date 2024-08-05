import { db } from "@/drizzle/db";
import { ArnisSeasonsTable } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export async function getLatestArnisSeason(tx = db) {
	const [latestSeason] = await tx
		.select({ arnisSeasonId: ArnisSeasonsTable.arnisSeasonId })
		.from(ArnisSeasonsTable)
		.where(eq(ArnisSeasonsTable.status, "ongoing"))
		.orderBy(desc(ArnisSeasonsTable.createdAt))
		.limit(1);

	return latestSeason;
}
