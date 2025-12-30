'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { timeAgo } from '@/utils/timeAgo';
import Image from 'next/image';

interface Attachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string | null;
  read_at: string | null;
  is_system_message: boolean;
  created_at: string;
  message_attachments?: Attachment[];
}

interface Job {
  job_number: string;
  service_name: string;
  game_name: string;
  status: string;
}

interface Conversation {
  id: string;
  job_id: string;
  customer_id: string;
  booster_id: string;
  created_at: string;
  last_message_at: string;
  status: string;
  unread_count: number;
  jobs: Job;
  last_message: Message | null;
}

const POLLING_INTERVAL = 5000; // 5 seconds for messages

export default function MessagesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };

    fetchUser();
  }, [router, supabase]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Poll for new messages
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id);
      fetchConversations(); // Update conversation list to refresh unread counts
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation || uploading) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', newMessage);

      const res = await fetch(`/api/conversations/${selectedConversation.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
        fetchConversations();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-24">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* Conversations List */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold text-white">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 border-b border-gray-800 hover:bg-gray-800 text-left transition ${
                      selectedConversation?.id === conv.id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm text-white">
                        {conv.jobs.game_name}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      {conv.jobs.service_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Job #{conv.jobs.job_number}
                    </div>
                    {conv.last_message && (
                      <div className="text-xs text-gray-500 mt-2 truncate">
                        {conv.last_message.message_text || '📎 Attachment'}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-lg shadow flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="font-semibold text-white">
                    {selectedConversation.jobs.game_name} - {selectedConversation.jobs.service_name}
                  </div>
                  <div className="text-sm text-gray-400">
                    Job #{selectedConversation.jobs.job_number}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black flex flex-col">
                  {messages.map((msg) => {
                    const isOwnMessage = msg.sender_id === user?.id;
                    const isSystemMessage = msg.is_system_message;

                    if (isSystemMessage) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                            {msg.message_text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-800 text-gray-100'
                          }`}
                        >
                          {msg.message_text && <div className="mb-1">{msg.message_text}</div>}
                          {msg.message_attachments && msg.message_attachments.length > 0 && (
                            <div className="mt-2">
                              {msg.message_attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <Image
                                    src={att.file_url}
                                    alt={att.file_name}
                                    width={500}
                                    height={500}
                                    className="rounded max-w-full h-auto"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                          <div
                            className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-primary-200' : 'text-gray-500'
                            }`}
                          >
                            {timeAgo(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 transition"
                    >
                      📎
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sending || uploading}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending || uploading}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {sending ? 'Sending...' : uploading ? 'Uploading...' : 'Send'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
