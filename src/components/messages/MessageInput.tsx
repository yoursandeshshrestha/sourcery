import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending || disabled) return;

    try {
      setSending(true);
      await onSend(message.trim());
      setMessage('');
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="flex gap-2 items-end">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          disabled={disabled || sending}
          rows={3}
          className="resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sending || disabled}
          size="icon"
          className="cursor-pointer h-10 w-10 shrink-0"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
