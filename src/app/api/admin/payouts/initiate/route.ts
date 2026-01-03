import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';
import { isValidUUID } from '@/lib/security/validation';

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
      await logAuthFailure(null, 'payout_initiate', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData || userData.role !== 'admin') {
      await logAuthFailure(user.id, 'payout_initiate', 'User is not admin', request);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Rate limiting: 50 requests per admin per hour (financial operations)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 50,
      windowMs: 60 * 60 * 1000,
      identifier: 'payout_initiate',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'payout_initiate', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get job ID from request body
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Validate job ID format
    if (!isValidUUID(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 });
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, users!jobs_booster_id_fkey(stripe_connect_id, full_name, email)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify job is completed
    if (job.status !== 'completed') {
      return NextResponse.json(
        { error: 'Job must be completed before payout can be initiated' },
        { status: 400 }
      );
    }

    // Verify booster exists
    if (!job.booster_id) {
      return NextResponse.json({ error: 'Job has no assigned booster' }, { status: 400 });
    }

    const booster = job.users;

    // Check if payout already exists for this job
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('job_id', jobId)
      .maybeSingle();

    if (existingTransaction) {
      return NextResponse.json(
        {
          error: `Payout already ${existingTransaction.status} for this job`,
          transactionId: existingTransaction.id,
        },
        { status: 400 }
      );
    }

    // Verify booster has Connect account
    if (!booster.stripe_connect_id) {
      return NextResponse.json(
        { error: 'Booster has not connected their bank account' },
        { status: 400 }
      );
    }

    // Verify booster's Stripe account is active
    let account;
    try {
      account = await stripe.accounts.retrieve(booster.stripe_connect_id);

      if (!account.charges_enabled || !account.details_submitted) {
        return NextResponse.json(
          { error: 'Booster bank account is not yet verified by Stripe' },
          { status: 400 }
        );
      }
    } catch (stripeError: any) {
      console.error('Payment account verification failed');
      return NextResponse.json(
        { error: 'Invalid or deleted Stripe Connect account' },
        { status: 500 }
      );
    }

    // Create pending transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        booster_id: job.booster_id,
        job_id: jobId,
        amount: job.payout_amount,
        status: 'pending',
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to create transaction record' },
        { status: 500 }
      );
    }

    // Initiate Stripe transfer
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(job.payout_amount * 100), // Convert to cents
        currency: 'usd',
        destination: booster.stripe_connect_id,
        description: `Payout for Job ${job.job_number}`,
        metadata: {
          job_id: jobId,
          job_number: job.job_number,
          booster_id: job.booster_id,
          transaction_id: transaction.id,
        },
      });

      // Update transaction with Stripe payout ID and mark as completed
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          stripe_payout_id: transfer.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Database operation failed');
        await logAdminAction(
          user.id,
          userData.email,
          'payout_db_update_failed',
          'transaction',
          transaction.id,
          { job_id: jobId, transfer_id: transfer.id },
          request
        );
        return NextResponse.json(
          {
            warning: 'Transfer succeeded but failed to update database. Please verify manually.',
            transferId: transfer.id,
            transactionId: transaction.id,
          },
          { status: 207 }
        );
      }

      // Log successful payout
      await logAdminAction(
        user.id,
        userData.email,
        'payout_initiated',
        'transaction',
        transaction.id,
        {
          job_id: jobId,
          booster_id: job.booster_id,
          amount: job.payout_amount,
          transfer_id: transfer.id,
        },
        request
      );

      return NextResponse.json(
        {
          success: true,
          transactionId: transaction.id,
          transferId: transfer.id,
          amount: job.payout_amount,
          booster: {
            name: booster.full_name || booster.email,
            email: booster.email,
          },
        },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    } catch (stripeError: any) {
      console.error('Payment processing failed');

      // Mark transaction as failed
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      // Log failed payout
      await logAdminAction(
        user.id,
        userData.email,
        'payout_failed',
        'transaction',
        transaction.id,
        { job_id: jobId, booster_id: job.booster_id },
        request
      );

      return NextResponse.json(
        { error: 'Failed to process payout' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error occurred');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
