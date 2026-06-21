import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './downloads.db';
const resolvedDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

// Ensure the directory for the database exists
const dbDir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await open({
    filename: resolvedDbPath,
    driver: sqlite3.Database,
  });
  
  // Auto-initialize database schema on first connect
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      video_id TEXT,
      title TEXT,
      thumbnail TEXT,
      channel TEXT,
      duration INTEGER,
      format_id TEXT,
      format_note TEXT,
      ext TEXT,
      file_size INTEGER,
      status TEXT,
      progress INTEGER DEFAULT 0,
      speed TEXT DEFAULT '0 B/s',
      file_path TEXT,
      error TEXT,
      created_at TEXT
    )
  `);
  
  return dbInstance;
}

export async function initDb() {
  await getDb();
}

export interface DownloadItem {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
  format_id: string;
  format_note: string;
  ext: string;
  file_size: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  speed: string;
  file_path?: string;
  error?: string;
  created_at: string;
}

export async function getAllDownloads(): Promise<DownloadItem[]> {
  const db = await getDb();
  return db.all('SELECT * FROM downloads ORDER BY created_at DESC') as Promise<DownloadItem[]>;
}

export async function getDownloadById(id: string): Promise<DownloadItem | undefined> {
  const db = await getDb();
  return db.get('SELECT * FROM downloads WHERE id = ?', id) as Promise<DownloadItem | undefined>;
}

export async function insertDownload(download: DownloadItem): Promise<void> {
  const db = await getDb();
  await db.run(
    `INSERT INTO downloads (
      id, video_id, title, thumbnail, channel, duration, 
      format_id, format_note, ext, file_size, status, 
      progress, speed, file_path, error, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      download.id,
      download.video_id,
      download.title,
      download.thumbnail,
      download.channel,
      download.duration,
      download.format_id,
      download.format_note,
      download.ext,
      download.file_size,
      download.status,
      download.progress,
      download.speed,
      download.file_path || null,
      download.error || null,
      download.created_at,
    ]
  );
}

export async function updateDownload(
  id: string,
  fields: Partial<Omit<DownloadItem, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDb();
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = keys.map((key) => (fields as any)[key]);
  values.push(id);

  await db.run(`UPDATE downloads SET ${setClause} WHERE id = ?`, values);
}

export async function deleteDownload(id: string): Promise<void> {
  const db = await getDb();
  await db.run('DELETE FROM downloads WHERE id = ?', id);
}
