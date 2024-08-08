import { roleEnum } from "@/drizzle/schema";
import { z } from "astro/zod";

const userRoleEnum = z.enum(roleEnum.enumValues);

type UserRole = z.infer<typeof userRoleEnum>;

export type UserRoleCount = {
  role: UserRole;
  count: number;
};
