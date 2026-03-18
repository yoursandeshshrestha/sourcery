import { useEffect } from 'react';
import { X } from 'lucide-react';
import { StreamMessageThread } from './StreamMessageThread';
import { Button } from '@/components/ui/button';
import { Chat } from 'stream-chat-react';
import { useStreamChat } from '@/contexts/StreamChatContext';

interface MessagesSidePanelProps {
  reservationId: string;
  otherParticipant: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    role: 'INVESTOR' | 'SOURCER';
  };
  dealHeadline: string;
  onClose: () => void;
}

export function MessagesSidePanel({
  reservationId,
  otherParticipant,
  dealHeadline,
  onClose,
}: MessagesSidePanelProps) {
  const { client } = useStreamChat();

  // Prevent body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-in fade-in backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] lg:w-[600px] bg-background border-l border-border z-50 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{dealHeadline}</h2>
              <p className="text-sm text-muted-foreground">
                {otherParticipant.first_name} {otherParticipant.last_name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="cursor-pointer shrink-0 ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-hidden">
            {client ? (
              <Chat client={client} theme="str-chat__theme-light">
                <StreamMessageThread
                  reservationId={reservationId}
                  otherParticipantId={otherParticipant.id}
                />
              </Chat>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Loading chat...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
