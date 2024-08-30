import type { FullNameInput } from "../schemas/auth";
import type { MatchPlayerModel } from "../types/match";
import { type InferSelectModel } from "drizzle-orm";
import type {
  PlayerPowerCardsTable,
  PowerCardsTable,
  SectionsTable,
} from "@/drizzle/schema";

export type Player = {
  userId: string;
};

export type PlayerRating = {
  rating: number;
  userId: string;
};

export type PlayerScore = {
  userId: string;
  score: number;
};

export type PlayerSwap = {
  current: MatchPlayerModel;
  selected: MatchPlayerModel;
};

export type PlayerLeaderboardResponseData = FullNameInput &
  PlayerRating & { section: Pick<SectionModel, "name"> };

export type SectionModel = InferSelectModel<typeof SectionsTable>;
export type PlayerPowerCardModel = InferSelectModel<
  typeof PlayerPowerCardsTable
>;

export type PowerCardModel = InferSelectModel<typeof PowerCardsTable>;

export type PlayerPowerCard = Pick<
  PowerCardModel,
  "name" | "imageUrl" | "description"
> &
  Pick<PlayerPowerCardModel, "playerPowerCardId" | "updatedAt">;
