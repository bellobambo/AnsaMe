import { NextResponse } from "next/server";
import { authCookies, createOAuthState } from "@/lib/auth";

function getBaseUrl(request: Request) {
  return process.env.APP_URL || new URL(request.url).origin;
}

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Google sign-in is not available right now. Please try again later." },
      { status: 500 }
    );
  }

  const state = createOAuthState();
  const redirectUri = `${getBaseUrl(request)}/api/auth/google/callback`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(authCookies.state, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: authCookies.stateMaxAge,
    path: "/"
  });

  return response;
}
