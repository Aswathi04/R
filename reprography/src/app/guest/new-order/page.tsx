'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { OrderForm } from '@/components/student/OrderForm';
import { NotificationPrompt } from '@/components/notifications/NotificationPrompt';
import { Button } from '@/components/ui/button';
import { Printer, Home, History } from 'lucide-react';
import { useGuest } from '@/components/providers/GuestProvider';
import { registerServiceWorker } from '@/lib/notifications';

export default function GuestNewOrderPage() {
  const { guestId, setIsGuest } = useGuest();

  useEffect(() => {
    // Set as guest user
    setIsGuest(true);
    
    // Register service worker
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
            <Link href="/guest/orders">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                My Orders
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

        <OrderForm />

        {/* Sign Up Prompt */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Want to track all your orders easily?
          </p>
          <Link href="/sign-up">
            <Button variant="link">Create an Account</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
