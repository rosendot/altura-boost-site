import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { calculateBatches, calculateBatchPayout, type PricingTier } from '@/lib/pricing/calculateTieredPrice';

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
      console.error('Webhook missing signature');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Rate limiting for webhooks: 500 requests per hour (high limit for webhook traffic)
    // Use IP-based rate limiting since webhooks don't have user context
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] || 'unknown';

    const rateLimitResult = checkRateLimit(ip, {
      maxRequests: 500,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'stripe_webhook',
    });

    if (!rateLimitResult.allowed) {
      console.error('Webhook rate limit exceeded');
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Verify webhook signature (critical security check for webhooks)
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'identity.verification_session.verified':
        await handleIdentityVerified(event.data.object as Stripe.Identity.VerificationSession);
        break;

      case 'identity.verification_session.requires_input':
        await handleIdentityFailed(event.data.object as Stripe.Identity.VerificationSession);
        break;

      default:
        break;
    }

    return NextResponse.json(
      { received: true },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('Unexpected error occurred');
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

interface OrderItemData {
  serviceId: string;
  quantity: number;
  pricingType: string;
  unitCount?: number;
  calculatedPrice: number;
  calculatedPayout: number;
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = createServiceRoleClient();

  try {
    const customerId = session.metadata?.customer_id;
    const orderItemsJson = session.metadata?.order_items;

    if (!customerId) {
      console.error('No customer_id in session metadata');
      return;
    }

    // Parse order items from metadata
    let orderItemsData: OrderItemData[] = [];
    if (orderItemsJson) {
      try {
        orderItemsData = JSON.parse(orderItemsJson);
      } catch (e) {
        console.error('Failed to parse order_items metadata:', e);
      }
    }

    // Retrieve full session with line items for fallback info
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

    // Create order items and jobs
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      const orderItemData = orderItemsData[i];

      const product = item.price?.product;
      const productName = typeof product === 'object' && 'name' in product
        ? product.name
        : 'Unknown Product';
      const gameName = typeof product === 'object' && 'description' in product
        ? product.description || 'Gaming Service'
        : 'Gaming Service';

      const pricePerUnit = item.price?.unit_amount ? item.price.unit_amount / 100 : 0;
      const quantity = item.quantity || 1;

      // Determine if this is a tiered service
      const isTiered = orderItemData?.pricingType === 'tiered';
      const unitCount = orderItemData?.unitCount;
      const calculatedPrice = orderItemData?.calculatedPrice || pricePerUnit * quantity;
      const calculatedPayout = orderItemData?.calculatedPayout || 0;

      // Create order item
      const { data: orderItem, error: orderItemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          service_id: orderItemData?.serviceId || null,
          service_name: productName,
          game_name: gameName,
          quantity: quantity,
          price_per_unit: isTiered ? calculatedPrice : pricePerUnit,
          total_price: calculatedPrice,
          unit_count: unitCount || null,
          calculated_price: calculatedPrice,
          calculated_payout: calculatedPayout,
        })
        .select()
        .single();

      if (orderItemError || !orderItem) {
        console.error('Error creating order item:', orderItemError);
        continue;
      }

      // Create jobs for this order item
      if (isTiered && unitCount && orderItemData?.serviceId) {
        // Fetch service details for batch size and pricing tiers
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .select(`
            batch_size, unit_name,
            pricing_tiers:service_pricing_tiers(*)
          `)
          .eq('id', orderItemData.serviceId)
          .single();

        if (serviceError || !service) {
          console.error('Error fetching service for job creation:', serviceError);
          continue;
        }

        const batchSize = service.batch_size || 10;
        const tiers: PricingTier[] = (service.pricing_tiers || []).map((t: any) => ({
          min_quantity: t.min_quantity,
          max_quantity: t.max_quantity,
          price_per_unit: Number(t.price_per_unit),
          booster_payout_per_unit: Number(t.booster_payout_per_unit),
        }));

        // Calculate batches
        const batches = calculateBatches(unitCount, batchSize, tiers);
        const totalBatches = batches.length;

        // Create a job for each batch
        for (const batch of batches) {
          const jobStatus = batch.batchNumber === 1 ? 'available' : 'queued';

          await supabase.from('jobs').insert({
            order_id: order.id,
            order_item_id: orderItem.id,
            service_id: orderItemData.serviceId,
            status: jobStatus,
            booster_payout: batch.payout,
            batch_sequence: batch.batchNumber,
            total_batches: totalBatches,
            unit_count: batch.unitCount,
          });
        }
      } else if (orderItemData?.serviceId) {
        // Fixed pricing - create single job per quantity
        const { data: service } = await supabase
          .from('services')
          .select('booster_payout')
          .eq('id', orderItemData.serviceId)
          .single();

        const payout = service?.booster_payout || 0;

        for (let q = 0; q < quantity; q++) {
          await supabase.from('jobs').insert({
            order_id: order.id,
            order_item_id: orderItem.id,
            service_id: orderItemData.serviceId,
            status: 'available',
            booster_payout: payout,
            batch_sequence: q + 1,
            total_batches: quantity,
            unit_count: 1,
          });
        }
      }
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

async function handleIdentityVerified(session: Stripe.Identity.VerificationSession) {
  const supabase = createServiceRoleClient();

  try {
    const userId = session.metadata?.user_id;

    if (!userId) {
      console.error('No user_id in identity verification session metadata');
      return;
    }

    // Update user's identity verification status
    const { error } = await supabase
      .from('users')
      .update({ identity_verification_status: 'verified' })
      .eq('id', userId);

    if (error) {
      console.error('Error updating identity verification status:', error);
      return;
    }

    console.log(`Identity verified for user: ${userId}`);
  } catch (error) {
    console.error('Error in handleIdentityVerified:', error);
  }
}

async function handleIdentityFailed(session: Stripe.Identity.VerificationSession) {
  const supabase = createServiceRoleClient();

  try {
    const userId = session.metadata?.user_id;

    if (!userId) {
      console.error('No user_id in identity verification session metadata');
      return;
    }

    // Update user's identity verification status to failed
    const { error } = await supabase
      .from('users')
      .update({ identity_verification_status: 'failed' })
      .eq('id', userId);

    if (error) {
      console.error('Error updating identity verification status:', error);
      return;
    }

    console.log(`Identity verification failed for user: ${userId}`);
  } catch (error) {
    console.error('Error in handleIdentityFailed:', error);
  }
}
