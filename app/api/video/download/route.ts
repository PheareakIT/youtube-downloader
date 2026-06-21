import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { insertDownload, DownloadItem } from '@/utils/db';
import { startDownload } from '@/utils/downloader';

export async function POST(req: NextRequest) {
  try {
    const { 
      url, 
      formatId, 
      ext, 
      title, 
      thumbnail, 
      channel, 
      duration, 
      fileSize, 
      resolution 
    } = await req.json();

    if (!url || !formatId || !ext || !title) {
      return NextResponse.json({ error: 'Missing required download fields' }, { status: 400 });
    }

    const id = randomUUID();
    const isAudioOnly = ext === 'mp3';

    // Extract video ID from URL
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : '';

    const newDownload: DownloadItem = {
      id,
      video_id: videoId,
      title,
      thumbnail,
      channel,
      duration: duration || 0,
      format_id: formatId,
      format_note: resolution || (isAudioOnly ? 'MP3' : 'MP4'),
      ext,
      file_size: fileSize || 0,
      status: 'pending',
      progress: 0,
      speed: '0 B/s',
      created_at: new Date().toISOString(),
    };

    // Store log in database
    await insertDownload(newDownload);

    // Start background process (non-blocking)
    startDownload({
      id,
      url,
      formatId,
      ext,
      isAudioOnly,
      bitrate: resolution // passes '128kbps' or '320kbps'
    }).catch((err) => {
      console.error(`[Background Download Queue Error] ID: ${id}`, err);
    });

    return NextResponse.json({ id, success: true });

  } catch (error: any) {
    console.error('Error queuing download:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start download queue' },
      { status: 500 }
    );
  }
}
