import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface StreamChatContextType {
  client: StreamChat | null;
  isConnecting: boolean;
}

const StreamChatContext = createContext<StreamChatContextType | undefined>(undefined);

export function StreamChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (client) {
        client.disconnectUser();
        setClient(null);
      }
      return;
    }

    const initStreamChat = async () => {
      try {
        setIsConnecting(true);

        // Get Stream token from Edge Function
        const { data, error } = await supabase.functions.invoke('stream-token');

        if (error) throw error;
        if (!data?.token || !data?.api_key) {
          throw new Error('Failed to get Stream credentials');
        }

        // Get profile for user metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        // Initialize Stream client
        const streamClient = StreamChat.getInstance(data.api_key);

        // Connect user with metadata
        await streamClient.connectUser(
          {
            id: user.id,
            name: profile ? `${profile.first_name} ${profile.last_name}` : 'User',
            image: profile?.avatar_url || undefined,
          },
          data.token
        );

        setClient(streamClient);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error initializing Stream Chat:', error);
        }
      } finally {
        setIsConnecting(false);
      }
    };

    initStreamChat();

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [user?.id]);

  return (
    <StreamChatContext.Provider value={{ client, isConnecting }}>
      {children}
    </StreamChatContext.Provider>
  );
}

export function useStreamChat() {
  const context = useContext(StreamChatContext);
  if (context === undefined) {
    throw new Error('useStreamChat must be used within a StreamChatProvider');
  }
  return context;
}
