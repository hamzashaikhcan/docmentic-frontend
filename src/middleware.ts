// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const url = req.nextUrl;

  // If not authenticated, redirect to login
  if (!isAuth) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 👇 This defines what routes the middleware applies to
export const config = {
  matcher: [
    "/analytics",
    "/categories",
    "/documents",
    "/documents/new",
    "/documents/:path*", // catch all nested under /documents/*
    "/settings/:path*",
  ],
};
