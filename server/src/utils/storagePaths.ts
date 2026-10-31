import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Generates an array of potential file paths for persistent JSON storage,
 * prioritizing repository data directory and falling back to os.tmpdir().
 */
export const getCandidateFilePaths = (filename: string): string[] => {
  const list: string[] = [];
  const baseDataDir = process.cwd().endsWith('server')
    ? path.join(process.cwd(), 'data')
    : path.join(process.cwd(), 'server', 'data');

  try {
    if (!fs.existsSync(baseDataDir)) fs.mkdirSync(baseDataDir, { recursive: true });
    list.push(path.join(baseDataDir, filename));
  } catch {}

  try {
    const relData = path.resolve(__dirname, '..', '..', 'data');
    if (!fs.existsSync(relData)) fs.mkdirSync(relData, { recursive: true });
    list.push(path.join(relData, filename));
  } catch {}

  list.push(path.join(os.tmpdir(), filename));
  return Array.from(new Set(list));
};

/**
 * Loads JSON data from the most recently modified valid file among all candidate paths.
 */
export const loadJsonFromBestPath = <T>(filename: string, fallback: T): T => {
  const paths = getCandidateFilePaths(filename);
  const existing = paths
    .filter((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    })
    .map((p) => {
      try {
        return { path: p, mtime: fs.statSync(p).mtimeMs };
      } catch {
        return { path: p, mtime: 0 };
      }
    })
    .sort((a, b) => b.mtime - a.mtime);

  for (const item of existing) {
    try {
      const raw = fs.readFileSync(item.path, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (parsed !== null && parsed !== undefined) {
          return parsed as T;
        }
      }
    } catch {}
  }
  return fallback;
};

/**
 * Persists JSON data across all candidate paths (ignoring read-only write failures).
 */
export const saveJsonToAllPaths = (filename: string, data: any): void => {
  const payload = JSON.stringify(data, null, 2);
  const paths = getCandidateFilePaths(filename);
  for (const p of paths) {
    try {
      fs.writeFileSync(p, payload, 'utf-8');
    } catch {}
  }
};

