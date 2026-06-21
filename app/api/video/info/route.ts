import { NextRequest, NextResponse } from 'next/server';
import { create } from 'youtube-dl-exec';
import path from 'path';

const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.join(process.cwd(), 'node_modules', 'youtube-dl-exec', 'bin', binaryName);
const youtubedl = create(binaryPath);

const YT_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !YT_REGEX.test(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Retrieve video metadata in JSON format
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    }) as any;

    if (!info) {
      return NextResponse.json({ error: 'Could not fetch video information' }, { status: 404 });
    }

    const videoId = info.id;
    const title = info.title;
    const channel = info.uploader || info.channel || 'Unknown Channel';
    const duration = info.duration || 0; // in seconds
    const viewCount = info.view_count || 0;
    
    // Choose high-quality thumbnail
    let thumbnail = '';
    if (info.thumbnails && info.thumbnails.length > 0) {
      // Find the thumbnail with the largest width/height
      const sortedThumbnails = [...info.thumbnails].sort(
        (a, b) => (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
      );
      thumbnail = sortedThumbnails[0].url;
    } else {
      thumbnail = info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    // Process formats
    const formats = info.formats || [];

    // Find best audio size for video-only formats
    const bestAudio = formats
      .filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none')
      .sort((a: any, b: any) => (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0))[0];
    
    const audioSize = bestAudio ? (bestAudio.filesize || bestAudio.filesize_approx || 0) : 0;

    // Group video formats by unique height resolution
    const videoMap = new Map<number, any>();
    formats.forEach((f: any) => {
      // Must have video codec, and a height resolution (e.g. 360, 720, 1080)
      if (f.vcodec !== 'none' && f.height) {
        const height = f.height;
        if (height < 240) return; // Skip tiny resolutions

        const existing = videoMap.get(height);
        if (!existing || (f.filesize || f.filesize_approx || 0) > (existing.filesize || existing.filesize_approx || 0)) {
          videoMap.set(height, f);
        }
      }
    });

    const videoOptions = Array.from(videoMap.values())
      .map((f: any) => {
        const isVideoOnly = f.acodec === 'none';
        const videoSize = f.filesize || f.filesize_approx || 0;
        // Total merged size is video size + audio size
        const totalSize = isVideoOnly ? (videoSize + audioSize) : videoSize;
        
        return {
          formatId: f.format_id,
          resolution: `${f.height}p`,
          ext: 'mp4',
          size: totalSize,
          note: isVideoOnly ? `${f.height}p (HQ)` : `${f.height}p`
        };
      })
      .sort((a, b) => parseInt(b.resolution) - parseInt(a.resolution));

    // Audio options (MP3 - 128kbps and 320kbps)
    // Approximate sizes based on audio bitrate and duration
    // 128kbps = 16 KB/sec, 320kbps = 40 KB/sec
    const size128 = duration * 16 * 1024;
    const size320 = duration * 40 * 1024;

    const audioOptions = [
      {
        formatId: 'bestaudio',
        resolution: '128kbps',
        ext: 'mp3',
        size: size128,
        note: '128kbps (Standard MP3)'
      },
      {
        formatId: 'bestaudio',
        resolution: '320kbps',
        ext: 'mp3',
        size: size320,
        note: '320kbps (High Quality MP3)'
      }
    ];

    return NextResponse.json({
      videoId,
      title,
      thumbnail,
      channel,
      duration,
      viewCount,
      videoOptions,
      audioOptions
    });

  } catch (error: any) {
    console.error('Error fetching video info:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json(
      { error: error.message || 'Failed to fetch video details' },
      { status: 500 }
    );
  }
}
