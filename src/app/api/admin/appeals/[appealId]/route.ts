import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ appealId: string }> }
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

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { appealId } = await params;
    const body = await request.json();
    const { status, admin_notes } = body;

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Get the appeal to find the user_id
    const { data: appeal, error: appealFetchError } = await supabase
      .from('suspension_appeals')
      .select('user_id')
      .eq('id', appealId)
      .single();

    if (appealFetchError || !appeal) {
      return NextResponse.json(
        { error: 'Appeal not found' },
        { status: 404 }
      );
    }

    // Update the appeal
    const { data: updatedAppeal, error: updateError } = await supabase
      .from('suspension_appeals')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: admin_notes || null,
      })
      .eq('id', appealId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating appeal:', updateError);
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
        console.error('Error unsuspending user:', unsuspendError);
      }
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
        console.error('Error updating user appeal status:', rejectError);
      }
    }

    return NextResponse.json({
      appeal: updatedAppeal,
      message: `Appeal ${status} successfully`
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/appeals/[appealId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
