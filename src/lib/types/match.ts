import type { InferSelectModel } from "drizzle-orm";
import type { ArnisTechniqueModel } from "../types/arnis";
import type { UserDetailsModel } from "../types/user";
import type {
  MatchesTable,
  MatchPlayersTable,
  RubricsTable,
} from "@/drizzle/schema";
import type { FullNameInput } from "../schemas/auth";

export type MatchPlayerModel = InferSelectModel<typeof MatchPlayersTable>;
export type RubricModel = InferSelectModel<typeof RubricsTable>;
export type MatchModel = InferSelectModel<typeof MatchesTable>;

export type MatchPlayer = Omit<MatchPlayerModel, "matchId"> & FullNameInput;
export type MatchPlayerScore = MatchPlayer & { score: number };

export type MatchOpponentResponseData = Omit<MatchPlayer, "matchPlayerId"> &
  Pick<UserDetailsModel, "avatarUrl" | "bannerUrl"> & { rating: number };

export type UpcomingMatchResponseData = {
  opponent: MatchOpponentResponseData;
  arnisTechniques: Pick<ArnisTechniqueModel, "name" | "techniqueType">[];
  matchId: string;
};

export enum Verdict {
  Victory = "victory",
  Defeat = "defeat",
  Draw = "draw",
}

export type PreviousMatchResponseData = UpcomingMatchResponseData & {
  verdict: Verdict;
  finishedAt: Date;
};

export type MatchResponseData = {
  players: MatchPlayerScore[];
  arnisTechniques: Pick<ArnisTechniqueModel, "name" | "techniqueType">[];
  finishedAt: Date;
  matchId: string;
};
