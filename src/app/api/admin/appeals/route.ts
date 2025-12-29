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

    // Fetch all appeals with user information
    const { data: appeals, error: appealsError } = await supabase
      .from('suspension_appeals')
      .select(`
        id,
        user_id,
        appeal_text,
        status,
        submitted_at,
        reviewed_at,
        reviewed_by,
        admin_notes,
        users!user_id (
          email,
          full_name,
          is_suspended,
          suspension_reason,
          suspended_at
        )
      `)
      .order('submitted_at', { ascending: false });

    if (appealsError) {
      console.error('Error fetching appeals:', appealsError);
      return NextResponse.json(
        { error: 'Failed to fetch appeals' },
        { status: 500 }
      );
    }

    return NextResponse.json({ appeals: appeals || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/appeals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
