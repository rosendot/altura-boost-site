import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PATCH - Deactivate a strike (set is_active = false)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ strikeId: string }> }
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

    const { strikeId } = await params;

    // Deactivate the strike
    const { data: strike, error: strikeError } = await supabase
      .from('booster_strikes')
      .update({ is_active: false })
      .eq('id', strikeId)
      .select()
      .single();

    if (strikeError) {
      console.error('Error deactivating strike:', strikeError);
      return NextResponse.json(
        { error: 'Failed to deactivate strike' },
        { status: 500 }
      );
    }

    if (!strike) {
      return NextResponse.json(
        { error: 'Strike not found' },
        { status: 404 }
      );
    }

    // The database trigger will automatically update the user's strike_count

    return NextResponse.json({
      strike,
      message: 'Strike deactivated successfully'
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/strikes/[strikeId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete a strike
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ strikeId: string }> }
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

    const { strikeId } = await params;

    // Get strike info before deleting
    const { data: strikeInfo, error: strikeInfoError } = await supabase
      .from('booster_strikes')
      .select('booster_id')
      .eq('id', strikeId)
      .single();

    if (strikeInfoError || !strikeInfo) {
      return NextResponse.json(
        { error: 'Strike not found' },
        { status: 404 }
      );
    }

    // Delete the strike
    const { error: deleteError } = await supabase
      .from('booster_strikes')
      .delete()
      .eq('id', strikeId);

    if (deleteError) {
      console.error('Error deleting strike:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete strike' },
        { status: 500 }
      );
    }

    // The database trigger will automatically update the user's strike_count

    return NextResponse.json({
      message: 'Strike deleted successfully',
      booster_id: strikeInfo.booster_id
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/strikes/[strikeId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
