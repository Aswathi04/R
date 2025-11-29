'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { OrderForm } from '@/components/student/OrderForm';
import { OrderHistory } from '@/components/student/OrderHistory';
import { NotificationPrompt } from '@/components/notifications/NotificationPrompt';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Printer, Plus, History, Home } from 'lucide-react';
import { registerServiceWorker } from '@/lib/notifications';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Register service worker on page load
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Notification Prompt */}
        <div className="mb-6">
          <NotificationPrompt userId={user.id} />
        </div>

        <Tabs defaultValue="new-order" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="new-order" className="gap-2">
              <Plus className="h-4 w-4" />
              New Order
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-order">
            <OrderForm />
          </TabsContent>

          <TabsContent value="history">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Order History</h2>
              <OrderHistory />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
