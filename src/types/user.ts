import { roleEnum, UserDetailsTable } from "@/drizzle/schema";
import { z } from "astro/zod";
import type { InferSelectModel } from "drizzle-orm";

const userRoleEnum = z.enum(roleEnum.enumValues);

type UserRole = z.infer<typeof userRoleEnum>;

export type UserRoleCount = {
  role: UserRole;
  count: number;
};

export type UserDetailsOutput = InferSelectModel<typeof UserDetailsTable>