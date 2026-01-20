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
      await logAuthFailure(null, 'stripe_status', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 100 status checks per user per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'stripe_status',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(
        user.id,
        'stripe_status',
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
      .select('role, stripe_connect_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      await logAuthFailure(user.id, 'stripe_status', 'User not found', request);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is a booster or admin
    if (userData.role !== 'booster' && userData.role !== 'admin') {
      await logAuthFailure(user.id, 'stripe_status', 'User is not a booster or admin', request);
      return NextResponse.json(
        { error: 'Only boosters can check Connect status' },
        { status: 403 }
      );
    }

    // Admins don't need Stripe verification - return as fully verified
    if (userData.role === 'admin') {
      return NextResponse.json(
        {
          connected: true,
          verified: true,
          details_submitted: true,
          charges_enabled: true,
          is_admin: true,
        },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // If no Connect account, return not connected
    if (!userData.stripe_connect_id) {
      return NextResponse.json(
        {
          connected: false,
          verified: false,
          details_submitted: false,
        },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(userData.stripe_connect_id);

    // Get external account (bank account) info
    let bankLast4 = null;
    if (account.external_accounts && account.external_accounts.data.length > 0) {
      const bankAccount = account.external_accounts.data[0] as Stripe.BankAccount;
      bankLast4 = bankAccount.last4;
    }

    return NextResponse.json(
      {
        connected: true,
        verified: account.charges_enabled && account.details_submitted,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        bank_last4: bankLast4,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('Unexpected error occurred');
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
