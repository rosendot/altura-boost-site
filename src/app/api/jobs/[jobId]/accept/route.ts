import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { isValidUUID } from '@/lib/security/validation';
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover' as any,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'job_accept', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 30 job accepts per hour (prevent spam)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 30,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'job_accept',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'job_accept', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { jobId } = await params;

    // Validate jobId format
    if (!isValidUUID(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID format' },
        { status: 400 }
      );
    }

    // Get user data to check Stripe Connect status
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('email, stripe_connect_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      await logAuthFailure(user.id, 'job_accept', 'User not found', request);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if booster has a connected and verified Stripe account
    if (!userData.stripe_connect_id) {
      await logAuthFailure(user.id, 'job_accept', 'No Stripe Connect account', request);
      return NextResponse.json(
        { error: 'Please connect your bank account in the Earnings tab before accepting jobs' },
        { status: 403 }
      );
    }

    // Verify the Stripe account is fully set up
    try {
      const account = await stripe.accounts.retrieve(userData.stripe_connect_id);

      if (!account.charges_enabled || !account.details_submitted) {
        await logAuthFailure(user.id, 'job_accept', 'Stripe account not verified', request);
        return NextResponse.json(
          { error: 'Your bank account is still being verified by Stripe. Please check back soon.' },
          { status: 403 }
        );
      }
    } catch (stripeError) {
      console.error('Stripe verification failed');
      return NextResponse.json(
        { error: 'Unable to verify your bank account. Please reconnect in the Earnings tab.' },
        { status: 500 }
      );
    }

    // Atomically update job only if it's still available
    // This prevents race conditions when multiple boosters try to accept the same job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({
        booster_id: user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('status', 'available')
      .is('booster_id', null)
      .select()
      .single();

    if (updateError || !updatedJob) {
      // Job either doesn't exist or was already accepted by another booster
      return NextResponse.json(
        { error: 'Job is no longer available' },
        { status: 400 }
      );
    }

    // Log successful job acceptance
    await logAdminAction(
      user.id,
      userData.email,
      'job_accepted',
      'job',
      jobId,
      {
        job_number: updatedJob.job_number,
      },
      request
    );

    return NextResponse.json(
      { success: true },
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
