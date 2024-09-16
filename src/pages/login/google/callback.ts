import { db } from "@/drizzle/db";
import { UsersTable } from "@/drizzle/schema";
import { google, lucia } from "@/lib/auth";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";

export async function GET(context: APIContext): Promise<Response> {
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("google_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    console.error("No code or state.");

    return new Response(null, {
      status: 400,
    });
  }

  const codeVerifier = context.cookies.get("code_verifier");

  if (!codeVerifier) {
    console.error("Code verifier not found.");

    return new Response(null, {
      status: 400,
    });
  }

  const tokens = await google.validateAuthorizationCode(
    code,
    codeVerifier.value,
  );
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );

  const user: GoogleUserResult = await response.json();

  console.log("User:", user);

  const [existingUser] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, user.email));

  // TODO: Insert user on the database
  if (!existingUser) {
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  context.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return context.redirect("/");
}

type GoogleUserResult = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
};
