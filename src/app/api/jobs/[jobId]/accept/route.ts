import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data to check Stripe Connect status
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('stripe_connect_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if booster has a connected and verified Stripe account
    if (!userData.stripe_connect_id) {
      return NextResponse.json(
        { error: 'Please connect your bank account in the Earnings tab before accepting jobs' },
        { status: 403 }
      );
    }

    // Verify the Stripe account is fully set up
    try {
      const account = await stripe.accounts.retrieve(userData.stripe_connect_id);

      if (!account.charges_enabled || !account.details_submitted) {
        return NextResponse.json(
          { error: 'Your bank account is still being verified by Stripe. Please check back soon.' },
          { status: 403 }
        );
      }
    } catch (stripeError) {
      console.error('Error verifying Stripe account:', stripeError);
      return NextResponse.json(
        { error: 'Unable to verify your bank account. Please reconnect in the Earnings tab.' },
        { status: 500 }
      );
    }

    const { jobId } = await params;

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/jobs/[jobId]/accept:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
