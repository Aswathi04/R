'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { OrderHistory } from '@/components/student/OrderHistory';
import { NotificationPrompt } from '@/components/notifications/NotificationPrompt';
import { Button } from '@/components/ui/button';
import { Printer, Plus, Home } from 'lucide-react';
import { useGuest } from '@/components/providers/GuestProvider';
import { registerServiceWorker } from '@/lib/notifications';

export default function GuestOrdersPage() {
  const { guestId, setIsGuest } = useGuest();

  useEffect(() => {
    setIsGuest(true);
    registerServiceWorker();
  }, [setIsGuest]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Printer className="h-6 w-6 text-primary" />
            <span className="font-bold">REPROGRAPHY</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
              Guest Mode
            </span>
            <Link href="/guest/new-order">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Notification Prompt */}
        <div className="mb-6">
          <NotificationPrompt userId={guestId} />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <OrderHistory />
        </div>

        {/* Sign Up Prompt */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Sign up to keep all your orders in one place
          </p>
          <Link href="/sign-up">
            <Button variant="link">Create an Account</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
