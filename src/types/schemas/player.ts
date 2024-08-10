import type {
  PlayerPowerCardsTable,
  PowerCardsTable,
  SectionsTable,
} from "@/drizzle/schema";
import { z } from "astro/zod";
import { type InferSelectModel } from "drizzle-orm";

export const SectionSchema = z.object({
  name: z.string(),
  limit: z.number().positive(),
});

export type SectionOutput = InferSelectModel<typeof SectionsTable>;

export type PowerCardOutput = InferSelectModel<typeof PowerCardsTable>;
export type PlayerPowerCardOutput = InferSelectModel<
  typeof PlayerPowerCardsTable
>;

export type PlayerPowerCard = Pick<
  PowerCardOutput,
  "name" | "imageUrl" | "description"
> &
  Pick<PlayerPowerCardOutput, "playerPowerCardId" | "updatedAt">;
