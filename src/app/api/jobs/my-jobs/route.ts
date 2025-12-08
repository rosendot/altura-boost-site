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

    // Fetch jobs assigned to this booster
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('booster_id', user.id)
      .order('accepted_at', { ascending: false });

    if (jobsError) {
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    console.error('Error in /api/jobs/my-jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
