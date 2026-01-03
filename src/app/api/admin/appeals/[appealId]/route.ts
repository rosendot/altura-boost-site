import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { isValidUUID, isInAllowedValues, validateAdminNotes } from '@/lib/security/validation';
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ appealId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'appeal_review', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      await logAuthFailure(user.id, 'appeal_review', 'User is not admin', request);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Rate limiting: 30 appeal reviews per admin per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 30,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'appeal_review',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(
        user.id,
        'appeal_review',
        'Rate limit exceeded',
        request
      );
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { appealId } = await params;

    // Validate appealId format
    if (!isValidUUID(appealId)) {
      return NextResponse.json(
        { error: 'Invalid appeal ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, admin_notes } = body;

    // Validate status
    if (!status || !isInAllowedValues(status, ['approved', 'rejected'])) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Validate and sanitize admin notes
    let sanitizedNotes: string | null = null;
    try {
      sanitizedNotes = validateAdminNotes(admin_notes);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid admin notes' },
        { status: 400 }
      );
    }

    // Get the appeal to find the user_id and check status
    const { data: appeal, error: appealFetchError } = await supabase
      .from('suspension_appeals')
      .select('user_id, status')
      .eq('id', appealId)
      .single();

    if (appealFetchError || !appeal) {
      return NextResponse.json(
        { error: 'Appeal not found' },
        { status: 404 }
      );
    }

    // Prevent updating already-reviewed appeals
    if (appeal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Appeal has already been reviewed' },
        { status: 400 }
      );
    }

    // Update the appeal with sanitized data
    const { data: updatedAppeal, error: updateError } = await supabase
      .from('suspension_appeals')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: sanitizedNotes,
      })
      .eq('id', appealId)
      .select()
      .single();

    if (updateError) {
      console.error('Database operation failed');
      await logAuthFailure(
        user.id,
        'appeal_review',
        'Database operation failed',
        request
      );
      return NextResponse.json(
        { error: 'Failed to update appeal' },
        { status: 500 }
      );
    }

    // If approved, unsuspend the user and update appeal_status
    if (status === 'approved') {
      const { error: unsuspendError } = await supabase
        .from('users')
        .update({
          is_suspended: false,
          suspended_at: null,
          suspension_reason: null,
          appeal_status: null,
          can_appeal: false,
        })
        .eq('id', appeal.user_id);

      if (unsuspendError) {
        console.error('User update operation failed');
      }

      // Log successful approval
      await logAdminAction(
        user.id,
        userData.email,
        'appeal_approved',
        'suspension_appeal',
        appealId,
        {
          affected_user_id: appeal.user_id,
          admin_notes: sanitizedNotes || undefined,
        },
        request
      );
    } else if (status === 'rejected') {
      // If rejected, update appeal_status and can_appeal
      const { error: rejectError } = await supabase
        .from('users')
        .update({
          appeal_status: 'rejected',
          can_appeal: false, // User cannot appeal again after rejection
        })
        .eq('id', appeal.user_id);

      if (rejectError) {
        console.error('User update operation failed');
      }

      // Log successful rejection
      await logAdminAction(
        user.id,
        userData.email,
        'appeal_rejected',
        'suspension_appeal',
        appealId,
        {
          affected_user_id: appeal.user_id,
          admin_notes: sanitizedNotes || undefined,
        },
        request
      );
    }

    // Return response with rate limit headers
    return NextResponse.json(
      {
        appeal: updatedAppeal,
        message: `Appeal ${status} successfully`
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Unexpected error occurred');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
