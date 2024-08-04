import { z } from "astro/zod";

export const MatchmakeSchema = z.object({
  sectionId: z.string(),
  arnisSeasonId: z.coerce.number(),
  arnisTechniqueId: z.coerce.number(),
});

export type MatchmakeInput = z.infer<typeof MatchmakeSchema>;

const RubricScoreSchema = z.object({
  rubricId: z.coerce.number(),
  score: z.number(),
});

const MatchScoreSchema = z.object({
  matchPlayerId: z.string(),
  rubricScores: RubricScoreSchema.array(),
});

const MatchCommentSchema = z.object({
  userId: z.string(),
  content: z.string()
})

export const MatchResultSchema = z.object({
  results: MatchScoreSchema.array(),
  comment: MatchCommentSchema,
  matchId: z.string()
});
