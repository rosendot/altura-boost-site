import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is suspended
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_suspended, suspension_reason')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    if (userData?.is_suspended) {
      return NextResponse.json(
        {
          error: 'Account suspended',
          suspended: true,
          suspension_reason: userData.suspension_reason
        },
        { status: 403 }
      );
    }

    // Fetch available jobs (no booster assigned)
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'available')
      .is('booster_id', null)
      .order('created_at', { ascending: false });

    if (jobsError) {
      return NextResponse.json(
        { error: 'Failed to fetch available jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    console.error('Error in /api/jobs/available:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
