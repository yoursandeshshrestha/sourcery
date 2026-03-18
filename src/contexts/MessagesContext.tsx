import { createContext, useContext, useState, type ReactNode } from 'react';

export interface MessageThread {
  reservationId: string;
  dealHeadline: string;
  otherParticipant: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    role: 'INVESTOR' | 'SOURCER';
  };
}

interface MessagesContextType {
  isOpen: boolean;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  activeThread: MessageThread | null;
  openThread: (thread: MessageThread) => void;
  closeThread: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);

  const openWidget = () => setIsOpen(true);
  const closeWidget = () => {
    setIsOpen(false);
    setActiveThread(null);
  };
  const toggleWidget = () => setIsOpen((prev) => !prev);

  const openThread = (thread: MessageThread) => {
    setActiveThread(thread);
    setIsOpen(true);
  };

  const closeThread = () => {
    setActiveThread(null);
  };

  return (
    <MessagesContext.Provider
      value={{
        isOpen,
        openWidget,
        closeWidget,
        toggleWidget,
        activeThread,
        openThread,
        closeThread,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
