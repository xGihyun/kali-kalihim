import { z } from "astro/zod";

export const SectionSchema = z.object({
  name: z.string(),
  limit: z.number().positive(),
});
