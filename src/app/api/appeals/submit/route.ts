import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

    // Check if user is a suspended booster
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, is_suspended, can_appeal, appeal_status')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (userData.role !== 'booster') {
      return NextResponse.json(
        { error: 'Only boosters can submit appeals' },
        { status: 403 }
      );
    }

    if (!userData.is_suspended) {
      return NextResponse.json(
        { error: 'Your account is not suspended' },
        { status: 400 }
      );
    }

    if (!userData.can_appeal) {
      return NextResponse.json(
        { error: 'You are not eligible to submit an appeal' },
        { status: 403 }
      );
    }

    if (userData.appeal_status === 'pending') {
      return NextResponse.json(
        { error: 'You already have a pending appeal' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { appeal_text } = body;

    // Validate appeal text
    if (!appeal_text || typeof appeal_text !== 'string' || !appeal_text.trim()) {
      return NextResponse.json(
        { error: 'Appeal text is required' },
        { status: 400 }
      );
    }

    // Create appeal record
    const { data: appeal, error: appealError } = await supabase
      .from('suspension_appeals')
      .insert({
        user_id: user.id,
        appeal_text: appeal_text.trim(),
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appealError) {
      console.error('Error creating appeal:', appealError);
      return NextResponse.json(
        { error: 'Failed to submit appeal' },
        { status: 500 }
      );
    }

    // Update user's appeal status
    const { error: updateError } = await supabase
      .from('users')
      .update({ appeal_status: 'pending' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user appeal status:', updateError);
    }

    return NextResponse.json({
      appeal,
      message: 'Appeal submitted successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/appeals/submit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
