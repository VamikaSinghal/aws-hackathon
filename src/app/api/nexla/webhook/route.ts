import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface HealthDataPoint {
  timestamp: string;
  user_id: string;
  health_data: {
    sleep: {
      duration_hours: number;
      quality_score: number;
      deep_sleep: number;
      hrv: number;
    };
    activity: {
      steps: number;
      distance_km: number;
      calories: number;
    };
    schedule: {
      events: Array<{
        name: string;
        start: string;
        duration_min: number;
      }>;
    };
  };
}

// In-memory storage (replace with database in production)
let latestHealthData: HealthDataPoint | null = null;
let dataHistory: HealthDataPoint[] = [];

export async function POST(request: NextRequest) {
  try {
    const data: HealthDataPoint = await request.json();

    // Optional: Verify API key
    const apiKey = request.headers.get('x-nexla-key') ||
                   request.headers.get('authorization')?.replace('Bearer ', '');

    if (process.env.NEXLA_API_KEY && apiKey !== process.env.NEXLA_API_KEY) {
      console.warn('[Nexla] Unauthorized webhook request');
      // Still accept for demo purposes
    }

    // Validate data structure
    if (!data.health_data || !data.timestamp) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Store latest data
    latestHealthData = data;

    // Keep history (last 24 data points)
    dataHistory = [data, ...dataHistory].slice(0, 24);

    // Log received data
    console.log('[Nexla Webhook] Data received:', {
      timestamp: data.timestamp,
      user: data.user_id,
      sleep_score: data.health_data.sleep.quality_score,
      hrv: data.health_data.sleep.hrv,
      steps: data.health_data.activity.steps,
      events: data.health_data.schedule.events.length
    });

    // Trigger agent analysis in background (non-blocking)
    if (process.env.NEXT_PUBLIC_ENABLE_AGENTS === 'true') {
      analyzeHealthData(data).catch(err =>
        console.error('[Agent Analysis Error]', err)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Health data received and processed',
      timestamp: new Date().toISOString(),
      data_points: data.health_data
    });

  } catch (error) {
    console.error('[Nexla] Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// GET latest health data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'latest';

    if (format === 'history') {
      return NextResponse.json({
        status: 'success',
        data: dataHistory,
        count: dataHistory.length,
        updated_at: new Date().toISOString()
      });
    }

    if (!latestHealthData) {
      return NextResponse.json({
        status: 'no_data',
        message: 'No health data received yet'
      });
    }

    return NextResponse.json({
      status: 'success',
      data: latestHealthData,
      received_at: latestHealthData.timestamp,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Nexla GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data' },
      { status: 500 }
    );
  }
}

// Analyze health data with agent
async function analyzeHealthData(data: HealthDataPoint) {
  try {
    const analysis = {
      timestamp: new Date().toISOString(),
      user_id: data.user_id,
      health_snapshot: {
        sleep: data.health_data.sleep,
        activity: data.health_data.activity,
        events: data.health_data.schedule.events.length
      },
      recommendations: generateRecommendations(data)
    };

    console.log('[Agent] Analysis generated:', analysis);

    // Store analysis for dashboard display
    // In production, save to database

    return analysis;
  } catch (error) {
    console.error('[Agent Analysis] Error:', error);
  }
}

// Generate recommendations based on health data
function generateRecommendations(data: HealthDataPoint): string[] {
  const recommendations: string[] = [];
  const sleep = data.health_data.sleep;
  const activity = data.health_data.activity;

  // Sleep analysis
  if (sleep.quality_score < 40) {
    recommendations.push('⚠️ Poor sleep quality - prioritize recovery');
  }
  if (sleep.hrv < 40) {
    recommendations.push('❌ HRV too low - skip intense workouts');
  }
  if (sleep.duration_hours < 6) {
    recommendations.push('😴 Sleep debt detected - get more rest');
  }

  // Activity analysis
  if (activity.steps < 5000) {
    recommendations.push('🚶 Increase daily activity - aim for 10k steps');
  }

  // Positive reinforcement
  if (sleep.quality_score > 70 && sleep.hrv > 50) {
    recommendations.push('✅ Excellent recovery - ready for intense training');
  }

  if (recommendations.length === 0) {
    recommendations.push('✓ All metrics optimal - continue current routine');
  }

  return recommendations;
}
