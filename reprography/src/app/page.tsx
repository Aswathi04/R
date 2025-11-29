import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, User, UserCircle, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">REPROGRAPHY</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            College Print Shop
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Submit your print orders online and get real-time updates. 
            No more waiting in line or wondering if your files were received.
          </p>
        </div>

        {/* Access Options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Guest Access */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <UserCircle className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Continue as Guest</CardTitle>
              <CardDescription>
                Quick access without creating an account. 
                You can still receive notifications!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/guest/new-order">
                <Button size="lg" variant="outline" className="w-full">
                  Start Printing
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Registered User */}
          <Card className="hover:shadow-lg transition-shadow border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <User className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Sign In / Sign Up</CardTitle>
              <CardDescription>
                Create an account to track all your orders 
                and manage preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <Link href="/sign-up">
                  <Button size="lg" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </SignedOut>
            </CardContent>
          </Card>
        </div>

        {/* Admin Link */}
        <div className="text-center mt-12">
          <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Store Admin Access
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Real-Time Updates</h3>
            <p className="text-sm text-muted-foreground">
              Get instant notifications when your print is being processed and ready for pickup.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Easy Upload</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your PDFs and images. We support all common file formats.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Custom Options</h3>
            <p className="text-sm text-muted-foreground">
              Choose color or B&W, single or double-sided, and specify the number of copies.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 REPROGRAPHY v2.0 - College Print Shop Management System</p>
        </div>
      </footer>
    </div>
  );
}
