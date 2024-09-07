import { z } from "astro/zod";

export const MatchmakeSchema = z.object({
  sectionId: z.string(),
  arnisSeasonId: z.coerce.number(),
  arnisTechniqueId: z.coerce.number(),
});

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

export type MatchmakeInput = z.infer<typeof MatchmakeSchema>;
export type MatchResultInput = z.infer<typeof MatchResultSchema>;
export type MatchScoreInput = z.infer<typeof MatchScoreSchema>;
