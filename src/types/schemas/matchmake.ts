import { z } from "astro/zod";

export const MatchmakeSchema = z.object({
  section_id: z.string(),
  arnis_season_id: z.coerce.number()
})
