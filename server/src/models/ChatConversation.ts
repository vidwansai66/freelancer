export interface IChatMessage {
  sender: 'client' | 'admin';
  senderName: string;
  message: string;
  sentAt: Date;
  isRead: boolean;
}

export interface IChatConversation {
  id: string;
  sessionId: string;
  clientName: string;
  clientEmail?: string;
  status: 'active' | 'closed';
  messages: IChatMessage[];
  lastMessageAt: Date;
}
