import { db } from "@/drizzle/db";
import { PlayerSeasonDetailsTable, UsersTable } from "@/drizzle/schema";
import { PlayerSeasonSchema, RegisterSchema } from "@/types/schemas/auth";
import { ActionError, defineAction } from "astro:actions";

export const server = {
  register: defineAction({
    input: RegisterSchema,
    handler: async (data) => {
      console.log("Register:", data);

      const { confirm_password, ...userData } = data;

      if (userData.password !== confirm_password) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Passwords don't match.",
        });
      }

      await db.insert(UsersTable).values(userData);

      console.log("Successfully registered:", userData.email);
    },
  }),
  player_season_register: defineAction({
    input: PlayerSeasonSchema,
    handler: async (data) => {
      // TODO: Get latest arnis season

      await db.insert(PlayerSeasonDetailsTable).values(data);

      console.log("Successfully entered the new season.");
    },
  }),
};
