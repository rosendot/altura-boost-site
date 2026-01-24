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
      await logAuthFailure(null, 'conversations_list', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 100 requests per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'conversations_list',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'conversations_list', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Fetch conversations where user is either customer or booster
    // Only show non-archived conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        job_id,
        customer_id,
        booster_id,
        created_at,
        last_message_at,
        status,
        customer_archived,
        booster_archived,
        jobs (
          job_number,
          service_name,
          game_name,
          status
        ),
        messages (
          id,
          message_text,
          sender_id,
          created_at,
          read_at,
          is_system_message
        )
      `)
      .or(`customer_id.eq.${user.id},booster_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('[Conversations] Query failed');
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Filter out archived conversations based on user role
    const filteredConversations = conversations?.filter(conv => {
      if (conv.customer_id === user.id && conv.customer_archived) {
        return false;
      }
      if (conv.booster_id === user.id && conv.booster_archived) {
        return false;
      }
      return true;
    }) || [];

    // Calculate unread count for each conversation
    const conversationsWithUnread = filteredConversations.map(conv => {
      const unreadCount = conv.messages?.filter(
        msg => !msg.read_at && msg.sender_id !== user.id
      ).length || 0;

      // Get last message
      const lastMessage = conv.messages?.[0] || null;

      return {
        ...conv,
        unread_count: unreadCount,
        last_message: lastMessage,
      };
    });

    return NextResponse.json(
      { conversations: conversationsWithUnread },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('[Conversations] Error:', error?.type || 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
