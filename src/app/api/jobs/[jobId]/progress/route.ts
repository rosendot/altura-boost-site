import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';
import { isValidUUID, sanitizeString, isValidLength } from '@/lib/security/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'job_progress_update', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 50 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 50,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'job_progress_update',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'job_progress_update', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { jobId } = await params;

    // Validate jobId UUID format
    if (!isValidUUID(jobId)) {
      await logAuthFailure(user.id, 'job_progress_update', 'Invalid job ID format', request);
      return NextResponse.json(
        { error: 'Invalid job ID' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await request.json();
    const { progress_percentage, notes } = body;

    // Validate progress percentage
    if (typeof progress_percentage !== 'number' || progress_percentage < 0 || progress_percentage > 100) {
      await logAuthFailure(user.id, 'job_progress_update', 'Invalid progress percentage', request);
      return NextResponse.json(
        { error: 'Invalid progress percentage. Must be between 0 and 100.' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Validate and sanitize notes if provided
    let sanitizedNotes = null;
    if (notes) {
      if (!isValidLength(notes, 1, 1000)) {
        await logAuthFailure(user.id, 'job_progress_update', 'Invalid notes length', request);
        return NextResponse.json(
          { error: 'Notes must be between 1 and 1000 characters' },
          {
            status: 400,
            headers: getRateLimitHeaders(rateLimitResult),
          }
        );
      }
      sanitizedNotes = sanitizeString(notes.trim());
    }

    // Fetch the job to verify ownership and get current progress
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      console.error('[JobProgress] Job query failed');
      return NextResponse.json(
        { error: 'Job not found' },
        {
          status: 404,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Verify the user is the assigned booster
    if (job.booster_id !== user.id) {
      await logAuthFailure(user.id, 'job_progress_update', 'User is not assigned booster', request);
      return NextResponse.json(
        { error: 'You are not authorized to update this job' },
        {
          status: 403,
          headers: getRateLimitHeaders(rateLimitResult),
        }
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
      console.error('[JobProgress] Update failed');
      return NextResponse.json(
        { error: 'Failed to update job progress' },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
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
        notes: sanitizedNotes,
      });

    if (logError) {
      console.error('[JobProgress] Progress log insert failed');
      // Don't fail the request if logging fails
    }

    return NextResponse.json(
      { success: true },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('[JobProgress] Error:', error?.type || 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
