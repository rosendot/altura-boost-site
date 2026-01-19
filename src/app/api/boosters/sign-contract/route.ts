import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'sign_contract', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 sign attempts per user per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'sign_contract',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'sign_contract', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get user data
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role, contract_signed_at')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      await logAuthFailure(user.id, 'sign_contract', 'User not found', request);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is a booster
    if (userData.role !== 'booster') {
      await logAuthFailure(user.id, 'sign_contract', 'User is not a booster', request);
      return NextResponse.json(
        { error: 'Only boosters can sign the contractor agreement' },
        { status: 403 }
      );
    }

    // Check if already signed
    if (userData.contract_signed_at) {
      return NextResponse.json(
        { error: 'Contract has already been signed', already_signed: true },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        { error: 'Contract version is required' },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    // Update user with contract signature
    const { error: updateError } = await supabase
      .from('users')
      .update({
        contract_signed_at: new Date().toISOString(),
        contract_version: version,
        contract_ip_address: ipAddress,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update contract signature:', updateError);
      return NextResponse.json(
        { error: 'Failed to record contract signature' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contract signed successfully',
        signed_at: new Date().toISOString(),
        version,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Sign contract error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
