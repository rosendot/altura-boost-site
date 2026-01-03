import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = createServiceRoleClient();

  try {
    const customerId = session.metadata?.customer_id;

    if (!customerId) {
      console.error('No customer_id in session metadata');
      return;
    }

    // Retrieve full session with line items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'],
    });

    const lineItems = fullSession.line_items?.data || [];

    // Calculate totals
    const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0;
    const tax = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0;
    const total = session.amount_total ? session.amount_total / 100 : 0;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        subtotal: subtotal,
        tax_amount: tax,
        total_price: total,
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return;
    }

    // Create order items
    for (const item of lineItems) {
      const product = item.price?.product;
      const productName = typeof product === 'object' && 'name' in product
        ? product.name
        : 'Unknown Product';

      const pricePerUnit = item.price?.unit_amount ? item.price.unit_amount / 100 : 0;
      const quantity = item.quantity || 1;

      await supabase.from('order_items').insert({
        order_id: order.id,
        service_name: productName,
        game_name: typeof product === 'object' && 'description' in product
          ? product.description || 'Gaming Service'
          : 'Gaming Service',
        quantity: quantity,
        price_per_unit: pricePerUnit,
        total_price: pricePerUnit * quantity,
      });
    }

  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Future: Add logic to notify customer via email
  // Future: Log failure for analytics
  // Future: Update pending orders
}
