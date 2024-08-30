import type { ArnisSeasonsTable, ArnisTechniquesTable } from "@/drizzle/schema";
import type { InferSelectModel } from "drizzle-orm";

export type ArnisTechniqueModel = InferSelectModel<typeof ArnisTechniquesTable>;
export type ArnisSeasonModel = InferSelectModel<typeof ArnisSeasonsTable>;
