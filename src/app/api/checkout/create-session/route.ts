import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('email, full_name, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get cart items from request body
    const body = await request.json();
    const { cartItems } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Fetch service details from database to ensure prices are current
    const serviceIds = cartItems.map((item: any) => item.serviceId);
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, price, game_id, games(name)')
      .in('id', serviceIds)
      .eq('active', true);

    if (servicesError || !services) {
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }

    // Build line items for Stripe Checkout
    const lineItems = cartItems.map((cartItem: any) => {
      const service = services.find((s) => s.id === cartItem.serviceId);
      if (!service) {
        throw new Error(`Service ${cartItem.serviceId} not found or inactive`);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.name,
            description: service.games?.name || 'Gaming Service',
          },
          unit_amount: Math.round(service.price * 100), // Convert to cents
        },
        quantity: cartItem.quantity || 1,
      };
    });

    // Create or retrieve Stripe customer
    let stripeCustomerId = userData.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        customer_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
