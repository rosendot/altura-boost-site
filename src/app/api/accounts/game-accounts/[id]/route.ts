import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';
import { isValidUUID, isValidLength, sanitizeString, isInAllowedValues } from '@/lib/security/validation';
import {
  encryptCredential,
  decryptCredential,
  encrypt2FACodes,
  decrypt2FACodes,
  EncryptedData,
} from '@/lib/security/encryption';

const VALID_PLATFORMS = ['activision', 'xbox', 'playstation', 'steam', 'battlenet', 'epicgames', 'ubisoft'];

/**
 * GET /api/accounts/game-accounts/[id]
 * Get a specific game account with decrypted credentials
 * Only the owning customer can access
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Validate UUID
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'game_account_get', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 50 requests per hour (viewing credentials)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 50,
      windowMs: 60 * 60 * 1000,
      identifier: 'game_account_get',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'game_account_get', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Fetch the account - RLS should ensure only owner can access
    const { data: account, error: accountError } = await supabase
      .from('customer_game_accounts')
      .select('*')
      .eq('id', id)
      .eq('customer_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Game account not found' },
        { status: 404, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Decrypt password
    let decryptedPassword: string;
    try {
      decryptedPassword = decryptCredential(account.password_encrypted as EncryptedData);
    } catch {
      console.error('[GameAccount] Decryption failed');
      return NextResponse.json(
        { error: 'Failed to decrypt credentials' },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Decrypt 2FA codes if present
    let decrypted2FACodes: string[] | null = null;
    if (account.two_factor_codes_encrypted) {
      try {
        decrypted2FACodes = decrypt2FACodes(account.two_factor_codes_encrypted as EncryptedData);
      } catch {
        console.error('[GameAccount] 2FA decryption failed');
        // Don't fail completely, just return null for 2FA
      }
    }

    return NextResponse.json(
      {
        account: {
          id: account.id,
          account_name: account.account_name,
          game_platform: account.game_platform,
          username: account.username,
          password: decryptedPassword,
          two_factor_codes: decrypted2FACodes,
          created_at: account.created_at,
          updated_at: account.updated_at,
          last_used_at: account.last_used_at,
        },
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error: any) {
    console.error('[GameAccount] Get error:', error?.type || 'unknown');
    return NextResponse.json({ error: 'Failed to fetch game account' }, { status: 500 });
  }
}

/**
 * PATCH /api/accounts/game-accounts/[id]
 * Update a specific game account
 * Only the owning customer can update
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Validate UUID
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'game_account_update', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 30 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 30,
      windowMs: 60 * 60 * 1000,
      identifier: 'game_account_update',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'game_account_update', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Check account exists and belongs to user
    const { data: existingAccount, error: existingError } = await supabase
      .from('customer_game_accounts')
      .select('id')
      .eq('id', id)
      .eq('customer_id', user.id)
      .single();

    if (existingError || !existingAccount) {
      return NextResponse.json(
        { error: 'Game account not found' },
        { status: 404, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Parse request body
    const body = await request.json();
    const { account_name, game_platform, username, password, two_factor_codes } = body;

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Validate and add fields if provided
    if (account_name !== undefined) {
      if (!isValidLength(account_name, 1, 100)) {
        return NextResponse.json(
          { error: 'Account name must be between 1 and 100 characters' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
      updateData.account_name = sanitizeString(account_name);
    }

    if (game_platform !== undefined) {
      if (!isInAllowedValues(game_platform, VALID_PLATFORMS)) {
        return NextResponse.json(
          { error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}` },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
      updateData.game_platform = game_platform;
    }

    if (username !== undefined) {
      if (!isValidLength(username, 1, 200)) {
        return NextResponse.json(
          { error: 'Username must be between 1 and 200 characters' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
      updateData.username = username;
    }

    if (password !== undefined) {
      if (!isValidLength(password, 1, 500)) {
        return NextResponse.json(
          { error: 'Password must be between 1 and 500 characters' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
      updateData.password_encrypted = encryptCredential(password);
    }

    if (two_factor_codes !== undefined) {
      if (two_factor_codes === null) {
        updateData.two_factor_codes_encrypted = null;
      } else {
        if (!Array.isArray(two_factor_codes)) {
          return NextResponse.json(
            { error: '2FA codes must be an array or null' },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }
        if (two_factor_codes.length > 20) {
          return NextResponse.json(
            { error: 'Maximum 20 2FA codes allowed' },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }
        for (const code of two_factor_codes) {
          if (typeof code !== 'string' || code.length > 50) {
            return NextResponse.json(
              { error: 'Each 2FA code must be a string with max 50 characters' },
              { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
            );
          }
        }
        updateData.two_factor_codes_encrypted = encrypt2FACodes(two_factor_codes);
      }
    }

    // Check for duplicate if platform or username changed
    if (updateData.game_platform || updateData.username) {
      const { data: duplicate } = await supabase
        .from('customer_game_accounts')
        .select('id')
        .eq('customer_id', user.id)
        .eq('game_platform', updateData.game_platform || game_platform)
        .eq('username', updateData.username || username)
        .neq('id', id)
        .single();

      if (duplicate) {
        return NextResponse.json(
          { error: 'An account with this platform and username already exists' },
          { status: 409, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
    }

    // Update the account
    const { data: updatedAccount, error: updateError } = await supabase
      .from('customer_game_accounts')
      .update(updateData)
      .eq('id', id)
      .eq('customer_id', user.id)
      .select('id, account_name, game_platform, username, updated_at')
      .single();

    if (updateError) {
      console.error('[GameAccount] Update failed');
      return NextResponse.json(
        { error: 'Failed to update game account' },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    return NextResponse.json(
      { message: 'Game account updated successfully', account: updatedAccount },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error: any) {
    console.error('[GameAccount] Update error:', error?.type || 'unknown');
    return NextResponse.json({ error: 'Failed to update game account' }, { status: 500 });
  }
}

/**
 * DELETE /api/accounts/game-accounts/[id]
 * Delete a specific game account
 * Only the owning customer can delete
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Validate UUID
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'game_account_delete', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 20 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
      identifier: 'game_account_delete',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'game_account_delete', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Delete the account - RLS ensures only owner can delete
    const { error: deleteError } = await supabase
      .from('customer_game_accounts')
      .delete()
      .eq('id', id)
      .eq('customer_id', user.id);

    if (deleteError) {
      console.error('[GameAccount] Delete failed');
      return NextResponse.json(
        { error: 'Failed to delete game account' },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    return NextResponse.json(
      { message: 'Game account deleted successfully' },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error: any) {
    console.error('[GameAccount] Delete error:', error?.type || 'unknown');
    return NextResponse.json({ error: 'Failed to delete game account' }, { status: 500 });
  }
}
