import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { sanitizeString, isValidUUID } from '@/lib/security/validation';
import { logAuthFailure } from '@/lib/security/audit-logger';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuthFailure(null, 'file_upload', 'No authenticated user', request);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 20 file uploads per hour (prevent abuse)
    const rateLimitResult = checkRateLimit(user.id, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: 'file_upload',
    });

    if (!rateLimitResult.allowed) {
      await logAuthFailure(user.id, 'file_upload', 'Rate limit exceeded', request);
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
      await logAuthFailure(user.id, 'file_upload', 'Conversation not found', request);
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.customer_id !== user.id && conversation.booster_id !== user.id) {
      await logAuthFailure(user.id, 'file_upload', 'User not part of conversation', request);
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const messageText = formData.get('text') as string;

    // Sanitize optional message text if provided
    const sanitizedText = messageText ? sanitizeString(messageText.trim()) : null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${conversationId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload] Storage upload failed');
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(filePath);

    // Create message with attachment
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
      // If message creation fails, delete the uploaded file
      await supabase.storage
        .from('message-attachments')
        .remove([filePath]);

      console.error('[Upload] Message insert failed');
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      );
    }

    // Create attachment record
    const { data: attachment, error: attachmentError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: message.id,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (attachmentError) {
      console.error('[Upload] Attachment insert failed');
      // Don't fail the request if attachment record creation fails
      // The file is uploaded and message is created
    }

    return NextResponse.json(
      {
        message: {
          ...message,
          message_attachments: attachment ? [attachment] : [],
        },
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error: any) {
    console.error('[Upload] Error:', error?.type || 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
