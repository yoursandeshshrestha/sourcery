import { useEffect, useState } from 'react';
import { Channel, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import { useStreamChat } from '@/contexts/StreamChatContext';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import type { Channel as StreamChannel } from 'stream-chat';

interface StreamMessageThreadProps {
  reservationId: string;
  otherParticipantId: string;
}

export function StreamMessageThread({ reservationId, otherParticipantId }: StreamMessageThreadProps) {
  const { client, isConnecting } = useStreamChat();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client || isConnecting) return;

    const initChannel = async () => {
      try {
        setLoading(true);

        // Upsert both users in Stream using server-side admin token
        await supabase.functions.invoke('stream-upsert-user', {
          body: { user_id: client.userID },
        });

        await supabase.functions.invoke('stream-upsert-user', {
          body: { user_id: otherParticipantId },
        });

        // Create channel with both members
        const newChannel = client.channel('messaging', `reservation_${reservationId}`, {
          members: [client.userID!, otherParticipantId],
        });

        await newChannel.watch();

        // Mark channel as read when opened
        await newChannel.markRead();

        setChannel(newChannel);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error initializing channel:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    initChannel();
  }, [client, isConnecting, reservationId, otherParticipantId]);

  if (isConnecting || loading || !channel) {
    return (
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

          {/* Incoming message skeleton */}
          <div className="flex items-start gap-2">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-[70%]">
              <Skeleton className="h-10 w-full rounded-2xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Input skeleton */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <Channel channel={channel}>
      <Window>
        <MessageList />
        <MessageInput />
      </Window>
      <Thread />
    </Channel>
  );
}
