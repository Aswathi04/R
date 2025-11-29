import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@reprography.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, userId, reason } = await request.json();

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 1. Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelled by admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Cancel error:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      );
    }

    // 2. Find user's push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    // 3. Send cancellation notification
    if (subscriptions && subscriptions.length > 0) {
      const title = '❌ Order Cancelled';
      const body = reason 
        ? `Your order was cancelled: ${reason}` 
        : 'Your order has been cancelled. Please contact the store for details.';

      const notifications = subscriptions.map(async (sub) => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        try {
          await webpush.sendNotification(
            pushConfig,
            JSON.stringify({ 
              title, 
              body,
              url: '/dashboard'
            })
          );
        } catch (pushError: any) {
          if (pushError.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
          console.error('Push notification error:', pushError);
        }
      });

      await Promise.allSettled(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
