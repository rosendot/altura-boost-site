import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
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
    const body = await request.json();
    const { progress_percentage, notes } = body;

    // Validate progress percentage
    if (typeof progress_percentage !== 'number' || progress_percentage < 0 || progress_percentage > 100) {
      return NextResponse.json(
        { error: 'Invalid progress percentage. Must be between 0 and 100.' },
        { status: 400 }
      );
    }

    // Fetch the job to verify ownership and get current progress
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

    // Verify the user is the assigned booster
    if (job.booster_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to update this job' },
        { status: 403 }
      );
    }

    // Determine new status based on progress
    let newStatus = job.status;
    if (progress_percentage === 100) {
      newStatus = 'completed';
    } else if (progress_percentage > 0 && job.status === 'accepted') {
      newStatus = 'in_progress';
    }

    // Update the job progress
    const updateData: any = {
      progress_percentage,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (progress_percentage === 100) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update job progress' },
        { status: 500 }
      );
    }

    // Log the progress update
    const { error: logError } = await supabase
      .from('job_progress_updates')
      .insert({
        job_id: jobId,
        old_progress: job.progress_percentage,
        new_progress: progress_percentage,
        updated_by: user.id,
        notes: notes || null,
      });

    if (logError) {
      console.error('Failed to log progress update:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/jobs/[jobId]/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
