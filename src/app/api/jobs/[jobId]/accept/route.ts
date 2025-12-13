import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { emitJobAccepted } from '@/lib/socket/emit';

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

    // Verify the job exists and is available
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'available' || job.booster_id) {
      return NextResponse.json(
        { error: 'Job is no longer available' },
        { status: 400 }
      );
    }

    // Update job with booster assignment
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        booster_id: user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to accept job' },
        { status: 500 }
      );
    }

    // Emit Socket.IO event to notify all boosters in the hub
    emitJobAccepted(jobId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/jobs/[jobId]/accept:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
