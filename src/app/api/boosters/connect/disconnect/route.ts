import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove stripe_connect_id from database
    const { error: updateError } = await supabase
      .from('users')
      .update({ stripe_connect_id: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error disconnecting Connect account:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting Connect account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
