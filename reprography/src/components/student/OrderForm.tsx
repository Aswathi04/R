'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { FileUpload } from './FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGuest } from '@/components/providers/GuestProvider';
import { Loader2, Printer, Copy, FileText } from 'lucide-react';

export function OrderForm() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { guestId, isGuest } = useGuest();
  
  const [file, setFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [printSides, setPrintSides] = useState<'single' | 'double'>('single');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id || guestId;
  const userEmail = user?.primaryEmailAddress?.emailAddress || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload a file');
      return;
    }

    if (!userId) {
      setError('User identification required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload file to storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || 'Failed to upload file');
      }

      const { fileUrl, fileName, fileType, fileSize } = await uploadResponse.json();

      // 2. Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail,
          isGuest,
          fileUrl,
          fileName,
          fileType,
          fileSize,
          quantity,
          colorMode,
          printSides,
          notes,
        }),
      });

      if (!orderResponse.ok) {
        const orderError = await orderResponse.json();
        throw new Error(orderError.error || 'Failed to create order');
      }

      // 3. Redirect to order history
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          New Print Order
        </CardTitle>
        <CardDescription>
          Upload your file and select your print preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload File
            </label>
            <FileUpload
              onFileSelect={setFile}
              selectedFile={file}
              onClear={() => setFile(null)}
              disabled={isSubmitting}
            />
          </div>

          {/* Print Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Copy className="h-4 w-4 inline mr-1" />
                Copies
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={isSubmitting}
              />
            </div>

            {/* Color Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Color Mode
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={colorMode === 'bw' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setColorMode('bw')}
                  disabled={isSubmitting}
                >
                  B&W
                </Button>
                <Button
                  type="button"
                  variant={colorMode === 'color' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setColorMode('color')}
                  disabled={isSubmitting}
                >
                  Color
                </Button>
              </div>
            </div>
          </div>

          {/* Print Sides */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Print Sides
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={printSides === 'single' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPrintSides('single')}
                disabled={isSubmitting}
              >
                Single Sided
              </Button>
              <Button
                type="button"
                variant={printSides === 'double' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPrintSides('double')}
                disabled={isSubmitting}
              >
                Double Sided
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !file}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Order...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Submit Print Order
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
