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

    // Get all conversations where user is participant
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, customer_id, booster_id, customer_archived, booster_archived')
      .or(`customer_id.eq.${user.id},booster_id.eq.${user.id}`);

    if (convError) {
      console.error('Error fetching conversations:', convError);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ unread_count: 0 });
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
      return NextResponse.json({ unread_count: 0 });
    }

    const conversationIds = activeConversations.map(c => c.id);

    // Count unread messages across all conversations
    const { count, error: countError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', user.id);

    if (countError) {
      console.error('Error counting unread messages:', countError);
      return NextResponse.json(
        { error: 'Failed to count unread messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ unread_count: count || 0 });
  } catch (error) {
    console.error('Error in /api/conversations/unread-count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
