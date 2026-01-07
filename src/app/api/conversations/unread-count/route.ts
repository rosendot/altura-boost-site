import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { logAuthFailure } from '@/lib/security/audit-logger';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'unread_count', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 200 requests per hour (frequently polled endpoint)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 200,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'unread_count',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'unread_count', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get all conversations where user is participant
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, customer_id, booster_id, customer_archived, booster_archived')
      .or(`customer_id.eq.${user.id},booster_id.eq.${user.id}`);

    if (convError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json(
        { unread_count: 0 },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Filter out archived conversations
    const activeConversations = conversations.filter(conv => {
      if (conv.customer_id === user.id && conv.customer_archived) {
        return false;
      }
      if (conv.booster_id === user.id && conv.booster_archived) {
        return false;
      }
      return true;
    });

    if (activeConversations.length === 0) {
      return NextResponse.json(
        { unread_count: 0 },
        {
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const conversationIds = activeConversations.map(c => c.id);

    // Count unread messages across all conversations
    const { count, error: countError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .is('read_at', null)
      .neq('sender_id', user.id);

    if (countError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to count unread messages' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { unread_count: count || 0 },
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
