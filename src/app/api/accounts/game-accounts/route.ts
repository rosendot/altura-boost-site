import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';
import { isValidLength, sanitizeString, isInAllowedValues } from '@/lib/security/validation';
import { encryptCredential, encrypt2FACodes } from '@/lib/security/encryption';

const VALID_PLATFORMS = ['activision', 'xbox', 'playstation', 'steam', 'battlenet', 'epicgames', 'ubisoft'];

/**
 * GET /api/accounts/game-accounts
 * List all saved game accounts for the authenticated customer
 * Returns accounts WITHOUT decrypted passwords (for security)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'game_accounts_list', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 100 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000,
      identifier: 'game_accounts_list',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'game_accounts_list', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Fetch user's saved game accounts (without password data)
    const { data: accounts, error: accountsError } = await supabase
      .from('customer_game_accounts')
      .select('id, account_name, game_platform, username, created_at, updated_at, last_used_at')
      .eq('customer_id', user.id)
      .order('last_used_at', { ascending: false, nullsFirst: false });

    if (accountsError) {
      console.error('[GameAccounts] List query failed');
      return NextResponse.json(
        { error: 'Failed to fetch game accounts' },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Add has_2fa flag based on whether 2FA codes exist
    const { data: accountsWithFlags } = await supabase
      .from('customer_game_accounts')
      .select('id, two_factor_codes_encrypted')
      .eq('customer_id', user.id);

    const accountsEnriched = accounts.map((account) => {
      const withFlags = accountsWithFlags?.find((a) => a.id === account.id);
      return {
        ...account,
        has_2fa_codes: withFlags?.two_factor_codes_encrypted !== null,
      };
    });

    return NextResponse.json({ accounts: accountsEnriched }, { headers: getRateLimitHeaders(rateLimitResult) });
  } catch (error: any) {
    console.error('[GameAccounts] List error:', error?.type || 'unknown');
    return NextResponse.json({ error: 'Failed to fetch game accounts' }, { status: 500 });
  }
}

/**
 * POST /api/accounts/game-accounts
 * Create a new saved game account for the authenticated customer
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await logAuthFailure(null, 'game_accounts_create', 'No authenticated user', request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 20 requests per hour (creating accounts)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
      identifier: 'game_accounts_create',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'game_accounts_create', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Parse request body
    const body = await request.json();
    const { account_name, game_platform, username, password, two_factor_codes } = body;

    // Validate required fields
    if (!account_name || !game_platform || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: account_name, game_platform, username, password' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate account_name length (1-100 chars)
    if (!isValidLength(account_name, 1, 100)) {
      return NextResponse.json(
        { error: 'Account name must be between 1 and 100 characters' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate game_platform
    if (!isInAllowedValues(game_platform, VALID_PLATFORMS)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}` },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate username length (1-200 chars)
    if (!isValidLength(username, 1, 200)) {
      return NextResponse.json(
        { error: 'Username must be between 1 and 200 characters' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate password length (1-500 chars)
    if (!isValidLength(password, 1, 500)) {
      return NextResponse.json(
        { error: 'Password must be between 1 and 500 characters' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate 2FA codes if provided
    if (two_factor_codes) {
      if (!Array.isArray(two_factor_codes)) {
        return NextResponse.json(
          { error: '2FA codes must be an array' },
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
    }

    // Check for duplicate account (same platform + username)
    const { data: existing } = await supabase
      .from('customer_game_accounts')
      .select('id')
      .eq('customer_id', user.id)
      .eq('game_platform', game_platform)
      .eq('username', username)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this platform and username already exists' },
        { status: 409, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Check max accounts limit (10 per customer)
    const { count } = await supabase
      .from('customer_game_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id);

    if (count && count >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 saved accounts allowed. Please delete an existing account first.' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Encrypt password
    const passwordEncrypted = encryptCredential(password);

    // Encrypt 2FA codes if provided
    const twoFactorCodesEncrypted = encrypt2FACodes(two_factor_codes);

    // Sanitize account name (allow special chars in username as it may be email, etc.)
    const sanitizedAccountName = sanitizeString(account_name);

    // Create the account
    const { data: newAccount, error: createError } = await supabase
      .from('customer_game_accounts')
      .insert({
        customer_id: user.id,
        account_name: sanitizedAccountName,
        game_platform,
        username,
        password_encrypted: passwordEncrypted,
        two_factor_codes_encrypted: twoFactorCodesEncrypted,
      })
      .select('id, account_name, game_platform, username, created_at')
      .single();

    if (createError) {
      console.error('[GameAccounts] Create failed');
      return NextResponse.json(
        { error: 'Failed to create game account' },
        { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    return NextResponse.json(
      {
        message: 'Game account saved successfully',
        account: {
          ...newAccount,
          has_2fa_codes: twoFactorCodesEncrypted !== null,
        },
      },
      { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error: any) {
    console.error('[GameAccounts] Create error:', error?.type || 'unknown');
    return NextResponse.json({ error: 'Failed to create game account' }, { status: 500 });
  }
}
