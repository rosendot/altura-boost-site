import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';
import { isValidUUID } from '@/lib/security/validation';

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
      await logAuthFailure(null, 'strike_deactivate', 'No authenticated user', request);
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
      await logAuthFailure(user.id, 'strike_deactivate', 'User is not admin', request);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Rate limiting: 30 requests per admin per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 30,
      windowMs: 60 * 60 * 1000,
      identifier: 'strike_deactivate',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'strike_deactivate', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { strikeId } = await params;

    // Validate strike ID format
    if (!isValidUUID(strikeId)) {
      return NextResponse.json({ error: 'Invalid strike ID format' }, { status: 400 });
    }

    // Deactivate the strike
    const { data: strike, error: strikeError } = await supabase
      .from('booster_strikes')
      .update({ is_active: false })
      .eq('id', strikeId)
      .select()
      .single();

    if (strikeError) {
      console.error('Database operation failed');
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

    // Log successful strike deactivation
    await logAdminAction(
      user.id,
      userData.email,
      'strike_deactivated',
      'booster_strike',
      strikeId,
      { booster_id: strike.booster_id },
      request
    );

    // The database trigger will automatically update the user's strike_count

    return NextResponse.json(
      {
        strike,
        message: 'Strike deactivated successfully'
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
      await logAuthFailure(null, 'strike_delete', 'No authenticated user', request);
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
      await logAuthFailure(user.id, 'strike_delete', 'User is not admin', request);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Rate limiting: 30 requests per admin per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 30,
      windowMs: 60 * 60 * 1000,
      identifier: 'strike_delete',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'strike_delete', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { strikeId } = await params;

    // Validate strike ID format
    if (!isValidUUID(strikeId)) {
      return NextResponse.json({ error: 'Invalid strike ID format' }, { status: 400 });
    }

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
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to delete strike' },
        { status: 500 }
      );
    }

    // Log successful strike deletion
    await logAdminAction(
      user.id,
      userData.email,
      'strike_deleted',
      'booster_strike',
      strikeId,
      { booster_id: strikeInfo.booster_id },
      request
    );

    // The database trigger will automatically update the user's strike_count

    return NextResponse.json(
      {
        message: 'Strike deleted successfully',
        booster_id: strikeInfo.booster_id
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
