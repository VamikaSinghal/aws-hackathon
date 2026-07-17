import { NextRequest, NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/orchestration/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const orchestrator = getOrchestrator();

    // Check if a loop is already running
    const state = orchestrator.getState();
    if (state.isRunning) {
      return NextResponse.json(
        { error: 'Loop already running' },
        { status: 409 }
      );
    }

    const loop = await orchestrator.startLoop();

    return NextResponse.json({
      success: true,
      loop,
      message: 'Orchestration loop started',
    });
  } catch (error) {
    console.error('Error starting orchestration loop:', error);
    return NextResponse.json(
      { error: 'Failed to start loop', details: String(error) },
      { status: 500 }
    );
  }
}
