import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface SyncResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data_points?: number;
  sources?: string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  try {
    console.log('[Nexla Sync] Initiating manual sync...');

    // In a real scenario, this would call Nexla API
    // For demo purposes, we'll simulate the sync
    const simulatedSync = await simulateNexlaSync();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Nexla sync completed successfully',
      data_points: simulatedSync.dataPoints,
      sources: simulatedSync.sources
    });

  } catch (error) {
    console.error('[Nexla Sync] Error:', error);
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Sync failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    // Check Nexla connection status
    const status = await checkNexlaStatus();

    return NextResponse.json({
      status: 'connected',
      nexla_status: status,
      timestamp: new Date().toISOString(),
      connected_sources: [
        'Apple Health',
        'Oura Ring',
        'Google Calendar',
        'Whoop',
        'Strava',
        'Gmail'
      ],
      last_sync: new Date(Date.now() - 5 * 60000).toISOString() // 5 minutes ago
    });

  } catch (error) {
    console.error('[Nexla Status] Error:', error);
    return NextResponse.json({
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Connection failed'
    }, { status: 500 });
  }
}

async function simulateNexlaSync(): Promise<{ dataPoints: number; sources: string[] }> {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 2000));

  const sources = [
    'Apple Health',
    'Oura Ring',
    'Google Calendar',
    'Whoop',
    'Strava',
    'Gmail'
  ];

  const dataPoints = Math.floor(Math.random() * 50) + 80; // 80-130 data points

  console.log('[Nexla Sync] Simulated sync complete:', {
    sources,
    dataPoints,
    timestamp: new Date().toISOString()
  });

  return {
    dataPoints,
    sources
  };
}

async function checkNexlaStatus(): Promise<{
  connected: boolean;
  sources: number;
  lastUpdate: string;
}> {
  // Simulate status check
  await new Promise(r => setTimeout(r, 1000));

  return {
    connected: true,
    sources: 6,
    lastUpdate: new Date().toISOString()
  };
}
