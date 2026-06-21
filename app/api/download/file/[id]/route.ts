import { NextRequest, NextResponse } from 'next/server';
import { getDownloadById } from '@/utils/db';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing download ID' }, { status: 400 });
    }

    const download = await getDownloadById(id);
    if (!download || download.status !== 'completed' || !download.file_path) {
      return NextResponse.json(
        { error: 'Download has not completed or record does not exist' },
        { status: 404 }
      );
    }

    if (!fs.existsSync(download.file_path)) {
      return NextResponse.json(
        { error: 'The requested file is no longer available on the server disk' },
        { status: 404 }
      );
    }

    const stat = fs.statSync(download.file_path);
    const fileStream = fs.createReadStream(download.file_path);

    // Sanitize title to prevent header issues (keep alphanumeric, spaces, dashes)
    let safeTitle = download.title
      .replace(/[^\u00C0-\u17FF\w\s.-]/g, '') // preserves Khmer letters (\u1780-\u17FF is Khmer block), word chars, spaces, dots, dashes
      .trim();
    if (!safeTitle) safeTitle = 'download';
    
    // Double quote filename in header to handle spaces correctly
    const filename = `${safeTitle}.${download.ext}`;

    const headers = new Headers();
    // Use utf-8 encoding for content-disposition to support Khmer script and special chars
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    headers.set('Content-Type', download.ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    headers.set('Content-Length', stat.size.toString());

    // Convert Node ReadStream to Web ReadableStream for Next.js response
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        fileStream.on('end', () => {
          controller.close();
        });
        fileStream.on('error', (err) => {
          controller.error(err);
        });
      },
      cancel() {
        fileStream.destroy();
      }
    });

    return new NextResponse(webStream, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error('Error streaming download file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stream download file' },
      { status: 500 }
    );
  }
}
