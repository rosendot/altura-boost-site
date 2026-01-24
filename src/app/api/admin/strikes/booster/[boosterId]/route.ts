import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';
import { isValidUUID } from '@/lib/security/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boosterId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'strikes_list', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      await logAuthFailure(user.id, 'strikes_list', 'User is not admin', request);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Rate limiting: 100 requests per admin per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000,
      identifier: 'strikes_list',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'strikes_list', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { boosterId } = await params;

    // Validate booster ID format
    if (!isValidUUID(boosterId)) {
      return NextResponse.json({ error: 'Invalid booster ID format' }, { status: 400 });
    }

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
      console.error('[BoosterStrikes] Query failed');
      return NextResponse.json(
        { error: 'Failed to fetch strikes' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { strikes: strikes || [] },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('[BoosterStrikes] Error:', error?.type || 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
