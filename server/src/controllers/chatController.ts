import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { answerStudioQuestion } from '../services/chatAssistant';
import { studioSettingsData } from '../data/content';
import { syncClientToZoho } from '../services/zohoService';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface ChatMessage {
  sender: 'client' | 'admin';
  senderName: string;
  message: string;
  sentAt: Date;
  isRead: boolean;
}

export interface ChatSession {
  sessionId: string;
  clientName: string;
  clientEmail: string;
  status: 'active' | 'closed';
  messages: ChatMessage[];
  lastMessageAt: Date;
}

import { loadJsonFromBestPath, saveJsonToAllPaths } from '../utils/storagePaths';

const inMemoryChatSessions: Map<string, ChatSession> = new Map();

const loadChatSessionsFromDisk = (): void => {
  try {
    const parsed = loadJsonFromBestPath<ChatSession[]>('wp_chats.json', []);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && item.sessionId && !inMemoryChatSessions.has(item.sessionId)) {
          inMemoryChatSessions.set(item.sessionId, {
            ...item,
            lastMessageAt: new Date(item.lastMessageAt || Date.now()),
            messages: (item.messages || []).map((m) => ({
              ...m,
              sentAt: new Date(m.sentAt || Date.now()),
            })),
          });
        }
      }
    }
  } catch {
    // Ignore read errors
  }
};

const persistChatSessions = (): void => {
  try {
    const list = Array.from(inMemoryChatSessions.values());
    saveJsonToAllPaths('wp_chats.json', list);
  } catch {
    // Ignore write errors in restricted environments
  }
};

// Initial disk load
loadChatSessionsFromDisk();

const createWelcomeSession = (
  sessionId: string,
  clientName?: string,
  clientEmail?: string,
): ChatSession => {
  return {
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
};

export const initOrGetSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, clientName, clientEmail } = req.body;

    if (!sessionId) {
      sendError(res, 'Session ID is required.', 400);
      return;
    }

    loadChatSessionsFromDisk();
    let session = inMemoryChatSessions.get(sessionId);

    if (!session) {
      session = createWelcomeSession(sessionId, clientName, clientEmail);
      inMemoryChatSessions.set(sessionId, session);
      persistChatSessions();
    } else {
      if (clientName) session.clientName = clientName.trim();
      if (clientEmail) session.clientEmail = clientEmail.toLowerCase().trim();
      persistChatSessions();
    }

    if (clientEmail && clientName && clientName.trim() !== 'Website Guest') {
      syncClientToZoho({
        name: clientName,
        email: clientEmail,
        source: 'Website Live Chat',
        title: 'Live Chat Consultation',
        notes: `Client started a live chat session (Session: ${sessionId}).`,
      }).catch((err) => console.warn('[Zoho CRM] Deferred chat lead sync:', err.message));
    }

    sendSuccess(res, session, 'Chat session active.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getSessionMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    loadChatSessionsFromDisk();
    let session = inMemoryChatSessions.get(sessionId);

    if (!session) {
      // Gracefully auto-create default welcome session rather than throwing 404
      session = createWelcomeSession(sessionId);
      inMemoryChatSessions.set(sessionId, session);
      persistChatSessions();
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

    loadChatSessionsFromDisk();
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
    persistChatSessions();

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
    loadChatSessionsFromDisk();
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

    loadChatSessionsFromDisk();
    let session = inMemoryChatSessions.get(sessionId);
    if (!session) {
      session = createWelcomeSession(sessionId);
      inMemoryChatSessions.set(sessionId, session);
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
    persistChatSessions();

    sendSuccess(res, session, 'Admin reply sent.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const closeConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    loadChatSessionsFromDisk();
    const session = inMemoryChatSessions.get(sessionId);
    if (session) {
      session.status = 'closed';
      persistChatSessions();
    }
    sendSuccess(res, session || { sessionId, status: 'closed' }, 'Conversation closed.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAllChatSessions = (): ChatSession[] => {
  loadChatSessionsFromDisk();
  return Array.from(inMemoryChatSessions.values());
};
