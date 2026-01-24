import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'stripe_disconnect', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 disconnections per user per day (prevent abuse)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 10,
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      identifier: 'stripe_disconnect',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'stripe_disconnect', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get user data to verify role and email
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('email, role, stripe_connect_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      await logAuthFailure(user.id, 'stripe_disconnect', 'User not found', request);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is a booster
    if (userData.role !== 'booster') {
      await logAuthFailure(user.id, 'stripe_disconnect', 'User is not a booster', request);
      return NextResponse.json({ error: 'Only boosters can disconnect bank accounts' }, { status: 403 });
    }

    // Remove stripe_connect_id from database
    const { error: updateError } = await supabase
      .from('users')
      .update({ stripe_connect_id: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Disconnect] Database update failed');
      return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
    }

    // Log successful disconnection
    await logAdminAction(
      user.id,
      userData.email,
      'stripe_connect_disconnected',
      'stripe_connect',
      user.id,
      {
        previous_connect_id: userData.stripe_connect_id,
      },
      request
    );

    return NextResponse.json({ success: true }, { headers: getRateLimitHeaders(rateLimitResult) });
  } catch (error: any) {
    console.error('[Disconnect] Error:', error?.type || 'unknown');
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
  }
}
