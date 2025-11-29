'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { useGuest } from '@/components/providers/GuestProvider';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/database.types';
import { getTimeAgo, formatFileSize } from '@/lib/utils';
import { FileText, Clock, Printer, Copy, Loader2, Package } from 'lucide-react';

export function OrderHistory() {
  const { user } = useUser();
  const { guestId, isGuest } = useGuest();
  
  const userId = user?.id || guestId;

  // Enable real-time updates
  useRealtimeOrders();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['user-orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const response = await fetch(`/api/orders?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      return response.json() as Promise<Order[]>;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'pending' | 'processing' | 'completed' | 'cancelled'> = {
      pending: 'pending',
      processing: 'processing',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    
    const labels: Record<string, string> = {
      pending: 'Pending',
      processing: 'Printing',
      completed: 'Ready',
      cancelled: 'Cancelled',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load orders. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Submit your first print order to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Left - File Info */}
            <div className="flex-1 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{order.file_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(order.created_at)}
                    {order.file_size && (
                      <>
                        <span>•</span>
                        {formatFileSize(order.file_size)}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle - Specs */}
            <div className="flex items-center gap-4 px-4 py-2 sm:py-4 bg-muted/30">
              <div className="flex items-center gap-1 text-sm">
                <Printer className="h-4 w-4 text-muted-foreground" />
                <span>{order.color_mode === 'bw' ? 'B&W' : 'Color'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{order.print_sides === 'single' ? 'Single' : 'Double'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span>{order.quantity}x</span>
              </div>
            </div>

            {/* Right - Status */}
            <div className="flex items-center justify-between sm:justify-center p-4 sm:px-6">
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3">
              <strong>Notes:</strong> {order.notes}
            </div>
          )}

          {/* Cancellation Reason */}
          {order.status === 'cancelled' && order.cancellation_reason && (
            <div className="px-4 pb-4 text-sm text-destructive border-t pt-3">
              <strong>Reason:</strong> {order.cancellation_reason}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
