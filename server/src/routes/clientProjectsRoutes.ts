import { asyncRouter } from '../utils/asyncRouter';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { newToken, hashToken } from '../utils/security';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { syncClientToZoho } from '../services/zohoService';

export interface LocalClientProject {
  _id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  proposal: string;
  quoteAmount: number;
  status: string;
  meetingLink?: string;
  zohoLeadId?: string;
  tokenHash: string;
  documents: string[];
  updates: Array<{ text: string; at: string }>;
  createdAt: string;
  updatedAt?: string;
}

const CLIENT_PROJECTS_FILE = path.join(os.tmpdir(), 'wp_client_projects.json');

let inMemoryClientProjects: LocalClientProject[] = [];

const loadClientProjects = (): LocalClientProject[] => {
  if (inMemoryClientProjects.length > 0) {
    return inMemoryClientProjects;
  }
  try {
    if (fs.existsSync(CLIENT_PROJECTS_FILE)) {
      const data = fs.readFileSync(CLIENT_PROJECTS_FILE, 'utf-8');
      inMemoryClientProjects = JSON.parse(data);
      if (Array.isArray(inMemoryClientProjects) && inMemoryClientProjects.length > 0) {
        return inMemoryClientProjects;
      }
    }
  } catch {
    // Ignore read errors
  }
  inMemoryClientProjects = [];
  return inMemoryClientProjects;
};

const persistClientProjects = (): void => {
  try {
    fs.writeFileSync(CLIENT_PROJECTS_FILE, JSON.stringify(inMemoryClientProjects, null, 2), 'utf-8');
  } catch {
    // Ignore write errors
  }
};

const router = asyncRouter();

// Public client tracking portal
router.post('/track', formSubmissionRateLimiter, async (req, res) => {
  const token = req.body.token ? String(req.body.token).trim() : '';
  if (!token) {
    return void sendError(res, 'Tracking token is required.', 400);
  }

  const hashed = hashToken(token);
  const projects = loadClientProjects();
  const project = projects.find((p) => p.tokenHash === hashed || p.tokenHash === token);

  if (!project) return void sendError(res, 'Invalid tracking code.', 404);
  sendSuccess(res, project, 'Project retrieved.');
});

// Admin routes
router.use(authenticateAdmin);

router.get('/', async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const search = req.query.search ? String(req.query.search).toLowerCase() : '';

  let list = loadClientProjects();
  if (search) {
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.clientName.toLowerCase().includes(search) ||
        p.clientEmail.toLowerCase().includes(search) ||
        p.status.toLowerCase().includes(search),
    );
  }

  const total = list.length;
  const paginated = list.slice((page - 1) * limit, page * limit);

  sendSuccess(res, paginated, 'Client projects retrieved.', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

router.post('/', async (req, res) => {
  const { sourceType, sourceId, title, clientName, clientEmail, proposal, quoteAmount, meetingLink } =
    req.body;
  const token = newToken();

  const project: LocalClientProject = {
    _id: `cp-${randomUUID().slice(0, 8)}`,
    sourceType: sourceType || 'inquiry',
    sourceId: sourceId || '',
    title: title || 'Website Project',
    clientName: clientName || 'Client',
    clientEmail: clientEmail || '',
    proposal: proposal || '',
    quoteAmount: Number(quoteAmount) || 0,
    status: 'inquiry',
    meetingLink: meetingLink || '',
    tokenHash: hashToken(token),
    documents: [],
    updates: [
      {
        text: 'Client project created and tracking initialized.',
        at: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const list = loadClientProjects();
  list.unshift(project);
  inMemoryClientProjects = list;
  persistClientProjects();

  // Trigger server-side Zoho CRM synchronization asynchronously/safely
  if (clientEmail && clientName) {
    syncClientToZoho({
      name: clientName,
      email: clientEmail,
      company: title || `${clientName} (Client)`,
      source: 'Client Registration',
      title: title || 'Website Project',
      quoteAmount: Number(quoteAmount) || 0,
      notes: proposal || `Client registered for ${title || 'Website Project'}. Tracking code generated.`,
    })
      .then((syncRes) => {
        if (syncRes.success && syncRes.leadId) {
          project.zohoLeadId = syncRes.leadId;
          persistClientProjects();
        }
      })
      .catch((err) => {
        console.warn('[Zoho CRM] Deferred client registration sync warning:', err.message);
      });
  }

  sendSuccess(res, { project, token }, 'Client project tracking created.', 201);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const list = loadClientProjects();
  const project = list.find((p) => p._id === id);

  if (!project) {
    return void sendError(res, 'Client project not found.', 404);
  }

  const { status, update, proposal, quoteAmount, documents, meetingLink } = req.body;

  if (status) project.status = status;
  if (proposal !== undefined) project.proposal = proposal;
  if (quoteAmount !== undefined) project.quoteAmount = Number(quoteAmount);
  if (Array.isArray(documents)) project.documents = documents;
  if (meetingLink !== undefined) project.meetingLink = meetingLink;

  if (update && typeof update === 'string' && update.trim().length > 0) {
    project.updates = project.updates || [];
    project.updates.unshift({
      text: update.trim(),
      at: new Date().toISOString(),
    });
  }

  project.updatedAt = new Date().toISOString();
  persistClientProjects();

  sendSuccess(res, project, 'Client project updated successfully.');
});

router.post('/:id/tracking-code', async (req, res) => {
  const { id } = req.params;
  const list = loadClientProjects();
  const project = list.find((p) => p._id === id);

  if (!project) {
    return void sendError(res, 'Client project not found.', 404);
  }

  const token = newToken();
  project.tokenHash = hashToken(token);
  project.updatedAt = new Date().toISOString();
  persistClientProjects();

  sendSuccess(res, { token }, 'New client tracking code generated.');
});

export default router;
