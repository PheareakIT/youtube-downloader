import { NextRequest, NextResponse } from 'next/server';
import { getDownloadById, deleteDownload } from '@/utils/db';
import { cancelDownload, cleanupDownloadFiles } from '@/utils/downloader';
import fs from 'fs';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing download ID' }, { status: 400 });
    }

    const download = await getDownloadById(id);
    if (!download) {
      return NextResponse.json({ error: 'Download not found' }, { status: 404 });
    }

    // If downloading/pending, terminate the process
    if (download.status === 'downloading' || download.status === 'pending') {
      await cancelDownload(id);
    } else {
      // Remove local file if it exists
      if (download.file_path && fs.existsSync(download.file_path)) {
        try {
          fs.unlinkSync(download.file_path);
        } catch (err) {
          console.error(`Failed to delete completed file ${download.file_path}:`, err);
        }
      }
      // General temp file cleanup for this ID
      cleanupDownloadFiles(id);
    }

    // Delete db record
    await deleteDownload(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting/cancelling download:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel or delete download' },
      { status: 500 }
    );
  }
}
