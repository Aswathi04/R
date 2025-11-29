import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
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
    const { userId } = await auth();
    
    if (!userId) {
      const signInUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Fetch user from Clerk to get email
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // Get primary email or first email
    const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    const userEmail = (primaryEmail?.emailAddress || user.emailAddresses[0]?.emailAddress)?.toLowerCase().trim();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    
    // Debug logging (check Vercel Function logs)
    console.log('=== ADMIN AUTH DEBUG ===');
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);
    console.log('Admin Email from env:', adminEmail);
    console.log('Emails match:', userEmail === adminEmail);
    console.log('========================');
    
    if (!adminEmail) {
      console.log('ERROR: ADMIN_EMAIL environment variable is not set!');
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    if (userEmail !== adminEmail) {
      console.log('Access denied: email mismatch');
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    console.log('Admin access granted!');
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
