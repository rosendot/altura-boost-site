import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'appeals_list', 'No authenticated user', request);
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
      await logAuthFailure(user.id, 'appeals_list', 'User is not admin', request);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Rate limiting: 100 requests per admin per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'appeals_list',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(
        user.id,
        'appeals_list',
        'Rate limit exceeded',
        request
      );
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch all appeals with user information
    const { data: appeals, error: appealsError } = await supabase
      .from('suspension_appeals')
      .select(`
        id,
        user_id,
        appeal_text,
        status,
        submitted_at,
        reviewed_at,
        reviewed_by,
        admin_notes,
        users!user_id (
          email,
          full_name,
          is_suspended,
          suspension_reason,
          suspended_at
        )
      `)
      .order('submitted_at', { ascending: false });

    if (appealsError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch appeals' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { appeals: appeals || [] },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Unexpected error occurred');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
