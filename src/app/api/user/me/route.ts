import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user data from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, created_at, total_earnings, booster_approval_status')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      userData,
    });
  } catch (error) {
    console.error('Error in /api/user/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
