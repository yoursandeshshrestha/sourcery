import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessagesContext';
import { useStreamChat } from '@/contexts/StreamChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, X, ArrowLeft } from 'lucide-react';
import { Chat } from 'stream-chat-react';
import { StreamMessageThread } from './StreamMessageThread';

interface MessageThread {
  reservation_id: string;
  deal_headline: string;
  other_participant: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    role: 'INVESTOR' | 'SOURCER';
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

export function MessagesWidget() {
  const { user } = useAuth();
  const { client } = useStreamChat();
  const { isOpen, closeWidget, activeThread, openThread, closeThread } = useMessages();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch message threads
  const fetchThreads = async () => {
    if (!user?.id || !client) return;

    try {
      setLoading(true);

      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          id,
          investor_id,
          sourcer_id,
          deals (
            headline
          ),
          investor:profiles!reservations_investor_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            role
          ),
          sourcer:profiles!reservations_sourcer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            role
          )
        `)
        .or(`investor_id.eq.${user.id},sourcer_id.eq.${user.id}`);

      if (reservationsError) throw reservationsError;

      if (!reservations || reservations.length === 0) {
        setThreads([]);
        return;
      }

      const threadsData = await Promise.all(
        reservations.map(async (reservation) => {
          const otherParticipant =
            reservation.investor_id === user.id
              ? reservation.sourcer
              : reservation.investor;

          let lastMessage = null;
          let unreadCount = 0;

          try {
            // Get Stream channel for this reservation
            const channelId = `reservation_${reservation.id}`;
            const channel = client.channel('messaging', channelId);
            const state = await channel.watch();

            // Get last message from Stream
            if (state.messages && state.messages.length > 0) {
              const lastMsg = state.messages[state.messages.length - 1];
              lastMessage = {
                content: lastMsg.text || '',
                created_at: lastMsg.created_at || new Date().toISOString(),
                sender_id: lastMsg.user?.id || '',
              };
            }

            // Get unread count from Stream
            unreadCount = channel.countUnread() || 0;
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error(`Error fetching Stream data for channel ${reservation.id}:`, error);
            }
          }

          return {
            reservation_id: reservation.id,
            deal_headline: reservation.deals?.headline || 'Unknown Deal',
            other_participant: otherParticipant,
            last_message: lastMessage,
            unread_count: unreadCount,
          };
        })
      );

      threadsData.sort((a, b) => {
        if (!a.last_message) return 1;
        if (!b.last_message) return -1;
        return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
      });

      setThreads(threadsData as MessageThread[]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching message threads:', error);
      }
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && client) {
      if (!activeThread) {
        // Refresh thread list when returning to list view
        fetchThreads();
      }
    }
  }, [isOpen, user?.id, activeThread, client]);

  // Subscribe to new messages via Stream
  useEffect(() => {
    if (!client || !isOpen) return;

    const handleEvent = () => {
      fetchThreads();
    };

    client.on('message.new', handleEvent);
    client.on('message.read', handleEvent);

    return () => {
      client.off('message.new', handleEvent);
      client.off('message.read', handleEvent);
    };
  }, [client, isOpen]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const totalUnread = threads.reduce((sum, thread) => sum + thread.unread_count, 0);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/10 z-40 lg:hidden animate-in fade-in duration-200"
        onClick={closeWidget}
      />

      <div className="fixed bottom-0 right-0 lg:bottom-6 lg:right-6 z-50 w-full lg:w-[420px] h-dvh lg:h-[640px] flex flex-col lg:rounded-xl border-t lg:border border-[#E5E7EB] overflow-hidden animate-in slide-in-from-bottom-4 lg:slide-in-from-right-4 duration-300 bg-linear-to-b from-[#F8FAFC] via-white to-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {activeThread && (
            <button
              onClick={() => {
                closeThread();
                // Refresh threads to update unread counts
                fetchThreads();
              }}
              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </button>
          )}
          <h2 className="font-semibold text-slate-900 text-[15px] truncate">
            {activeThread
              ? `Chat with ${activeThread.otherParticipant.role === 'INVESTOR' ? 'Investor' : 'Sourcer'}`
              : 'Messages'}
          </h2>
        </div>
        <button
          onClick={closeWidget}
          className="p-1.5 hover:bg-black/5 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X className="h-4 w-4 text-slate-700" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeThread ? (
          // Thread View
          <div className="h-full">
            {client ? (
              <Chat client={client} theme="str-chat__theme-light">
                <StreamMessageThread
                  reservationId={activeThread.reservationId}
                  otherParticipantId={activeThread.otherParticipant.id}
                />
              </Chat>
            ) : (
              <div className="h-full flex flex-col bg-[#F8FAFC]">
                <div className="flex-1 p-4 space-y-4">
                  {/* Incoming message skeleton */}
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1 max-w-[70%]">
                      <Skeleton className="h-16 w-full rounded-2xl" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>

                  {/* Outgoing message skeleton */}
                  <div className="flex items-start gap-2 justify-end">
                    <div className="space-y-2 flex-1 max-w-[70%] flex flex-col items-end">
                      <Skeleton className="h-12 w-full rounded-2xl" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>

                  {/* Incoming message skeleton */}
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1 max-w-[70%]">
                      <Skeleton className="h-20 w-full rounded-2xl" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>

                  {/* Outgoing message skeleton */}
                  <div className="flex items-start gap-2 justify-end">
                    <div className="space-y-2 flex-1 max-w-[70%] flex flex-col items-end">
                      <Skeleton className="h-14 w-full rounded-2xl" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>

                {/* Input skeleton */}
                <div className="p-4 border-t border-[#E5E7EB] bg-white">
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
              </div>
            )}
          </div>
        ) : (
          // Thread List
          <div className="h-full overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <MessageSquare className="h-7 w-7 text-slate-500" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">No conversations yet</h3>
                <p className="text-sm text-slate-600 max-w-[280px]">
                  Messages will appear here when you have active deals with reservations
                </p>
              </div>
            ) : (
              <div>
                {threads.map((thread, index) => (
                  <div
                    key={thread.reservation_id}
                    className={`px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      index !== threads.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                    onClick={() => {
                      if (!thread.other_participant) return;
                      openThread({
                        reservationId: thread.reservation_id,
                        dealHeadline: thread.deal_headline,
                        otherParticipant: thread.other_participant,
                      });
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11 border border-slate-200">
                          <AvatarImage src={thread.other_participant?.avatar_url || undefined} />
                          <AvatarFallback className="bg-slate-100 text-slate-700 text-sm font-medium">
                            {thread.other_participant
                              ? getInitials(
                                  thread.other_participant.first_name,
                                  thread.other_participant.last_name
                                )
                              : '?'}
                          </AvatarFallback>
                        </Avatar>
                        {thread.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-[#1287ff] text-white text-[11px] font-semibold rounded-full px-1.5">
                            {thread.unread_count > 9 ? '9+' : thread.unread_count}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <h3 className="font-semibold text-slate-900 text-[14px] truncate">
                            {thread.other_participant
                              ? `${thread.other_participant.first_name} ${thread.other_participant.last_name}`
                              : 'Unknown User'}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 truncate mb-1.5 font-medium">
                          {thread.deal_headline}
                        </p>

                        {thread.last_message && (
                          <p className={`text-xs truncate ${
                            thread.unread_count > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'
                          }`}>
                            {thread.last_message.sender_id === user?.id && (
                              <span className="text-slate-500">You: </span>
                            )}
                            {thread.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}

interface Position {
  x: number;
  y: number;
}

export function MessagesWidgetButton() {
  const { isOpen, toggleWidget } = useMessages();
  const { user, profile } = useAuth();
  const { client } = useStreamChat();
  const [totalUnread, setTotalUnread] = useState(0);
  const [position, setPosition] = useState<Position>(() => {
    // Load position from localStorage or use default
    const saved = localStorage.getItem('chatButtonPosition');
    if (saved) {
      return JSON.parse(saved);
    }
    return { x: window.innerWidth - 150, y: window.innerHeight - 80 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // Fetch unread count from Stream
  useEffect(() => {
    if (!user?.id || !client) return;

    const fetchUnread = async () => {
      try {
        const { data: reservations } = await supabase
          .from('reservations')
          .select('id')
          .or(`investor_id.eq.${user.id},sourcer_id.eq.${user.id}`);

        if (!reservations) return;

        let total = 0;
        for (const reservation of reservations) {
          try {
            const channelId = `reservation_${reservation.id}`;
            const channel = client.channel('messaging', channelId);
            await channel.watch();
            total += channel.countUnread() || 0;
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error(`Error fetching unread for channel ${reservation.id}:`, error);
            }
          }
        }

        setTotalUnread(total);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching total unread:', error);
        }
      }
    };

    fetchUnread();

    // Subscribe to Stream events
    const handleEvent = () => {
      fetchUnread();
    };

    client.on('message.new', handleEvent);
    client.on('message.read', handleEvent);

    return () => {
      client.off('message.new', handleEvent);
      client.off('message.read', handleEvent);
    };
  }, [user?.id, client]);

  // Handle drag events
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Mark as moved if dragged more than 5px
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasMoved(true);
      }

      setPosition((prev: Position) => {
        const newX = Math.max(0, Math.min(window.innerWidth - 200, prev.x + deltaX));
        const newY = Math.max(0, Math.min(window.innerHeight - 60, prev.y + deltaY));
        return { x: newX, y: newY };
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save position to localStorage
      localStorage.setItem('chatButtonPosition', JSON.stringify(position));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  // Handle touch events for mobile
  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;

      // Mark as moved if dragged more than 5px
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasMoved(true);
      }

      setPosition((prev: Position) => {
        const newX = Math.max(0, Math.min(window.innerWidth - 200, prev.x + deltaX));
        const newY = Math.max(0, Math.min(window.innerHeight - 60, prev.y + deltaY));
        return { x: newX, y: newY };
      });

      setDragStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      localStorage.setItem('chatButtonPosition', JSON.stringify(position));
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleClick = () => {
    // Only trigger toggleWidget if user didn't drag the button
    if (!hasMoved) {
      toggleWidget();
    }
  };

  // Don't show widget button if user is not logged in, widget is open, or user is admin
  if (!user || isOpen || profile?.role === 'ADMIN') {
    return null;
  }

  const buttonText = profile?.role === 'SOURCER' ? 'Chat with Investor' : 'Chat with Sourcer';

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-50 h-12 px-5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-full transition-colors duration-200 ${
        isDragging ? 'cursor-grabbing shadow-lg' : 'cursor-grab'
      } flex items-center justify-center gap-2 group select-none`}
    >
      <span className="font-medium text-[15px]">{buttonText}</span>
      {totalUnread > 0 && (
        <div className="h-5 min-w-5 flex items-center justify-center bg-[#1287ff] text-white text-xs font-bold rounded-full px-1.5">
          {totalUnread > 99 ? '99+' : totalUnread}
        </div>
      )}
    </button>
  );
}
