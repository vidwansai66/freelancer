import { asyncRouter } from '../utils/asyncRouter';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { newToken, hashToken } from '../utils/security';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { randomUUID } from 'crypto';

interface LocalClientProject {
  _id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  proposal: string;
  quoteAmount: number;
  status: string;
  tokenHash: string;
  documents: string[];
  createdAt: string;
}

const inMemoryClientProjects: LocalClientProject[] = [];

const router = asyncRouter();

router.post('/track', formSubmissionRateLimiter, async (req, res) => {
  const token = req.body.token ? hashToken(req.body.token) : '';
  const project = inMemoryClientProjects.find((p) => p.tokenHash === token);
  if (!project) return void sendError(res, 'Invalid tracking code.', 404);
  sendSuccess(res, project, 'Project retrieved.');
});

router.use(authenticateAdmin);

router.get('/', async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const total = inMemoryClientProjects.length;
  const paginated = inMemoryClientProjects.slice((page - 1) * limit, page * limit);

  sendSuccess(res, paginated, 'Client projects retrieved.', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

router.post('/', async (req, res) => {
  const { sourceType, sourceId, title, clientName, clientEmail, proposal, quoteAmount } = req.body;
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
    tokenHash: hashToken(token),
    documents: [],
    createdAt: new Date().toISOString(),
  };

  inMemoryClientProjects.push(project);
  sendSuccess(res, { project, token }, 'Client project tracking created.', 201);
});

export default router;
