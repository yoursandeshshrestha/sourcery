import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useMessages } from '@/contexts/MessagesContext';
import { Button } from '@/components/ui/button';

export default function MessagesPage() {
  const { openWidget } = useMessages();

  useEffect(() => {
    // Open the widget when this page loads
    openWidget();
  }, [openWidget]);

  return (
    <div className="px-6 pt-6 pb-8 max-w-4xl mx-auto">
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <MessageSquare className="h-16 w-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Use the global messaging widget to communicate with investors and sourcers about your deals.
            Click the message icon in the bottom right corner to access your conversations.
          </p>
          <Button onClick={openWidget} className="cursor-pointer">
            <MessageSquare className="h-4 w-4 mr-2" />
            Open Messages Widget
          </Button>
        </div>
      </Card>
    </div>
  );
}
