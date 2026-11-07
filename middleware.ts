import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health(.*)',
]);

export default function middleware(request: any, event: any) {
  const hasClerkKeys = Boolean(
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY) &&
    process.env.CLERK_SECRET_KEY
  );

  if (!hasClerkKeys) {
    console.error(
      '❌ [Clerk Middleware Error]: Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY in environment variables.'
    );
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
