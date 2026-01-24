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
      await logAuthFailure(user.id, 'stripe_onboarding', 'Rate limit exceeded', request);
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
      .select('email, full_name, role, booster_approval_status, stripe_connect_id, identity_verification_status')
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

    // Check if identity verification is complete (required before bank connection)
    if (userData.identity_verification_status !== 'verified') {
      await logAuthFailure(user.id, 'stripe_onboarding', 'Identity not verified', request);
      return NextResponse.json(
        { error: 'Please complete identity verification before connecting your bank account' },
        { status: 400 }
      );
    }

    let accountId = userData.stripe_connect_id;

    // If no Connect account exists, create one
    if (!accountId) {
      // Parse name into first/last if available
      const nameParts = userData.full_name?.trim().split(' ') || [];
      const firstName = nameParts[0] || undefined;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      try {
        const account = await stripe.accounts.create({
          type: 'express',
          email: userData.email,
          capabilities: {
            transfers: { requested: true },
          },
          business_type: 'individual',
          business_profile: {
            url: 'https://alturaboost.com',
            mcc: '7994', // Video game arcades/gaming
            product_description: 'Gaming boost services contractor for Altura Boost',
          },
          individual: {
            email: userData.email,
            ...(firstName && { first_name: firstName }),
            ...(lastName && { last_name: lastName }),
          },
        });

        accountId = account.id;
      } catch (stripeError: any) {
        // Log Stripe errors for debugging (server-side only)
        console.error('[Onboarding] Stripe error:', stripeError?.type, stripeError?.code);
        throw stripeError;
      }

      // Save Connect account ID to database
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_connect_id: accountId })
        .eq('id', user.id);

      if (updateError) {
        console.error('[Onboarding] Database update failed');
        return NextResponse.json({ error: 'Failed to save Connect account' }, { status: 500 });
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
    try {
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
    } catch (linkError: any) {
      console.error('[Onboarding] Account link error:', linkError?.type, linkError?.code);
      throw linkError;
    }
  } catch (error: any) {
    // Log error type/code for debugging without exposing details
    console.error('[Onboarding] Error:', error?.type || 'unknown', error?.code || '');

    // Handle specific Stripe errors with user-friendly messages
    if (error?.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: error.message || 'Invalid request to payment processor' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create onboarding link' }, { status: 500 });
  }
}
