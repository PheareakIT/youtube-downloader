import { NextResponse } from 'next/server';
import { getAllDownloads } from '@/utils/db';

export async function GET() {
  try {
    const downloads = await getAllDownloads();
    return NextResponse.json(downloads);
  } catch (error: any) {
    console.error('Error fetching download history:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve download history' },
      { status: 500 }
    );
  }
}
