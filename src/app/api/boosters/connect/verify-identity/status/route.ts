import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover' as any,
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'identity_verification_status', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 100 status checks per user per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'identity_verification_status',
    });

    if (!rateLimitResult.allowed) {
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
      .select('identity_verification_id, identity_verification_status')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If no verification session exists, return not_started
    if (!userData.identity_verification_id) {
      return NextResponse.json(
        {
          status: userData.identity_verification_status || 'not_started',
          verified: false,
        },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch latest status from Stripe
    const session = await stripe.identity.verificationSessions.retrieve(
      userData.identity_verification_id
    );

    let status = userData.identity_verification_status;

    // Map Stripe status to our status
    // Cast to string to handle all possible Stripe statuses
    const stripeStatus = session.status as string;
    if (stripeStatus === 'verified') {
      status = 'verified';
    } else if (stripeStatus === 'requires_input') {
      status = 'failed';
    } else if (stripeStatus === 'processing' || stripeStatus === 'created') {
      status = 'pending';
    } else if (stripeStatus === 'canceled') {
      status = 'not_started';
    }

    // Update database if status changed
    if (status !== userData.identity_verification_status) {
      await supabase
        .from('users')
        .update({ identity_verification_status: status })
        .eq('id', user.id);
    }

    return NextResponse.json(
      {
        status,
        verified: status === 'verified',
        stripe_status: session.status,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('Identity status check error:', {
      message: error?.message,
      type: error?.type,
      code: error?.code,
    });
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
