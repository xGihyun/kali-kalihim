import { google } from "@/lib/auth";
import { generateCodeVerifier, generateState } from "arctic";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["email", "profile"],
  });

  context.cookies.set("code_verifier", codeVerifier, {
    path: "/",
    secure: import.meta.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  context.cookies.set("google_oauth_state", state, {
    path: "/",
    secure: import.meta.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return context.redirect(url.toString());
}
