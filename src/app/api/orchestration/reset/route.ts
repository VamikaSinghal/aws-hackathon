import { NextRequest, NextResponse } from 'next/server';
import { resetOrchestrator, getOrchestrator } from '@/lib/orchestration/orchestrator';

export async function POST(request: NextRequest) {
  try {
    resetOrchestrator();
    const orchestrator = getOrchestrator();
    const state = orchestrator.getState();

    return NextResponse.json({
      success: true,
      message: 'Orchestrator reset successfully',
      state,
    });
  } catch (error) {
    console.error('Error resetting orchestrator:', error);
    return NextResponse.json(
      { error: 'Failed to reset', details: String(error) },
      { status: 500 }
    );
  }
}
