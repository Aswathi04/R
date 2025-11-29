'use client';

import { useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePushSubscription } from '@/hooks/usePushSubscription';

interface NotificationPromptProps {
  userId: string | null;
}

export function NotificationPrompt({ userId }: NotificationPromptProps) {
  const { permission, isSubscribed, isLoading, error, subscribe } = usePushSubscription({
    userId,
  });

  const [dismissed, setDismissed] = useState(false);

  // Don't show if already subscribed, permission denied, or dismissed
  if (isSubscribed || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Enable Notifications</p>
            <p className="text-xs text-muted-foreground">
              Get notified when your print is ready for pickup
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            disabled={isLoading}
          >
            <BellOff className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={subscribe}
            disabled={isLoading || !userId}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Enable'
            )}
          </Button>
        </div>
      </CardContent>
      {error && (
        <div className="px-4 pb-3 text-xs text-destructive">
          {error}
        </div>
      )}
    </Card>
  );
}
