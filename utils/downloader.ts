import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { create } from 'youtube-dl-exec';
import { updateDownload, getDownloadById } from './db';

const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.join(process.cwd(), 'node_modules', 'youtube-dl-exec', 'bin', binaryName);
const youtubedl = create(binaryPath);

const ffmpegBinaryName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
const ffmpegPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', ffmpegBinaryName);

const downloadsDir = process.env.DOWNLOADS_DIR 
  ? (path.isAbsolute(process.env.DOWNLOADS_DIR) ? process.env.DOWNLOADS_DIR : path.resolve(process.cwd(), process.env.DOWNLOADS_DIR))
  : path.resolve(process.cwd(), 'downloads');

// Ensure downloads directory exists
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Preserve active downloads map across Hot Module Reloads in Next.js development
const globalForDownloads = global as unknown as {
  activeDownloads: Map<string, ChildProcess>;
};

export const activeDownloads = globalForDownloads.activeDownloads || new Map<string, ChildProcess>();

if (process.env.NODE_ENV !== 'production') {
  globalForDownloads.activeDownloads = activeDownloads;
}

export interface StartDownloadParams {
  id: string;
  url: string;
  formatId: string;
  ext: string;
  isAudioOnly: boolean;
  bitrate?: string; // for audio
}

export async function startDownload({
  id,
  url,
  formatId,
  ext,
  isAudioOnly,
  bitrate = '128k'
}: StartDownloadParams) {
  try {
    const finalFileExt = isAudioOnly ? 'mp3' : 'mp4';
    const finalFileName = `${id}.${finalFileExt}`;
    const finalFilePath = path.join(downloadsDir, finalFileName);

    let options: any = {
      output: path.join(downloadsDir, `${id}.%(ext)s`),
      noCheckCertificates: true,
      noWarnings: true,
      ffmpegLocation: ffmpegPath,
    };

    if (isAudioOnly) {
      options = {
        ...options,
        format: 'bestaudio/best',
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: bitrate === '320kbps' ? '0' : '5', // 0 is best (vbr), 5 is standard (~128k)
      };
    } else {
      // For video downloads, request formatId + bestaudio and merge into mp4
      options = {
        ...options,
        format: `${formatId}+bestaudio/best`,
        mergeOutputFormat: 'mp4',
      };
    }

    // Update status to downloading
    await updateDownload(id, { status: 'downloading', progress: 0, speed: '0 B/s' });

    // Spawn yt-dlp child process
    const processInstance = youtubedl.exec(url, options) as any;
    activeDownloads.set(id, processInstance);

    let lastProgressUpdate = Date.now();

    processInstance.stdout?.on('data', async (data: any) => {
      const line = data.toString();
      
      // Parse yt-dlp progress. Example: "[download]  12.3% of 15.00MiB at  1.20MiB/s ETA 00:10"
      const percentMatch = line.match(/(\d+(?:\.\d+)?)%/);
      const speedMatch = line.match(/at\s+([\d\.]+[a-zA-Z]+\/s)/);
      
      let progress = 0;
      let speed = '0 B/s';
      let hasProgress = false;

      if (percentMatch) {
        progress = Math.round(parseFloat(percentMatch[1]));
        hasProgress = true;
      }
      if (speedMatch) {
        speed = speedMatch[1];
      }

      // Check if ffmpeg merging is happening
      if (line.includes('[Merger]') || line.includes('Merging formats')) {
        progress = 98;
        speed = 'Merging...';
        hasProgress = true;
      }
      
      // Check if audio conversion is happening
      if (line.includes('[ExtractAudio]') || line.includes('Destination:') && line.endsWith('.mp3')) {
        progress = 95;
        speed = 'Extracting audio...';
        hasProgress = true;
      }

      // Throttle database writes to once every 1 second
      if (hasProgress && Date.now() - lastProgressUpdate > 1000) {
        lastProgressUpdate = Date.now();
        await updateDownload(id, { 
          status: 'downloading', 
          progress: Math.min(progress, 99), 
          speed 
        });
      }
    });

    processInstance.stderr?.on('data', (data: any) => {
      const errorMsg = data.toString();
      console.error(`[yt-dlp error ${id}]:`, errorMsg);
    });

    processInstance.on('close', async (code: any) => {
      activeDownloads.delete(id);

      if (code === 0) {
        // Verify final file exists on disk
        if (fs.existsSync(finalFilePath)) {
          const stats = fs.statSync(finalFilePath);
          await updateDownload(id, {
            status: 'completed',
            progress: 100,
            speed: 'Done',
            file_size: stats.size,
            file_path: finalFilePath
          });
        } else {
          // Sometimes merging creates a different extension or output. Let's look for the file.
          let foundFile = '';
          const files = fs.readdirSync(downloadsDir);
          for (const file of files) {
            if (file.startsWith(id) && !file.endsWith('.part') && !file.endsWith('.ytdl')) {
              foundFile = path.join(downloadsDir, file);
              break;
            }
          }

          if (foundFile && fs.existsSync(foundFile)) {
            const stats = fs.statSync(foundFile);
            await updateDownload(id, {
              status: 'completed',
              progress: 100,
              speed: 'Done',
              file_size: stats.size,
              file_path: foundFile,
              ext: path.extname(foundFile).replace('.', '')
            });
          } else {
            await updateDownload(id, {
              status: 'failed',
              error: 'Downloaded file not found on disk.'
            });
          }
        }
      } else {
        // Only update to failed if it wasn't cancelled (which updates status to cancelled manually)
        const currentDownload = await getDownloadById(id);
        if (currentDownload && currentDownload.status === 'downloading') {
          await updateDownload(id, {
            status: 'failed',
            error: `Download process exited with code ${code}`
          });
        }
        cleanupDownloadFiles(id);
      }
    });

  } catch (error: any) {
    console.error('Error starting download:', error);
    activeDownloads.delete(id);
    await updateDownload(id, {
      status: 'failed',
      error: error.message || 'Unknown initialization error.'
    });
    cleanupDownloadFiles(id);
  }
}

export async function cancelDownload(id: string) {
  const processInstance = activeDownloads.get(id);
  if (processInstance) {
    try {
      processInstance.kill('SIGTERM'); // Kill yt-dlp child process
    } catch (e) {
      console.error(`Error killing process for download ${id}:`, e);
    }
    activeDownloads.delete(id);
  }

  await updateDownload(id, { status: 'cancelled', speed: 'Stopped' });
  cleanupDownloadFiles(id);
}

// Cleans up any files associated with a download ID (e.g. .part, .ytdl, etc.)
export function cleanupDownloadFiles(id: string) {
  try {
    if (!fs.existsSync(downloadsDir)) return;
    const files = fs.readdirSync(downloadsDir);
    for (const file of files) {
      if (file.startsWith(id)) {
        const fullPath = path.join(downloadsDir, file);
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Failed to delete file ${fullPath}:`, err);
        }
      }
    }
  } catch (e) {
    console.error(`Error cleaning up files for ID ${id}:`, e);
  }
}
