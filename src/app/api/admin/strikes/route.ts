import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { booster_id, job_id, reason } = body;

    // Validate required fields
    if (!booster_id || !job_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: booster_id, job_id, reason' },
        { status: 400 }
      );
    }

    // Verify booster exists
    const { data: booster, error: boosterError } = await supabase
      .from('users')
      .select('id, role, strike_count, is_suspended')
      .eq('id', booster_id)
      .single();

    if (boosterError || !booster) {
      return NextResponse.json(
        { error: 'Booster not found' },
        { status: 404 }
      );
    }

    if (booster.role !== 'booster') {
      return NextResponse.json(
        { error: 'User is not a booster' },
        { status: 400 }
      );
    }

    // Verify job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, order_id')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Create strike record
    const { data: strike, error: strikeError } = await supabase
      .from('booster_strikes')
      .insert({
        booster_id,
        job_id,
        order_id: job.order_id,
        reason: reason.trim(),
        strike_type: 'poor_quality',
        severity: 'moderate',
        is_active: true,
        issued_by: user.id,
      })
      .select()
      .single();

    if (strikeError) {
      console.error('Error creating strike:', strikeError);
      return NextResponse.json(
        { error: 'Failed to create strike' },
        { status: 500 }
      );
    }

    // The database trigger should automatically:
    // 1. Increment users.strike_count
    // 2. Set users.is_suspended = true if strike_count >= 3
    // 3. Set users.can_appeal = true if suspended
    // 4. Set users.suspended_at timestamp if suspended

    return NextResponse.json({
      strike,
      message: 'Strike issued successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/admin/strikes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
