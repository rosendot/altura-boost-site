import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { sanitizeString, isValidLength } from '@/lib/security/validation';
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'appeal_submit', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 3 appeal submissions per user per day (prevent spam/abuse)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 3,
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      identifier: 'appeal_submit',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(
        user.id,
        'appeal_submit',
        'Rate limit exceeded',
        request
      );
      return NextResponse.json(
        { error: 'Too many appeal submissions. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Check if user is a suspended booster
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_suspended, can_appeal, appeal_status')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      await logAuthFailure(user.id, 'appeal_submit', 'User not found', request);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (userData.role !== 'booster') {
      await logAuthFailure(user.id, 'appeal_submit', 'User is not a booster', request);
      return NextResponse.json(
        { error: 'Only boosters can submit appeals' },
        { status: 403 }
      );
    }

    if (!userData.is_suspended) {
      await logAuthFailure(user.id, 'appeal_submit', 'User is not suspended', request);
      return NextResponse.json(
        { error: 'Your account is not suspended' },
        { status: 400 }
      );
    }

    if (!userData.can_appeal) {
      await logAuthFailure(user.id, 'appeal_submit', 'User cannot appeal', request);
      return NextResponse.json(
        { error: 'You are not eligible to submit an appeal' },
        { status: 403 }
      );
    }

    if (userData.appeal_status === 'pending') {
      await logAuthFailure(user.id, 'appeal_submit', 'Appeal already pending', request);
      return NextResponse.json(
        { error: 'You already have a pending appeal' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { appeal_text } = body;

    // Validate appeal text
    if (!appeal_text || typeof appeal_text !== 'string' || !appeal_text.trim()) {
      return NextResponse.json(
        { error: 'Appeal text is required' },
        { status: 400 }
      );
    }

    // Validate appeal text length (minimum 50 chars, maximum 5000 chars)
    if (!isValidLength(appeal_text.trim(), 50, 5000)) {
      return NextResponse.json(
        { error: 'Appeal text must be between 50 and 5000 characters' },
        { status: 400 }
      );
    }

    // Sanitize appeal text (XSS prevention)
    const sanitizedAppealText = sanitizeString(appeal_text.trim());

    // Create appeal record
    const { data: appeal, error: appealError } = await supabase
      .from('suspension_appeals')
      .insert({
        user_id: user.id,
        appeal_text: sanitizedAppealText,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appealError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to submit appeal' },
        { status: 500 }
      );
    }

    // Update user's appeal status
    const { error: updateError } = await supabase
      .from('users')
      .update({ appeal_status: 'pending' })
      .eq('id', user.id);

    if (updateError) {
      console.error('User update operation failed');
    }

    // Log successful appeal submission
    await logAdminAction(
      user.id,
      userData.email,
      'appeal_submitted',
      'suspension_appeal',
      appeal.id,
      {
        appeal_text_length: sanitizedAppealText.length,
      },
      request
    );

    return NextResponse.json(
      {
        appeal,
        message: 'Appeal submitted successfully'
      },
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
