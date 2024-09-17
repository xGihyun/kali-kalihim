import { db } from "@/drizzle/db";
import { UsersTable } from "@/drizzle/schema";
import { google, lucia } from "@/lib/auth";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";

type GoogleUserResult = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
};

export async function GET(context: APIContext): Promise<Response> {
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("google_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    console.error("Invalid code or state.");

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

  if (!response.ok) {
    console.error("Failed to fetch Google User.");

    return response;
  }

  const googleUser: GoogleUserResult = await response.json();

  const [existingUser] = await db
    .select({ id: UsersTable.id })
    .from(UsersTable)
    .where(eq(UsersTable.email, googleUser.email));

  let userId: string | undefined = existingUser?.id;

  console.log(googleUser)

  if (!existingUser) {
    console.log("Creating new user:", googleUser.email)

    const [newUser] = await db
      .insert(UsersTable)
      .values({
        email: googleUser.email,
      })
      .returning({ id: UsersTable.id });

    userId = newUser.id;
  }

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  console.log("Session Cookie:", sessionCookie);

  context.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return context.redirect("/");
}
