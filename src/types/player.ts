import type { FullNameInput } from "./schemas/auth";
import type { MatchPlayerOutput } from "./schemas/match";
import type { SectionOutput } from "./schemas/player";

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
  current: MatchPlayerOutput;
  selected: MatchPlayerOutput;
};

export type PlayerLeaderboardResponseData = FullNameInput &
  PlayerRating & { section: Pick<SectionOutput, "name"> };
