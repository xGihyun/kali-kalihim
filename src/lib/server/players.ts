import { db } from "@/drizzle/db";
import {
  PlayerSeasonDetailsTable,
  SectionsTable,
  UserDetailsTable,
} from "@/drizzle/schema";
import type { PlayerLeaderboardResponseData } from "@/lib/types/player";
import { desc, eq } from "drizzle-orm";

export async function getTopPlayers(
  tx = db,
  arnisSeasonId: number,
  limit = 5,
  offset = 0,
): Promise<PlayerLeaderboardResponseData[]> {
  const topPlayers = await tx
    .select({
      userId: UserDetailsTable.userId,
      firstName: UserDetailsTable.firstName,
      middleName: UserDetailsTable.middleName,
      lastName: UserDetailsTable.lastName,
      rating: PlayerSeasonDetailsTable.rating,
      section: {
        name: SectionsTable.name,
      },
    })
    .from(UserDetailsTable)
    .innerJoin(
      PlayerSeasonDetailsTable,
      eq(PlayerSeasonDetailsTable.userId, UserDetailsTable.userId),
    )
    .innerJoin(
      SectionsTable,
      eq(SectionsTable.sectionId, PlayerSeasonDetailsTable.sectionId),
    )
    .where(eq(PlayerSeasonDetailsTable.arnisSeasonId, arnisSeasonId))
    .orderBy(desc(PlayerSeasonDetailsTable.rating))
    .limit(limit);

  return topPlayers;
}
