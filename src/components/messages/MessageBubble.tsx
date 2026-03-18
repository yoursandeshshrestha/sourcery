import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    is_read: boolean;
    sender: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  };
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={message.sender.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {getInitials(message.sender.first_name, message.sender.last_name)}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[70%]', isOwnMessage ? 'items-end' : 'items-start')}>
        {/* Sender Name */}
        <div className={cn('text-xs text-muted-foreground mb-1', isOwnMessage ? 'text-right' : 'text-left')}>
          {isOwnMessage ? 'You' : `${message.sender.first_name} ${message.sender.last_name}`}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-2.5 break-words',
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp and Read Status */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDateTime(message.created_at)}
          </span>
          {isOwnMessage && (
            <span className="text-xs text-muted-foreground">
              {message.is_read ? '✓✓ Read' : '✓ Sent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
