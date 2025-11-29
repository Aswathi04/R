import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/guest(.*)',
  '/api/upload(.*)',
  '/api/orders(.*)',
  '/api/notifications(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Protect admin routes
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      const signInUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Check if user email is in admin whitelist
    const userEmail = sessionClaims?.email as string | undefined;
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (userEmail !== adminEmail) {
      // Not an admin, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
