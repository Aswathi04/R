import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        error: 'Not logged in',
        adminEmail: process.env.ADMIN_EMAIL || 'NOT SET',
      });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    const userEmail = (primaryEmail?.emailAddress || user.emailAddresses[0]?.emailAddress)?.toLowerCase().trim();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

    return NextResponse.json({
      userId,
      userEmail,
      adminEmail: adminEmail || 'NOT SET',
      emailsMatch: userEmail === adminEmail,
      allEmails: user.emailAddresses.map(e => e.emailAddress),
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      adminEmail: process.env.ADMIN_EMAIL || 'NOT SET',
    });
  }
}
