import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const pages = ["/", "/Authenticate", "/awaitingApprovalPage"];
const authPages = [
  "/images",
  "/Home",
  "/videos",
  "/trash",
  "/settings",
  "/administration",
  '/album'
];

async function isValidToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    await jwtVerify(token, secret);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  let validToken = false;

  if (token) {
    validToken = await isValidToken(token);
  }

  // User has a valid token but is trying to access login/public pages
  if (pages.includes(request.nextUrl.pathname) && validToken) {
    return NextResponse.redirect(new URL("/Home", request.url));
  }

  // User has no token OR expired/invalid token
  if (authPages.includes(request.nextUrl.pathname) && !validToken) {
    const response = NextResponse.redirect(new URL("/", request.url));
    // Remove expired/invalid cookie
    response.cookies.delete("auth_token");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/images",
    "/Home",
    "/videos",
    "/trash",
    "/settings",
    "/administration",
    '/album',
    "/Authenticate", 
    "/awaitingApprovalPage"
  ],
};
