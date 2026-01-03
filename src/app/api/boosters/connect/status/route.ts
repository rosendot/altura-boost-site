import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover' as any,
});

export async function GET() {
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
      .select('stripe_connect_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If no Connect account, return not connected
    if (!userData.stripe_connect_id) {
      return NextResponse.json({
        connected: false,
        verified: false,
        details_submitted: false,
      });
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(userData.stripe_connect_id);

    // Get external account (bank account) info
    let bankLast4 = null;
    if (account.external_accounts && account.external_accounts.data.length > 0) {
      const bankAccount = account.external_accounts.data[0] as Stripe.BankAccount;
      bankLast4 = bankAccount.last4;
    }

    return NextResponse.json({
      connected: true,
      verified: account.charges_enabled && account.details_submitted,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      bank_last4: bankLast4,
    });
  } catch (error: any) {
    console.error('Error fetching Connect status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
