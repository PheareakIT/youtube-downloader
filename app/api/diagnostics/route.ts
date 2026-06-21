import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function GET() {
  let pythonInstalled = false;
  let ffmpegInstalled = false;
  let pythonVersion = '';
  let ffmpegVersion = '';

  // Check Python availability
  try {
    const output = execSync('python --version', { stdio: 'pipe' }).toString().trim();
    pythonInstalled = true;
    pythonVersion = output;
  } catch (e) {
    try {
      const output3 = execSync('python3 --version', { stdio: 'pipe' }).toString().trim();
      pythonInstalled = true;
      pythonVersion = output3;
    } catch (e2) {
      try {
        const pyOutput = execSync('py --version', { stdio: 'pipe' }).toString().trim();
        pythonInstalled = true;
        pythonVersion = pyOutput;
      } catch (e3) {
        pythonInstalled = false;
      }
    }
  }

  // Check FFmpeg availability (system PATH first, then bundled fallback)
  try {
    const output = execSync('ffmpeg -version', { stdio: 'pipe' }).toString().split('\n')[0].trim();
    ffmpegInstalled = true;
    ffmpegVersion = output;
  } catch (e) {
    const localFfmpegBinary = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
    const localFfmpegPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', localFfmpegBinary);
    
    if (fs.existsSync(localFfmpegPath)) {
      ffmpegInstalled = true;
      try {
        const localOutput = execSync(`"${localFfmpegPath}" -version`, { stdio: 'pipe' }).toString().split('\n')[0].trim();
        ffmpegVersion = localOutput + ' (Bundled)';
      } catch (err) {
        ffmpegVersion = 'Bundled Static Binary';
      }
    } else {
      ffmpegInstalled = false;
    }
  }

  return NextResponse.json({
    python: {
      installed: pythonInstalled,
      version: pythonVersion || null
    },
    ffmpeg: {
      installed: ffmpegInstalled,
      version: ffmpegVersion || null
    }
  });
}
