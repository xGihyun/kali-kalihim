import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/drizzle/db";
import {
  EmailVerificationsTable,
  UserSessionsTable,
  UsersTable,
} from "@/drizzle/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, UserSessionsTable, UsersTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      emailVerified: attributes.emailVerified,
      email: attributes.email,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      emailVerified: boolean;
    };
  }
}

import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { eq } from "drizzle-orm";

// TODO: Dependency inject `db`
export async function generateEmailVerificationCode(
  userId: string,
  email: string,
): Promise<string> {
  await db
    .delete(EmailVerificationsTable)
    .where(eq(EmailVerificationsTable.userId, UsersTable.id));

  const code = generateRandomString(6, alphabet("0-9"));

  await db.insert(EmailVerificationsTable).values({
    userId: userId,
    email,
    code,
    expiresAt: createDate(new TimeSpan(15, "m")), // 15 minutes
  });

  return code;
}
