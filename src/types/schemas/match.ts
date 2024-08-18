import type {
  MatchesTable,
  MatchPlayersTable,
  RubricsTable,
} from "@/drizzle/schema";
import { z } from "astro/zod";
import type { InferSelectModel } from "drizzle-orm";
import type { FullNameInput } from "./auth";
import type { ArnisTechniqueOutput } from "./arnis";
import type { UserDetailsOutput } from "../user";

export const MatchmakeSchema = z.object({
  sectionId: z.string(),
  arnisSeasonId: z.coerce.number(),
  arnisTechniqueId: z.coerce.number(),
});

export type MatchmakeInput = z.infer<typeof MatchmakeSchema>;

const RubricScoreSchema = z.object({
  rubricId: z.coerce.number(),
  score: z.coerce.number(),
});

const MatchScoreSchema = z.object({
  matchPlayerId: z.string(),
  rubricScores: RubricScoreSchema.array(),
  userId: z.string(),
});

const MatchCommentSchema = z.object({
  userId: z.string(),
  content: z.string(),
});

export const MatchResultSchema = z.object({
  results: MatchScoreSchema.array(),
  comment: MatchCommentSchema,
  matchId: z.string(),
  arnisSeasonId: z.coerce.number(),
});

export type MatchResultInput = z.infer<typeof MatchResultSchema>;
export type MatchScoreInput = z.infer<typeof MatchScoreSchema>;

export type MatchPlayerOutput = InferSelectModel<typeof MatchPlayersTable>;
export type RubricOutput = InferSelectModel<typeof RubricsTable>;
export type MatchOutput = InferSelectModel<typeof MatchesTable>;

export type MatchPlayer = Omit<MatchPlayerOutput, "matchId"> & FullNameInput;
export type MatchPlayerScore = MatchPlayer & { score: number };

export type MatchOpponentResponseData = Omit<MatchPlayer, "matchPlayerId"> &
  Pick<UserDetailsOutput, "avatarUrl" | "bannerUrl"> & { rating: number };

export type UpcomingMatchResponseData = {
  opponent: MatchOpponentResponseData;
  arnisTechniques: Pick<ArnisTechniqueOutput, "name" | "techniqueType">[];
  matchId: string;
};

export enum Verdict {
  Victory = "victory",
  Defeat = "defeat",
  Draw = "draw",
}

export type PreviousMatchResponseData = UpcomingMatchResponseData & {
  verdict: Verdict;
  finishedAt: Date
};

export type MatchResponseData = {
  players: MatchPlayerScore[];
  arnisTechniques: Pick<ArnisTechniqueOutput, "name" | "techniqueType">[];
  finishedAt: Date;
  matchId: string;
};
