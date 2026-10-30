import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { chatApi } from '../services/api';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleChat: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  clientEmail: string;
  setClientEmail: (email: string) => void;
  clientName: string;
  setClientName: (name: string) => void;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>(() => {
    return localStorage.getItem('studio_chat_name') || '';
  });
  const [clientEmail, setClientEmail] = useState(
    () => localStorage.getItem('studio_chat_email') || '',
  );
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Generate or retrieve persistent sessionId
  const [sessionId] = useState<string>(() => {
    let id = localStorage.getItem('studio_chat_session_id');
    if (!id || !/^[a-f0-9]{64}$/.test(id)) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((value) => value.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem('studio_chat_session_id', id);
    }
    return id;
  });

  const lastMessageCountRef = useRef<number>(0);

  // Initial session startup
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return;
    if (!clientName || !clientEmail) return;
    const initChat = async () => {
      try {
        const conv = await chatApi.initSession({
          sessionId,
          clientEmail: clientEmail || undefined,
          clientName: clientName || undefined,
        });
        if (conv && conv.messages) {
          setMessages(conv.messages);
          lastMessageCountRef.current = conv.messages.length;
        }
      } catch (err) {
        console.warn('[Chat] Could not connect to chat server initially:', err);
      }
    };

    initChat();
  }, [sessionId, clientName, clientEmail]);

  // Periodic polling for incoming admin replies
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return;
    if (!clientName || !clientEmail) return;
    let isReinitializing = false;

    const interval = setInterval(async () => {
      if (window.location.pathname.startsWith('/admin')) return;
      try {
        const msgs = await chatApi.getMessages(sessionId);
        if (Array.isArray(msgs)) {
          if (msgs.length > lastMessageCountRef.current) {
            // New message arrived
            if (!isOpen) {
              const newMsgs = msgs.slice(lastMessageCountRef.current);
              const adminMsgs = newMsgs.filter((m: ChatMessage) => m.sender !== 'client');
              if (adminMsgs.length > 0) {
                setUnreadCount((prev) => prev + adminMsgs.length);
              }
            }
          }
          setMessages(msgs);
          lastMessageCountRef.current = msgs.length;
        }
      } catch (err: any) {
        // If the session was missing on the server (e.g. fresh deployment), auto-reinitialize quietly
        if (err?.response?.status === 404 && !isReinitializing) {
          isReinitializing = true;
          try {
            const reinitialized = await chatApi.initSession({
              sessionId,
              clientEmail: clientEmail || undefined,
              clientName: clientName || undefined,
            });
            if (reinitialized?.messages) {
              setMessages(reinitialized.messages);
              lastMessageCountRef.current = reinitialized.messages.length;
            }
          } catch {
            // Quiet fallback
          } finally {
            isReinitializing = false;
          }
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [sessionId, isOpen, clientName, clientEmail]);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
      }
      return next;
    });
  };

  const handleSetClientName = (name: string) => {
    setClientName(name);
    localStorage.setItem('studio_chat_name', name);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!clientName || !clientEmail) {
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: 'Enter your name and email before sending a chat message.',
        }),
      );
      throw new Error('Chat identity is required.');
    }

    setIsLoading(true);
    try {
      await chatApi.initSession({ sessionId, clientName, clientEmail });
      await chatApi.sendMessage(sessionId, text, clientName || undefined);
      const latest = await chatApi.getMessages(sessionId);
      setMessages(latest);
      lastMessageCountRef.current = latest.length;
    } catch (err) {
      console.error('[Chat] Failed to send message:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleChat,
        messages,
        sendMessage,
        isLoading,
        clientName,
        clientEmail,
        setClientEmail: (email: string) => {
          setClientEmail(email);
          localStorage.setItem('studio_chat_email', email);
        },
        setClientName: handleSetClientName,
        unreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
