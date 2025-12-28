import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
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

    const { jobId } = await params;

    // Atomically update job only if it's still available
    // This prevents race conditions when multiple boosters try to accept the same job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({
        booster_id: user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('status', 'available')
      .is('booster_id', null)
      .select()
      .single();

    if (updateError || !updatedJob) {
      // Job either doesn't exist or was already accepted by another booster
      return NextResponse.json(
        { error: 'Job is no longer available' },
        { status: 400 }
      );
    }

    // Get the order to find customer_id
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('id', updatedJob.order_id)
      .single();

    if (order) {
      // Create conversation for this job
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          job_id: jobId,
          customer_id: order.customer_id,
          booster_id: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (conversation && !convError) {
        // Send system message: "Job accepted"
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            text: 'Job accepted',
            is_system_message: true,
          });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/jobs/[jobId]/accept:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
