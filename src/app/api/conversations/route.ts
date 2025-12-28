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
          text,
          sender_id,
          created_at,
          is_read,
          is_system_message
        )
      `)
      .or(`customer_id.eq.${user.id},booster_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
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
        msg => !msg.is_read && msg.sender_id !== user.id
      ).length || 0;

      // Get last message
      const lastMessage = conv.messages?.[0] || null;

      return {
        ...conv,
        unread_count: unreadCount,
        last_message: lastMessage,
      };
    });

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Error in /api/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
