import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'my_orders', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 100 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'my_orders',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'my_orders', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch orders for this customer
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('[MyOrders] Orders query failed');
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { orders: [], jobs: {} },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch all jobs for these orders
    const { data: rawJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .in('order_id', orders.map(o => o.id));

    if (jobsError) {
      console.error('[MyOrders] Jobs query failed');
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get unique booster IDs
    const boosterIds = rawJobs
      ?.filter(job => job.booster_id)
      .map(job => job.booster_id)
      .filter((id, index, self) => self.indexOf(id) === index) || [];

    // Fetch booster info
    let boosterMap: Record<string, { full_name: string | null; email: string }> = {};

    if (boosterIds.length > 0) {
      const { data: boosters, error: boostersError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', boosterIds);

      if (!boostersError && boosters) {
        boosterMap = boosters.reduce((acc, booster) => {
          acc[booster.id] = { full_name: booster.full_name, email: booster.email };
          return acc;
        }, {} as Record<string, { full_name: string | null; email: string }>);
      }
    }

    // Map jobs with booster data
    const jobsWithBoosters = rawJobs?.map(job => ({
      ...job,
      booster: job.booster_id ? boosterMap[job.booster_id] || null : null
    }));

    // Group jobs by order_id
    const jobsByOrder: Record<string, any[]> = {};
    jobsWithBoosters?.forEach((job) => {
      if (!jobsByOrder[job.order_id]) {
        jobsByOrder[job.order_id] = [];
      }
      jobsByOrder[job.order_id].push(job);
    });

    return NextResponse.json(
      {
        orders: orders || [],
        jobs: jobsByOrder,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('[MyOrders] Error:', error?.type || 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
