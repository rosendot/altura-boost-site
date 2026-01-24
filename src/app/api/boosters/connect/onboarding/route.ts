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
    console.log('[Stripe Onboarding] Starting onboarding request');
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('[Stripe Onboarding] Auth failed:', userError?.message);
      await logAuthFailure(null, 'stripe_onboarding', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Stripe Onboarding] User authenticated:', user.id);

    // Rate limiting: 20 onboarding requests per user per hour (prevent abuse)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'stripe_onboarding',
    });

    if (!rateLimitResult.allowed) {
      console.log('[Stripe Onboarding] Rate limit exceeded for user:', user.id);
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
      console.log('[Stripe Onboarding] User data fetch failed:', userDataError?.message);
      await logAuthFailure(user.id, 'stripe_onboarding', 'User not found', request);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[Stripe Onboarding] User data:', {
      email: userData.email,
      role: userData.role,
      booster_approval_status: userData.booster_approval_status,
      identity_verification_status: userData.identity_verification_status,
      has_stripe_connect_id: !!userData.stripe_connect_id,
    });

    // Check if user is an approved booster
    if (userData.role !== 'booster' || userData.booster_approval_status !== 'approved') {
      console.log('[Stripe Onboarding] User not approved booster');
      await logAuthFailure(user.id, 'stripe_onboarding', 'User is not an approved booster', request);
      return NextResponse.json(
        { error: 'Only approved boosters can connect bank accounts' },
        { status: 403 }
      );
    }

    // Check if identity verification is complete (required before bank connection)
    if (userData.identity_verification_status !== 'verified') {
      console.log('[Stripe Onboarding] Identity not verified:', userData.identity_verification_status);
      await logAuthFailure(user.id, 'stripe_onboarding', 'Identity not verified', request);
      return NextResponse.json(
        { error: 'Please complete identity verification before connecting your bank account' },
        { status: 400 }
      );
    }

    let accountId = userData.stripe_connect_id;

    // If no Connect account exists, create one
    if (!accountId) {
      console.log('[Stripe Onboarding] Creating new Stripe Connect account');
      // Parse name into first/last if available
      const nameParts = userData.full_name?.trim().split(' ') || [];
      const firstName = nameParts[0] || undefined;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      console.log('[Stripe Onboarding] Name parts:', { firstName, lastName });

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
          tos_acceptance: {
            service_agreement: 'recipient',
          },
        });

        accountId = account.id;
        console.log('[Stripe Onboarding] Created Stripe account:', accountId);
      } catch (stripeError: any) {
        console.error('[Stripe Onboarding] Stripe account creation failed:', {
          message: stripeError?.message,
          type: stripeError?.type,
          code: stripeError?.code,
          param: stripeError?.param,
        });
        throw stripeError;
      }

      // Save Connect account ID to database
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_connect_id: accountId })
        .eq('id', user.id);

      if (updateError) {
        console.error('[Stripe Onboarding] Database update failed:', updateError.message);
        return NextResponse.json({ error: 'Failed to save Connect account' }, { status: 500 });
      }

      console.log('[Stripe Onboarding] Saved Connect ID to database');

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
    } else {
      console.log('[Stripe Onboarding] Using existing Stripe account:', accountId);
    }

    // Create account link for onboarding
    console.log('[Stripe Onboarding] Creating account link for:', accountId);
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=earnings`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=earnings&connected=true`,
        type: 'account_onboarding',
      });

      console.log('[Stripe Onboarding] Account link created successfully');

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
      console.error('[Stripe Onboarding] Account link creation failed:', {
        message: linkError?.message,
        type: linkError?.type,
        code: linkError?.code,
        param: linkError?.param,
      });
      throw linkError;
    }
  } catch (error: any) {
    console.error('[Stripe Onboarding] Unexpected error:', {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      stack: error?.stack,
    });

    // Handle specific Stripe errors
    if (error?.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: error.message || 'Invalid request to payment processor' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create onboarding link' }, { status: 500 });
  }
}
