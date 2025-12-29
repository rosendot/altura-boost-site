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

    // Fetch all reviews with related data
    const { data: reviews, error: reviewsError } = await supabase
      .from('job_reviews')
      .select(`
        id,
        rating,
        quality_rating,
        communication_rating,
        timeliness_rating,
        review_text,
        delivery_status,
        is_flagged,
        requires_admin_review,
        created_at,
        job_id,
        jobs (
          job_number,
          service_name,
          game_name,
          completed_at
        ),
        customer:users!job_reviews_customer_id_fkey (
          id,
          full_name,
          email
        ),
        booster:users!job_reviews_booster_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
