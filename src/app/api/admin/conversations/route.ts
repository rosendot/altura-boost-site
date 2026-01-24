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

    // Verify user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      await logAuthFailure(user.id, 'conversations_list', 'User is not admin', request);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Rate limiting: 100 requests per admin per hour
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000,
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

    // Fetch all conversations with related data
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
        customer:users!conversations_customer_id_fkey (
          id,
          email,
          full_name
        ),
        booster:users!conversations_booster_id_fkey (
          id,
          email,
          full_name
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
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('[AdminConversations] Query failed');
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Calculate message counts for each conversation
    const conversationsWithStats = (conversations || []).map(conv => {
      const totalMessages = conv.messages?.length || 0;
      const unreadMessages = conv.messages?.filter(msg => !msg.read_at).length || 0;
      const lastMessage = conv.messages?.[conv.messages.length - 1] || null;

      return {
        ...conv,
        message_count: totalMessages,
        unread_count: unreadMessages,
        last_message: lastMessage,
      };
    });

    return NextResponse.json(
      { conversations: conversationsWithStats },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('[AdminConversations] Error:', error?.type || 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
