import { asyncRouter } from '../utils/asyncRouter';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { newToken, hashToken } from '../utils/security';
import { validateFile } from '../utils/fileRules';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { randomUUID } from 'crypto';

interface StoredFile {
  _id: string;
  filename: string;
  mime: string;
  content: Buffer;
  size: number;
  visibility: 'public' | 'private';
  claimHash: string;
  expiresAt?: Date;
  createdAt: Date;
}

import fs from 'fs';
import path from 'path';
import os from 'os';

const inMemoryFiles: Map<string, StoredFile> = new Map();

const getUploadDirs = (): string[] => {
  const list: string[] = [];
  const baseDataDir = process.cwd().endsWith('server')
    ? path.join(process.cwd(), 'data', 'uploads')
    : path.join(process.cwd(), 'server', 'data', 'uploads');
  try {
    if (!fs.existsSync(baseDataDir)) fs.mkdirSync(baseDataDir, { recursive: true });
    list.push(baseDataDir);
  } catch {}

  const tmpDir = path.join(os.tmpdir(), 'wp_uploads');
  try {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    list.push(tmpDir);
  } catch {}
  return list;
};

const router = asyncRouter();

router.post('/', formSubmissionRateLimiter, async (req, res) => {
  const save = async () => {
    try {
      const { filename, mime, base64, visibility } = req.body;
      const checked = validateFile(filename, mime, base64);
      if (visibility === 'public' && mime === 'application/pdf') {
        return void sendError(res, 'Public uploads must be images.', 400);
      }
      const token = newToken();
      const fileId = randomUUID();
      const stored: StoredFile = {
        _id: fileId,
        filename: checked.filename,
        mime,
        content: checked.content,
        size: checked.content.length,
        visibility: visibility || 'private',
        claimHash: hashToken(token),
        createdAt: new Date(),
        ...(visibility === 'private' && !req.headers.authorization
          ? { expiresAt: new Date(Date.now() + 86400000) }
          : {}),
      };

      inMemoryFiles.set(fileId, stored);

      // Best-effort write to persistent storage dirs for warm container and local persistence
      try {
        const diskPayload = {
          filename: stored.filename,
          mime: stored.mime,
          content: stored.content.toString('base64'),
        };
        const payloadStr = JSON.stringify(diskPayload);
        for (const dir of getUploadDirs()) {
          try {
            fs.writeFileSync(path.join(dir, `${fileId}.json`), payloadStr, 'utf-8');
          } catch {}
        }
      } catch {
        // Fallback safely to memory
      }

      sendSuccess(
        res,
        { fileId, filename: stored.filename, token, url: `/api/files/${fileId}` },
        'File uploaded.',
        201,
      );
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  };

  if (req.headers.authorization) {
    await authenticateAdmin(req, res, () => {
      void save();
    });
  } else {
    await save();
  }
});

router.get('/:id', async (req, res) => {
  try {
    let file = inMemoryFiles.get(req.params.id);

    // If not in current memory instance, check persistent disk directories
    if (!file) {
      for (const dir of getUploadDirs()) {
        const diskPath = path.join(dir, `${req.params.id}.json`);
        if (fs.existsSync(diskPath)) {
          try {
            const raw = JSON.parse(fs.readFileSync(diskPath, 'utf8'));
            file = {
              _id: req.params.id,
              filename: raw.filename,
              mime: raw.mime,
              content: Buffer.from(raw.content, 'base64'),
              size: Buffer.from(raw.content, 'base64').length,
              visibility: 'private',
              claimHash: '',
              createdAt: new Date(),
            };
            inMemoryFiles.set(req.params.id, file);
            break;
          } catch {
            // ignore corrupted file
          }
        }
      }
    }

    if (!file) {
      // Graceful fallback for missing ephemeral uploads: return sleek branded SVG instead of 404
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="none">
  <rect width="800" height="450" fill="#1C3536"/>
  <rect x="20" y="20" width="760" height="410" rx="16" stroke="#FEDAB8" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="8 8"/>
  <circle cx="400" cy="180" r="48" fill="#FEDAB8" fill-opacity="0.15"/>
  <path d="M380 195L395 180L405 190L420 170L435 195H380Z" fill="#FEDAB8"/>
  <circle cx="390" cy="165" r="5" fill="#FEDAB8"/>
  <text x="400" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#FEDAB8" text-anchor="middle">Teja Web Studio Showcase</text>
  <text x="400" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#FEDAB8" fill-opacity="0.7" text-anchor="middle">Project Visual Asset</text>
</svg>`;
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return void res.send(Buffer.from(fallbackSvg));
    }

    res.setHeader('Content-Type', file.mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    res.send(file.content);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

export default router;
