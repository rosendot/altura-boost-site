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
      await logAuthFailure(null, 'stripe_onboarding', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 20 onboarding requests per user per hour (prevent abuse)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'stripe_onboarding',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(
        user.id,
        'stripe_onboarding',
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
      .select('email, role, booster_approval_status, stripe_connect_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      await logAuthFailure(user.id, 'stripe_onboarding', 'User not found', request);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is an approved booster
    if (userData.role !== 'booster' || userData.booster_approval_status !== 'approved') {
      await logAuthFailure(user.id, 'stripe_onboarding', 'User is not an approved booster', request);
      return NextResponse.json(
        { error: 'Only approved boosters can connect bank accounts' },
        { status: 403 }
      );
    }

    let accountId = userData.stripe_connect_id;

    // If no Connect account exists, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: userData.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
      });

      accountId = account.id;

      // Save Connect account ID to database
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_connect_id: accountId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Database operation failed');
        return NextResponse.json(
          { error: 'Failed to save Connect account' },
          { status: 500 }
        );
      }

      // Log account creation
      await logAdminAction(
        user.id,
        userData.email,
        'stripe_connect_account_created',
        'stripe_connect',
        user.id,
        {
          stripe_account_id: accountId,
        },
        request
      );
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=earnings`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=earnings&connected=true`,
      type: 'account_onboarding',
    });

    // Log onboarding link generation
    await logAdminAction(
      user.id,
      userData.email,
      'stripe_onboarding_link_created',
      'stripe_connect',
      user.id,
      {
        has_existing_account: !!userData.stripe_connect_id,
      },
      request
    );

    return NextResponse.json(
      { url: accountLink.url },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('Unexpected error occurred');
    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}
