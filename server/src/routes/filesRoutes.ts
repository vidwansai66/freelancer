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
      return void sendError(res, 'File not found.', 404);
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
