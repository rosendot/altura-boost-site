import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { sanitizeString, isValidLength, isValidUUID } from '@/lib/security/validation';
import { logAuthFailure } from '@/lib/security/audit-logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'messages_get', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 200 requests per hour for fetching messages
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 200,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'messages_get',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'messages_get', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { conversationId } = await params;

    // Validate conversationId format
    if (!isValidUUID(conversationId)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    // Verify user is part of this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('customer_id, booster_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      await logAuthFailure(user.id, 'messages_get', 'Conversation not found', request);
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.customer_id !== user.id && conversation.booster_id !== user.id) {
      await logAuthFailure(user.id, 'messages_get', 'User not part of conversation', request);
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch messages with attachments
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        message_text,
        read_at,
        is_system_message,
        created_at,
        message_attachments (
          id,
          file_url,
          file_name,
          file_type,
          file_size
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Mark messages as read (only messages sent by the other person)
    const unreadMessageIds = messages
      ?.filter(msg => !msg.read_at && msg.sender_id !== user.id)
      .map(msg => msg.id) || [];

    if (unreadMessageIds.length > 0) {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadMessageIds);
    }

    return NextResponse.json(
      { messages: messages || [] },
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'messages_post', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 100 messages per hour per user (prevent spam)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'messages_post',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'messages_post', 'Rate limit exceeded', request);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { conversationId } = await params;

    // Validate conversationId format
    if (!isValidUUID(conversationId)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    // Validate message length (max 5000 chars)
    if (!isValidLength(text.trim(), 1, 5000)) {
      return NextResponse.json(
        { error: 'Message must be between 1 and 5000 characters' },
        { status: 400 }
      );
    }

    // Verify user is part of this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('customer_id, booster_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      await logAuthFailure(user.id, 'messages_post', 'Conversation not found', request);
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.customer_id !== user.id && conversation.booster_id !== user.id) {
      await logAuthFailure(user.id, 'messages_post', 'User not part of conversation', request);
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Sanitize message text (XSS prevention)
    const sanitizedText = sanitizeString(text.trim());

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_text: sanitizedText,
        is_system_message: false,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Database operation failed');
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message },
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
