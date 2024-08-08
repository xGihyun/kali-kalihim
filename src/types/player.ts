import type { FullNameInput } from "./schemas/auth";
import type { MatchPlayerOutput } from "./schemas/match";

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

export type PlayerLeaderboard = FullNameInput & PlayerRating;
