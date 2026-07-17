import { NextRequest, NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/orchestration/orchestrator';

export async function GET(request: NextRequest) {
  try {
    const orchestrator = getOrchestrator();
    const state = orchestrator.getState();

    return NextResponse.json({
      success: true,
      state,
      currentLoop: state.currentLoop,
      stats: state.stats,
      sponsorStatus: state.sponsorStatus,
    });
  } catch (error) {
    console.error('Error fetching orchestration status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status', details: String(error) },
      { status: 500 }
    );
  }
}
