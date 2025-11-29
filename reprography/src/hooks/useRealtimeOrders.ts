'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Order } from '@/lib/database.types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeOrdersOptions {
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
  playSound?: boolean;
}

export const useRealtimeOrders = (options: UseRealtimeOrdersOptions = {}) => {
  const queryClient = useQueryClient();
  const { onNewOrder, onOrderUpdate, playSound = false } = options;

  useEffect(() => {
    // Open a websocket channel
    const channel = supabase
      .channel('admin-dashboard-live')
      .on<Order>(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'orders' },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          console.log('Realtime event:', payload.eventType, payload);

          // Play sound if new order inserted
          if (payload.eventType === 'INSERT' && playSound) {
            const audio = new Audio('/sounds/notification_ping.mp3');
            audio.play().catch(e => console.log('Audio permission needed:', e));
            
            if (onNewOrder && payload.new) {
              onNewOrder(payload.new as Order);
            }
          }

          if (payload.eventType === 'UPDATE' && onOrderUpdate && payload.new) {
            onOrderUpdate(payload.new as Order);
          }

          // Invalidate cache so React Query re-fetches the fresh list
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          queryClient.invalidateQueries({ queryKey: ['user-orders'] });
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onNewOrder, onOrderUpdate, playSound]);
};
