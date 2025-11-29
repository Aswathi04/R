'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { OrderCard } from './OrderCard';
import { Order, OrderStatus } from '@/lib/database.types';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Loader2,
  Package,
  Clock,
  Printer,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(true);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelUserId, setCancelUserId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Enable real-time updates with sound
  useRealtimeOrders({
    playSound: true,
    onNewOrder: (order) => {
      console.log('New order received:', order.id);
    }
  });

  // Fetch all orders
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json() as Promise<Order[]>;
    },
    refetchInterval: 30000, // Backup refetch every 30s
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus, userId }: { orderId: string; newStatus: string; userId: string }) => {
      const response = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus, userId }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, userId, reason }: { orderId: string; userId: string; reason: string }) => {
      const response = await fetch('/api/admin/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, userId, reason }),
      });
      if (!response.ok) throw new Error('Failed to cancel order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setCancelOrderId(null);
      setCancelUserId(null);
      setCancelReason('');
    },
  });

  const handleUpdateStatus = (orderId: string, newStatus: string, userId: string) => {
    updateStatusMutation.mutate({ orderId, newStatus, userId });
  };

  const handleCancelClick = (orderId: string, userId: string) => {
    setCancelOrderId(orderId);
    setCancelUserId(userId);
  };

  const handleCancelConfirm = () => {
    if (cancelOrderId && cancelUserId) {
      cancelOrderMutation.mutate({
        orderId: cancelOrderId,
        userId: cancelUserId,
        reason: cancelReason || 'Cancelled by admin',
      });
    }
  };

  // Filter orders based on search and tab
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.file_name.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.user_email?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [orders, activeTab, searchQuery]);

  // Count orders by status
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  }, [orders]);

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          <p>Failed to load orders. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-green-600">Live Connection Active</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Connection Lost</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-[600px]">
          <TabsTrigger value="all" className="gap-1">
            <Package className="h-4 w-4" />
            All
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {statusCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-4 w-4" />
            Pending
            {statusCounts.pending > 0 && (
              <Badge variant="pending" className="ml-1 h-5 px-1.5">
                {statusCounts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processing" className="gap-1">
            <Printer className="h-4 w-4" />
            Printing
            {statusCounts.processing > 0 && (
              <Badge variant="processing" className="ml-1 h-5 px-1.5">
                {statusCounts.processing}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            <CheckCircle className="h-4 w-4" />
            Done
            <Badge variant="completed" className="ml-1 h-5 px-1.5">
              {statusCounts.completed}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-1">
            <XCircle className="h-4 w-4" />
            Cancelled
          </TabsTrigger>
        </TabsList>

        {/* Orders List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'No orders match your search'
                    : `No ${activeTab === 'all' ? '' : activeTab} orders`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onCancel={handleCancelClick}
                  isUpdating={
                    updateStatusMutation.isPending ||
                    cancelOrderMutation.isPending
                  }
                />
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Cancel Modal */}
      {cancelOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please provide a reason for cancelling this order:
              </p>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelOrderId(null);
                    setCancelUserId(null);
                    setCancelReason('');
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelConfirm}
                  disabled={cancelOrderMutation.isPending}
                >
                  {cancelOrderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Cancel Order'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
