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
const TMP_UPLOAD_DIR = path.join(os.tmpdir(), 'wp_uploads');

try {
  if (!fs.existsSync(TMP_UPLOAD_DIR)) {
    fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });
  }
} catch {
  // Ignore filesystem errors in restricted serverless environments
}

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

      // Best-effort write to /tmp for multi-invocation warm container retrieval
      try {
        const diskPayload = {
          filename: stored.filename,
          mime: stored.mime,
          content: stored.content.toString('base64'),
        };
        fs.writeFileSync(path.join(TMP_UPLOAD_DIR, `${fileId}.json`), JSON.stringify(diskPayload));
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

    // If not in current memory instance, check /tmp disk cache
    if (!file) {
      const diskPath = path.join(TMP_UPLOAD_DIR, `${req.params.id}.json`);
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
        } catch {
          // ignore corrupted temp file
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
