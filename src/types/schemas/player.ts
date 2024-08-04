import type { SectionsTable } from "@/drizzle/schema";
import { z } from "astro/zod";
import { type InferSelectModel } from "drizzle-orm";

export const SectionSchema = z.object({
	name: z.string(),
	limit: z.number().positive(),
});

export type SectionOutput = InferSelectModel<typeof SectionsTable>;
