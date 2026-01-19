import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';
import { isValidUUID } from '@/lib/security/validation';
import { calculateTieredPrice, type PricingTier } from '@/lib/pricing/calculateTieredPrice';

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
      await logAuthFailure(null, 'checkout_create_session', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 20 requests per hour (prevent checkout spam)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'checkout_create_session',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'checkout_create_session', 'Rate limit exceeded', request);
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
      .select('email, full_name, stripe_customer_id, is_suspended')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'User not found' },
        {
          status: 404,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Check if user is suspended
    if (userData.is_suspended) {
      await logAuthFailure(user.id, 'checkout_create_session', 'User is suspended', request);
      return NextResponse.json(
        { error: 'Account suspended. Cannot create checkout session.' },
        {
          status: 403,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get cart items from request body
    const body = await request.json();
    const { cartItems } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      await logAuthFailure(user.id, 'checkout_create_session', 'Invalid cart items', request);
      return NextResponse.json(
        { error: 'Cart is empty' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Validate cart items structure and limits
    if (cartItems.length > 50) {
      await logAuthFailure(user.id, 'checkout_create_session', 'Too many cart items', request);
      return NextResponse.json(
        { error: 'Cart cannot contain more than 50 items' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!item.serviceId || !isValidUUID(item.serviceId)) {
        await logAuthFailure(user.id, 'checkout_create_session', 'Invalid service ID in cart', request);
        return NextResponse.json(
          { error: 'Invalid service ID' },
          {
            status: 400,
            headers: getRateLimitHeaders(rateLimitResult),
          }
        );
      }

      const quantity = item.quantity || 1;
      if (typeof quantity !== 'number' || quantity < 1 || quantity > 100) {
        await logAuthFailure(user.id, 'checkout_create_session', 'Invalid quantity', request);
        return NextResponse.json(
          { error: 'Quantity must be between 1 and 100' },
          {
            status: 400,
            headers: getRateLimitHeaders(rateLimitResult),
          }
        );
      }
    }

    // Fetch service details from database to ensure prices are current
    const serviceIds = cartItems.map((item: any) => item.serviceId);

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select(`
        id, name, price, game_id, pricing_type, unit_name, max_quantity, batch_size,
        games!inner(name),
        pricing_tiers:service_pricing_tiers(*)
      `)
      .in('id', serviceIds)
      .eq('active', true);

    if (servicesError || !services) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Verify all services exist and are active
    if (services.length !== serviceIds.length) {
      await logAuthFailure(user.id, 'checkout_create_session', 'Some services not found or inactive', request);
      return NextResponse.json(
        { error: 'Some services are not available' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Build line items for Stripe Checkout and prepare order metadata
    interface OrderItemData {
      serviceId: string;
      quantity: number;
      pricingType: string;
      unitCount?: number;
      calculatedPrice: number;
      calculatedPayout: number;
    }
    const orderItemsData: OrderItemData[] = [];

    const lineItems = cartItems.map((cartItem: any) => {
      const service = services.find((s) => s.id === cartItem.serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      let unitAmount: number;
      let quantity: number;
      let calculatedPrice: number;
      let calculatedPayout: number;
      let lineItemDescription: string = (service.games as any)?.name || 'Gaming Service';

      if (service.pricing_type === 'tiered' && cartItem.unitCount) {
        // Tiered pricing - calculate from tiers
        const tiers: PricingTier[] = (service.pricing_tiers || []).map((t: any) => ({
          min_quantity: t.min_quantity,
          max_quantity: t.max_quantity,
          price_per_unit: Number(t.price_per_unit),
          booster_payout_per_unit: Number(t.booster_payout_per_unit),
        }));

        // Validate unit count against max
        const unitCount = Math.min(cartItem.unitCount, service.max_quantity || 30);
        const priceCalc = calculateTieredPrice(unitCount, tiers);

        calculatedPrice = priceCalc.totalPrice;
        calculatedPayout = priceCalc.totalPayout;
        unitAmount = Math.round(calculatedPrice * 100); // Total in cents
        quantity = 1; // Single line item for the whole order
        lineItemDescription = `${unitCount} ${service.unit_name || 'unit'}${unitCount > 1 ? 's' : ''} - ${(service.games as any)?.name || 'Gaming Service'}`;

        orderItemsData.push({
          serviceId: service.id,
          quantity: 1,
          pricingType: 'tiered',
          unitCount: unitCount,
          calculatedPrice,
          calculatedPayout,
        });
      } else {
        // Fixed pricing
        calculatedPrice = service.price * (cartItem.quantity || 1);
        calculatedPayout = 0; // Will be fetched from service in webhook
        unitAmount = Math.round(service.price * 100);
        quantity = cartItem.quantity || 1;

        orderItemsData.push({
          serviceId: service.id,
          quantity: cartItem.quantity || 1,
          pricingType: 'fixed',
          calculatedPrice,
          calculatedPayout,
        });
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.name,
            description: lineItemDescription,
          },
          unit_amount: unitAmount,
        },
        quantity,
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
        order_items: JSON.stringify(orderItemsData),
      },
    });

    return NextResponse.json(
      { url: session.url, sessionId: session.id },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('Unexpected error occurred');
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
