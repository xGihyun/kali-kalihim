import type { ArnisSeasonsTable, ArnisTechniquesTable } from "@/drizzle/schema";
import type { InferSelectModel } from "drizzle-orm";

export type ArnisTechniqueOutput = InferSelectModel<typeof ArnisTechniquesTable>;
export type ArnisSeasonOutput = InferSelectModel<typeof ArnisSeasonsTable>;
