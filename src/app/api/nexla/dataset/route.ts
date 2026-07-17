import { NextRequest, NextResponse } from 'next/server';
import { getNexlaService } from '@/lib/nexla/service';

export async function GET(request: NextRequest) {
  try {
    const nexla = getNexlaService();
    const dataset = await nexla.getDataset();

    return NextResponse.json({
      success: true,
      data: dataset,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching Nexla dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Nexla dataset', details: String(error) },
      { status: 500 }
    );
  }
}
