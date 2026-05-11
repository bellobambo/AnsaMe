import { NextResponse } from "next/server";
import { authCookies } from "@/lib/auth";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(authCookies.session);

  return response;
}
