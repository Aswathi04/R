'use client';

import { Order } from '@/lib/database.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTimeAgo, formatFileSize } from '@/lib/utils';
import { 
  FileText, 
  Download, 
  Play, 
  CheckCircle, 
  XCircle,
  Clock,
  Printer,
  Copy,
  Image,
  File
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string, userId: string) => void;
  onCancel: (orderId: string, userId: string) => void;
  isUpdating?: boolean;
}

export function OrderCard({ order, onUpdateStatus, onCancel, isUpdating }: OrderCardProps) {
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
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    return (
      <Badge variant={variants[status] || 'default'} className="text-xs">
        {labels[status] || status}
      </Badge>
    );
  };

  const getFileIcon = () => {
    if (order.file_type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (order.file_type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const handleDownload = () => {
    window.open(order.file_url, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left Section - File Info */}
          <div className="flex-1 p-4 flex items-start gap-4">
            <div className="p-3 bg-muted rounded-lg shrink-0">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(order.status)}
                {order.is_guest && (
                  <Badge variant="outline" className="text-xs">Guest</Badge>
                )}
              </div>
              <h3 className="font-medium truncate" title={order.file_name}>
                {order.file_name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(order.created_at)}
                </span>
                {order.file_size && (
                  <span>{formatFileSize(order.file_size)}</span>
                )}
              </div>
              {order.user_email && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {order.user_email}
                </p>
              )}
            </div>
          </div>

          {/* Middle Section - Specs */}
          <div className="flex items-center justify-center gap-4 px-4 py-3 bg-muted/30 border-t lg:border-t-0 lg:border-l">
            <div className="text-center">
              <Printer className="h-4 w-4 mx-auto text-muted-foreground" />
              <span className="text-xs mt-1 block">
                {order.color_mode === 'bw' ? 'B&W' : 'Color'}
              </span>
            </div>
            <div className="text-center">
              <FileText className="h-4 w-4 mx-auto text-muted-foreground" />
              <span className="text-xs mt-1 block">
                {order.print_sides === 'single' ? 'Single' : 'Double'}
              </span>
            </div>
            <div className="text-center">
              <Copy className="h-4 w-4 mx-auto text-muted-foreground" />
              <span className="text-xs mt-1 block">{order.quantity}x</span>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 p-4 border-t lg:border-t-0 lg:border-l justify-center lg:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              title="Download File"
            >
              <Download className="h-4 w-4" />
            </Button>

            {order.status === 'pending' && (
              <>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => onUpdateStatus(order.id, 'processing', order.user_id)}
                  disabled={isUpdating}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(order.id, order.user_id)}
                  disabled={isUpdating}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}

            {order.status === 'processing' && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onUpdateStatus(order.id, 'completed', order.user_id)}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(order.id, order.user_id)}
                  disabled={isUpdating}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Notes Section */}
        {order.notes && (
          <div className="px-4 py-3 bg-muted/20 border-t text-sm">
            <strong className="text-muted-foreground">Notes:</strong> {order.notes}
          </div>
        )}

        {/* Cancellation Reason */}
        {order.status === 'cancelled' && order.cancellation_reason && (
          <div className="px-4 py-3 bg-destructive/10 border-t text-sm text-destructive">
            <strong>Reason:</strong> {order.cancellation_reason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
