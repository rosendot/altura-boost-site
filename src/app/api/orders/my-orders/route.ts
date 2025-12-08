import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch orders for this customer
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [], jobs: {} });
    }

    // Fetch all jobs for these orders
    const { data: rawJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .in('order_id', orders.map(o => o.id));

    if (jobsError) {
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
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

    return NextResponse.json({
      orders: orders || [],
      jobs: jobsByOrder,
    });
  } catch (error) {
    console.error('Error in /api/orders/my-orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
