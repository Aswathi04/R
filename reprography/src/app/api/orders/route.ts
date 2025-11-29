import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { OrderInsert } from '@/lib/database.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
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
      notes
    } = body;

    // Validate required fields
    if (!userId || !fileUrl || !fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const orderData: OrderInsert = {
      user_id: userId,
      user_email: userEmail || null,
      is_guest: isGuest || false,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize || null,
      quantity: quantity || 1,
      color_mode: colorMode || 'bw',
      print_sides: printSides || 'single',
      notes: notes || null,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Order creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch orders error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
