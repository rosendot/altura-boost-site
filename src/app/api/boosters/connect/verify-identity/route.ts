import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover' as any,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'identity_verification', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 verification requests per user per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'identity_verification',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(
        user.id,
        'identity_verification',
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

    // Get user data
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('email, full_name, role, booster_approval_status, identity_verification_status')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      await logAuthFailure(user.id, 'identity_verification', 'User not found', request);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is an approved booster
    if (userData.role !== 'booster' || userData.booster_approval_status !== 'approved') {
      await logAuthFailure(user.id, 'identity_verification', 'User is not an approved booster', request);
      return NextResponse.json(
        { error: 'Only approved boosters can verify identity' },
        { status: 403 }
      );
    }

    // Check if already verified
    if (userData.identity_verification_status === 'verified') {
      return NextResponse.json(
        { error: 'Identity already verified' },
        { status: 400 }
      );
    }

    // Create Stripe Identity verification session
    // Using the existing verification flow with Document + ID Number + Selfie
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      options: {
        document: {
          require_matching_selfie: true,
          require_id_number: true,
        },
      },
      provided_details: {
        email: userData.email,
      },
      metadata: {
        user_id: user.id,
        user_email: userData.email,
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=earnings&identity_verified=true`,
    });

    // Save verification session ID to database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        identity_verification_id: verificationSession.id,
        identity_verification_status: 'pending',
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to save verification session ID:', updateError);
      return NextResponse.json(
        { error: 'Failed to save verification session' },
        { status: 500 }
      );
    }

    // Log verification session creation
    await logAdminAction(
      user.id,
      userData.email,
      'identity_verification_started',
      'identity_verification',
      user.id,
      {
        verification_session_id: verificationSession.id,
      },
      request
    );

    return NextResponse.json(
      { url: verificationSession.url },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('Identity verification error:', {
      message: error?.message,
      type: error?.type,
      code: error?.code,
    });
    return NextResponse.json(
      { error: 'Failed to create verification session' },
      { status: 500 }
    );
  }
}
