import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/", "/demo", "/sign-in", "/sign-up", "/api/webhooks", "/api/v1"];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => p !== "/" && pathname.startsWith(p));
}

// Only protect with Clerk if we have a real publishable key
const CLERK_PK = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isRealClerkKey = CLERK_PK.startsWith("pk_") && CLERK_PK.length > 30 && !CLERK_PK.includes("placeholder");

let clerkHandler: ((req: NextRequest) => any) | null = null;

if (isRealClerkKey) {
  try {
    const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");
    const isPublicRoute = createRouteMatcher([
      "/",
      "/demo(.*)",
      "/sign-in(.*)",
      "/sign-up(.*)",
      "/api/webhooks/(.*)",
      "/api/v1/(.*)",
    ]);
    clerkHandler = clerkMiddleware((auth: any, request: NextRequest) => {
      if (!isPublicRoute(request)) {
        auth().protect();
      }
    });
  } catch (e) {
    console.warn("Clerk middleware init failed:", e);
  }
}

export default async function middleware(req: NextRequest) {
  // If Clerk is configured, use it
  if (clerkHandler) {
    return (clerkHandler as any)(req);
  }
  // Otherwise: allow public routes, block protected ones with a friendly redirect
  if (!isPublicPath(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
