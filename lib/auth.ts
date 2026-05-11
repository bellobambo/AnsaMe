import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

const SESSION_COOKIE = "ansame_session";
const STATE_COOKIE = "ansame_oauth_state";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const STATE_MAX_AGE_SECONDS = 60 * 10;

export type AuthUser = {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};

type SessionPayload = {
  userId: string;
  exp: number;
};

type StoredUser = {
  _id: ObjectId;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable");
  }

  return secret;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  return Buffer.from(padded.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString(
    "utf8"
  );
}

function sign(value: string) {
  return base64UrlEncode(createHmac("sha256", getAuthSecret()).update(value).digest());
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

export function createSessionToken(userId: string) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifySessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !safeEqual(sign(encodedPayload), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);

  if (!session || !ObjectId.isValid(session.userId)) {
    return null;
  }

  const db = await getDb();
  const user = await db.collection("users").findOne<StoredUser>({
    _id: new ObjectId(session.userId)
  });

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    googleId: user.googleId,
    email: user.email,
    name: user.name,
    picture: user.picture
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/google");
  }

  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Sign in with Google to continue");
  }

  return user;
}

export const authCookies = {
  session: SESSION_COOKIE,
  state: STATE_COOKIE,
  sessionMaxAge: SESSION_MAX_AGE_SECONDS,
  stateMaxAge: STATE_MAX_AGE_SECONDS
};
