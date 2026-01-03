import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover' as any,
});

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is an approved booster
    if (userData.role !== 'booster' || userData.booster_approval_status !== 'approved') {
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
        console.error('Error saving Connect account ID:', updateError);
        return NextResponse.json(
          { error: 'Failed to save Connect account' },
          { status: 500 }
        );
      }
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=earnings`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=earnings&connected=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Error creating Connect onboarding link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}
