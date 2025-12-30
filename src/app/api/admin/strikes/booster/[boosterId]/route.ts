import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boosterId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { boosterId } = await params;

    // Fetch all strikes for this booster
    const { data: strikes, error: strikesError } = await supabase
      .from('booster_strikes')
      .select(`
        id,
        reason,
        strike_type,
        severity,
        is_active,
        created_at,
        job_id,
        jobs (
          job_number,
          service_name,
          game_name
        )
      `)
      .eq('booster_id', boosterId)
      .order('created_at', { ascending: false });

    if (strikesError) {
      console.error('Error fetching strikes:', strikesError);
      return NextResponse.json(
        { error: 'Failed to fetch strikes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ strikes: strikes || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/strikes/booster/[boosterId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
