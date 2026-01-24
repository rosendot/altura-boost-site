import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 100 requests per admin per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'admin_signed_url',
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Verify admin role from database (not just JWT)
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the file path from request body
    const { path, bucket } = await request.json();

    if (!path || !bucket) {
      return NextResponse.json({ error: 'Missing path or bucket' }, { status: 400 });
    }

    // Validate path format (prevent directory traversal)
    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Only allow specific buckets (whitelist approach)
    const allowedBuckets = ['booster-applications'];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    // Use service role client to generate signed URL (bypasses RLS)
    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      console.error('[SignedUrl] Storage error');
      return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 });
    }

    return NextResponse.json(
      { signedUrl: data.signedUrl },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error: any) {
    console.error('[SignedUrl] Error:', error?.type || 'unknown');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
