import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Google } from "arctic";
import { db } from "@/drizzle/db";
import { UserSessionsTable, UsersTable } from "@/drizzle/schema";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "astro:env/server";
import { PUBLIC_URL } from "astro:env/client";
import type { UserRole } from "./types/user";

const adapter = new DrizzlePostgreSQLAdapter(db, UserSessionsTable, UsersTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      role: attributes.role,
      email: attributes.email,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  role: UserRole;
  email: string;
}

const REDIRECT_URI = new URL(`${PUBLIC_URL}/login/google/callback`);

export const google = new Google(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI.href,
);
