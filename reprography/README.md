# REPROGRAPHY v2.0 - College Print Shop Management System

A real-time college printing store management system built with Next.js 14+, Supabase, and Clerk authentication.

## Features

- **Dual-Role Access**: Dedicated interfaces for Students (Submission) and Admins (Fulfillment)
- **Live Admin Dashboard**: Auto-updates via WebSockets with sound alerts for new orders
- **Smart Push Notifications**: Browser-based notifications for order status updates
- **Universal File Upload**: Support for PDF, JPG, and PNG with validation
- **Guest & Registered Access**: Full functionality available without account creation

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Real-Time**: Supabase Realtime (WebSockets)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Authentication**: Clerk
- **Notifications**: Web Push API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd reprography
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Admin
ADMIN_EMAIL=your_admin_email@example.com

# Web Push (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

5. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Create a storage bucket named `print-files`
   - Enable Realtime for the `orders` table

6. Generate VAPID keys for push notifications:
```bash
npx web-push generate-vapid-keys
```

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/Signup routes
│   ├── (student)/        # Student dashboard
│   ├── admin/            # Admin dashboard
│   ├── guest/            # Guest order flow
│   └── api/              # API routes
├── components/
│   ├── admin/            # Admin components
│   ├── notifications/    # Push notification components
│   ├── providers/        # Context providers
│   ├── student/          # Student components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
└── lib/                  # Utilities and configurations
```

## Database Schema

### Orders Table
Stores print orders with file info, print specs, and status.

### Push Subscriptions Table
Stores browser push notification subscriptions.

### Admin Access Table
Whitelist for admin users.

## Deployment

Deploy to Vercel:

```bash
npm run build
vercel deploy
```

## Adding Sound Files

For the notification sound feature, add an MP3 file to:
```
public/sounds/notification_ping.mp3
```

## Adding Icons

Add PWA icons to:
```
public/icons/icon-192x192.png
public/icons/icon-512x512.png
public/icons/badge-96x96.png
```

## License

MIT

## Author

College Reprography Team - 2025
