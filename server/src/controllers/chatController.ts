import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { answerStudioQuestion } from '../services/chatAssistant';
import { studioSettingsData } from '../data/content';

interface ChatMessage {
  sender: 'client' | 'admin';
  senderName: string;
  message: string;
  sentAt: Date;
  isRead: boolean;
}

interface ChatSession {
  sessionId: string;
  clientName: string;
  clientEmail: string;
  status: 'active' | 'closed';
  messages: ChatMessage[];
  lastMessageAt: Date;
}

const inMemoryChatSessions: Map<string, ChatSession> = new Map();

export const initOrGetSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, clientName, clientEmail } = req.body;

    if (!sessionId) {
      sendError(res, 'Session ID is required.', 400);
      return;
    }

    let session = inMemoryChatSessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        clientName: clientName?.trim() || 'Website Guest',
        clientEmail: clientEmail?.toLowerCase().trim() || '',
        status: 'active',
        messages: [
          {
            sender: 'admin',
            senderName: 'Teja Web Studio',
            message:
              'Hello! Thanks for visiting Teja Web Studio. How can we help you with your website project today?',
            sentAt: new Date(),
            isRead: true,
          },
        ],
        lastMessageAt: new Date(),
      };
      inMemoryChatSessions.set(sessionId, session);
    } else {
      if (clientName) session.clientName = clientName.trim();
      if (clientEmail) session.clientEmail = clientEmail.toLowerCase().trim();
    }

    sendSuccess(res, session, 'Chat session active.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getSessionMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = inMemoryChatSessions.get(sessionId);

    if (!session) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    sendSuccess(res, session.messages, 'Messages retrieved.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const sendClientMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { message, clientName } = req.body;

    if (!message || !message.trim()) {
      sendError(res, 'Message text is required.', 400);
      return;
    }

    let session = inMemoryChatSessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        clientName: clientName?.trim() || 'Website Guest',
        clientEmail: '',
        status: 'active',
        messages: [],
        lastMessageAt: new Date(),
      };
      inMemoryChatSessions.set(sessionId, session);
    }

    const cleanMessage = message.trim();
    const userMsg: ChatMessage = {
      sender: 'client',
      senderName: clientName?.trim() || session.clientName || 'Visitor',
      message: cleanMessage,
      sentAt: new Date(),
      isRead: true,
    };
    session.messages.push(userMsg);
    session.lastMessageAt = new Date();

    // Generate intelligent studio assistant reply
    let reply =
      'Thank you for your message! For an immediate quote or live consultation, feel free to WhatsApp us directly at +91 94909 55048.';

    try {
      const priorMessages = session.messages.slice(-5).map((m) => m.message);
      const aiResponse = await answerStudioQuestion(cleanMessage, priorMessages);
      if (aiResponse) {
        reply = aiResponse;
      }
    } catch {
      // Fallback
    }

    const assistantMsg: ChatMessage = {
      sender: 'admin',
      senderName: 'Teja Web Studio',
      message: reply,
      sentAt: new Date(),
      isRead: true,
    };
    session.messages.push(assistantMsg);

    sendSuccess(
      res,
      {
        session,
        reply: assistantMsg,
        whatsappConnectUrl: `https://wa.me/${studioSettingsData.whatsappNumber}?text=${encodeURIComponent(
          `Hi Teja Web Studio! I am messaging from the website: "${cleanMessage}"`,
        )}`,
      },
      'Message sent.',
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAdminConversations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const conversations = Array.from(inMemoryChatSessions.values());
    sendSuccess(res, conversations, 'Conversations retrieved.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const sendAdminReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    const session = inMemoryChatSessions.get(sessionId);
    if (!session) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }

    const adminMsg: ChatMessage = {
      sender: 'admin',
      senderName: 'Studio Admin',
      message: message.trim(),
      sentAt: new Date(),
      isRead: true,
    };
    session.messages.push(adminMsg);
    session.lastMessageAt = new Date();

    sendSuccess(res, session, 'Admin reply sent.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const closeConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = inMemoryChatSessions.get(sessionId);
    if (!session) {
      sendError(res, 'Conversation not found.', 404);
      return;
    }
    session.status = 'closed';
    sendSuccess(res, session, 'Conversation closed.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
