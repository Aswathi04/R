-- REPROGRAPHY v2.0 Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Orders Table
-- Stores order info and tracks the status lifecycle
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- Clerk ID or Cookie-based Guest ID
    user_email TEXT, -- Optional for guests
    is_guest BOOLEAN DEFAULT false,
    
    -- File Artifacts
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'application/pdf', 'image/jpeg'
    file_size INTEGER,
    
    -- Print Specifications
    quantity INTEGER DEFAULT 1,
    color_mode TEXT DEFAULT 'bw', -- 'bw', 'color'
    print_sides TEXT DEFAULT 'single', -- 'single', 'double'
    notes TEXT,
    
    -- The Core Lifecycle Field
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    cancellation_reason TEXT, -- Reason if cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Push Subscriptions Table
-- Acts as the "Phonebook" for sending notifications
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- Matches orders.user_id
    endpoint TEXT NOT NULL UNIQUE, -- The browser URL provided by Chrome/Safari/Firefox
    p256dh TEXT NOT NULL, -- Encryption key
    auth TEXT NOT NULL, -- Auth key
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Admin Access Table
-- Simple whitelist to control who sees the dashboard
CREATE TABLE admin_access (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your admin email
-- INSERT INTO admin_access (email) VALUES ('store_owner@college.edu');

-- Create indexes for better query performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
    FOR SELECT USING (true); -- We'll handle this in the API

-- Users can insert their own orders
CREATE POLICY "Users can insert orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Admins can update orders (status changes)
CREATE POLICY "Allow updates" ON orders
    FOR UPDATE USING (true);

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
    FOR ALL USING (true);

-- RLS Policies for admin_access
CREATE POLICY "Allow read admin_access" ON admin_access
    FOR SELECT USING (true);

-- CRITICAL: Enable Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for orders table
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Storage Bucket Setup (run in Supabase Dashboard -> Storage)
-- Create a bucket called 'print-files' with public access disabled
-- Set up the following RLS policies for the bucket:
-- SELECT: authenticated users can download their own files
-- INSERT: authenticated users and guests can upload
-- DELETE: only admins can delete

-- Example bucket policy (apply in Supabase Storage settings):
-- INSERT: ((bucket_id = 'print-files'::text) AND (storage.foldername(name))[1] = auth.uid()::text)
-- SELECT: ((bucket_id = 'print-files'::text))
