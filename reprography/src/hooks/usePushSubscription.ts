'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  registerServiceWorker, 
  subscribeToPush, 
  checkNotificationPermission,
  requestNotificationPermission 
} from '@/lib/notifications';

interface UsePushSubscriptionOptions {
  userId: string | null;
  autoSubscribe?: boolean;
}

export const usePushSubscription = ({ userId, autoSubscribe = false }: UsePushSubscriptionOptions) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check current permission status
    const currentPermission = checkNotificationPermission();
    setPermission(currentPermission);
    
    // Register service worker
    registerServiceWorker();
    
    // Check if already subscribed
    if ('serviceWorker' in navigator && currentPermission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (autoSubscribe && userId && permission === 'granted' && !isSubscribed) {
      subscribe();
    }
  }, [autoSubscribe, userId, permission, isSubscribed]);

  const subscribe = useCallback(async () => {
    if (!userId) {
      setError('User ID is required for notifications');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const newPermission = await requestNotificationPermission();
        setPermission(newPermission);
        
        if (newPermission !== 'granted') {
          setError('Notification permission denied');
          setIsLoading(false);
          return false;
        }
      }

      // Subscribe to push
      const success = await subscribeToPush(userId);
      setIsSubscribed(success);
      
      if (!success) {
        setError('Failed to subscribe to notifications');
      }
      
      setIsLoading(false);
      return success;
    } catch (err) {
      setError('An error occurred while subscribing');
      setIsLoading(false);
      return false;
    }
  }, [userId, permission]);

  return {
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe
  };
};
