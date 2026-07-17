import { NextRequest, NextResponse } from 'next/server';
import { getNexlaService } from '@/lib/nexla/service';

export async function GET(request: NextRequest) {
  try {
    const nexla = getNexlaService();
    const result = await nexla.testConnection();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error checking Nexla health:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        message: 'Health check failed',
        mode: 'mock',
      },
      { status: 200 }
    );
  }
}
