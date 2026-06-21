const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function test() {
  const dbPath = path.resolve(__dirname, '../downloads.db');
  console.log('Opening database at:', dbPath);
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('Initializing schema...');
  await db.exec(`
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

  console.log('Inserting mock record...');
  const mockId = 'test-uuid-123';
  await db.run(
    `INSERT INTO downloads (
      id, video_id, title, thumbnail, channel, duration, 
      format_id, format_note, ext, file_size, status, 
      progress, speed, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mockId,
      'dQw4w9WgXcQ',
      'Never Gonna Give You Up',
      'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg',
      'Rick Astley',
      212,
      '137',
      '1080p',
      'mp4',
      15000000,
      'completed',
      100,
      'Done',
      new Date().toISOString()
    ]
  );
  console.log('Inserted successfully!');

  console.log('Querying record...');
  const row = await db.get('SELECT * FROM downloads WHERE id = ?', mockId);
  console.log('Query result:', row);

  console.log('Cleaning up mock record...');
  await db.run('DELETE FROM downloads WHERE id = ?', mockId);
  console.log('Deleted successfully!');

  await db.close();
  console.log('Database verification completed successfully!');
}

test().catch(console.error);
