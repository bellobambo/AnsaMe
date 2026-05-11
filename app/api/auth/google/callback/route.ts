import { NextResponse } from "next/server";
import { authCookies, createSessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function getBaseUrl(request: Request) {
  return process.env.APP_URL || new URL(request.url).origin;
}

async function exchangeCodeForToken(request: Request, code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth environment variables");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${getBaseUrl(request)}/api/auth/google/callback`,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error("Google token exchange failed");
  }

  return response.json() as Promise<{ access_token: string }>;
}

async function fetchGoogleUser(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error("Unable to fetch Google user profile");
  }

  return response.json() as Promise<GoogleUserInfo>;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${authCookies.state}=`))
      ?.split("=")[1];

    if (!code || !state || !storedState || state !== storedState) {
      throw new Error("Invalid Google sign-in response");
    }

    const token = await exchangeCodeForToken(request, code);
    const googleUser = await fetchGoogleUser(token.access_token);

    if (!googleUser.sub || !googleUser.email) {
      throw new Error("Google profile is missing required details");
    }

    const now = new Date().toISOString();
    const db = await getDb();
    const result = await db.collection("users").findOneAndUpdate(
      { googleId: googleUser.sub },
      {
        $set: {
          googleId: googleUser.sub,
          email: googleUser.email,
          emailVerified: Boolean(googleUser.email_verified),
          name: googleUser.name || googleUser.email,
          picture: googleUser.picture,
          provider: "google",
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true, returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Unable to save user profile");
    }

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(authCookies.session, createSessionToken(result._id.toString()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: authCookies.sessionMaxAge,
      path: "/"
    });
    response.cookies.delete(authCookies.state);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sign in with Google" },
      { status: 400 }
    );
  }
}
