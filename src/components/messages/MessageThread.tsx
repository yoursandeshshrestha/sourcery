import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  reservation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface MessageThreadProps {
  reservationId: string;
  otherParticipant: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    role: 'INVESTOR' | 'SOURCER';
  };
}

export function MessageThread({ reservationId, otherParticipant }: MessageThreadProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          reservation_id,
          sender_id,
          content,
          is_read,
          read_at,
          created_at,
          sender:profiles!messages_sender_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data as unknown as Message[]);

      // Mark messages as read
      if (user?.id) {
        await supabase.rpc('mark_messages_as_read', {
          p_reservation_id: reservationId,
          p_user_id: user.id,
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching messages:', error);
      }
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    fetchMessages();

    // Set up Realtime subscription
    const channel = supabase
      .channel(`messages-${reservationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `reservation_id=eq.${reservationId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new message with sender info
            supabase
              .from('messages')
              .select(`
                id,
                reservation_id,
                sender_id,
                content,
                is_read,
                read_at,
                created_at,
                sender:profiles!messages_sender_id_fkey(
                  id,
                  first_name,
                  last_name,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setMessages((prev) => [...prev, data as unknown as Message]);
                  scrollToBottom();

                  // Mark as read if not sent by current user
                  if (user?.id && data.sender_id !== user.id) {
                    supabase.rpc('mark_messages_as_read', {
                      p_reservation_id: reservationId,
                      p_user_id: user.id,
                    });
                  }
                }
              });
          } else if (payload.eventType === 'UPDATE') {
            // Update message (e.g., read status)
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id
                  ? { ...msg, ...(payload.new as Partial<Message>) }
                  : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reservationId, user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (messageText: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from('messages').insert({
        reservation_id: reservationId,
        sender_id: user.id,
        content: messageText,
      });

      if (error) throw error;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error sending message:', error);
      }
      toast.error('Failed to send message');
      throw error; // Re-throw to let MessageInput handle the error
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherParticipant.avatar_url || undefined} />
            <AvatarFallback>
              {getInitials(otherParticipant.first_name, otherParticipant.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {otherParticipant.first_name} {otherParticipant.last_name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {otherParticipant.role.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No messages yet</h3>
            <p className="text-sm text-muted-foreground">
              Start the conversation by sending a message below
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
