import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Don't log - this is normal behavior for non-logged-in visitors
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 10 requests per hour (sensitive operation)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'update_password',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'update_password', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many password update attempts. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Input validation
    if (!currentPassword || !newPassword) {
      await logAuthFailure(user.id, 'update_password', 'Missing required fields', request);
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      await logAuthFailure(user.id, 'update_password', 'Invalid input types', request);
      return NextResponse.json(
        { error: 'Invalid input format' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    if (newPassword.length < 8) {
      await logAuthFailure(user.id, 'update_password', 'New password too short', request);
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    if (newPassword.length > 72) {
      await logAuthFailure(user.id, 'update_password', 'New password too long', request);
      return NextResponse.json(
        { error: 'New password must be less than 72 characters' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      await logAuthFailure(user.id, 'update_password', 'Current password incorrect', request);
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        {
          status: 401,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('[UpdatePassword] Auth update failed');
      await logAuthFailure(user.id, 'update_password', 'Password update failed', request);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Success - password updated
    return NextResponse.json(
      { message: 'Password updated successfully' },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('[UpdatePassword] Error:', error?.type || 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
