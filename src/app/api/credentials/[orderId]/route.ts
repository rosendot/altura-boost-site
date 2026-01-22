import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure, logAdminAction } from '@/lib/security/audit-logger';
import { isValidUUID } from '@/lib/security/validation';
import { decryptCredential, decrypt2FACodes, EncryptedData } from '@/lib/security/encryption';

/**
 * GET /api/credentials/[orderId]
 * Booster retrieves credentials for an order they have an active job on
 * Logs access for security audit
 */
export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const supabase = await createClient();

    // Validate UUID
    if (!isValidUUID(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'credentials_access', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 20 requests per hour (credential access should be infrequent)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
      identifier: 'credentials_access',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'credentials_access', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Get user role
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      await logAuthFailure(user.id, 'credentials_access', 'User not found', request);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Verify user is a booster with an active job on this order
    const { data: activeJob, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, order_id')
      .eq('order_id', orderId)
      .eq('booster_id', user.id)
      .in('status', ['accepted', 'in_progress'])
      .single();

    if (jobError || !activeJob) {
      await logAuthFailure(user.id, 'credentials_access', 'No active job for this order', request);
      return NextResponse.json(
        { error: 'You do not have an active job for this order' },
        { status: 403, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Fetch credentials for this order
    const { data: credentials, error: credentialsError } = await supabase
      .from('game_credentials')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (credentialsError || !credentials) {
      return NextResponse.json(
        { error: 'No credentials found for this order' },
        { status: 404, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Decrypt password
    let decryptedPassword: string;
    try {
      decryptedPassword = decryptCredential(credentials.password_encrypted as EncryptedData);
    } catch {
      console.error('Decryption failed');
      return NextResponse.json(
        { error: 'Failed to decrypt credentials' },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Decrypt 2FA codes if present
    let decrypted2FACodes: string[] | null = null;
    if (credentials.two_factor_codes_encrypted) {
      try {
        decrypted2FACodes = decrypt2FACodes(credentials.two_factor_codes_encrypted as EncryptedData);
      } catch {
        console.error('2FA decryption failed');
        // Don't fail completely, just return null for 2FA
      }
    }

    // Log credential access for audit trail
    const { error: logError } = await supabase.from('credential_access_logs').insert({
      credential_id: credentials.id,
      accessed_by: user.id,
      job_id: activeJob.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    if (logError) {
      // Log error but don't fail the request
      console.error('Failed to log credential access');
    }

    // Also log via audit logger for consistency
    await logAdminAction(
      user.id,
      userData.email,
      'credential_accessed',
      'game_credentials',
      credentials.id,
      { order_id: orderId, job_id: activeJob.id },
      request
    );

    return NextResponse.json(
      {
        credentials: {
          game_platform: credentials.game_platform,
          username: credentials.username,
          password: decryptedPassword,
          two_factor_codes: decrypted2FACodes,
        },
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Unexpected error occurred');
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }
}
