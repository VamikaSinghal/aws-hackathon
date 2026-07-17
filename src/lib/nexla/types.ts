// Nexla Data Types

export interface NexlaSource {
  id: string;
  name: string;
  type: 'wearable' | 'mobile' | 'calendar' | 'email' | 'api';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: number;
  dataPoints: string[];
}

export interface NexlaHealthData {
  sleep: {
    duration: number;
    quality: number;
    deepSleep: number;
    remSleep: number;
    timestamp: number;
  };
  activity: {
    steps: number;
    calories: number;
    activeMinutes: number;
    timestamp: number;
  };
  heart: {
    resting: number;
    hrv: number;
    timestamp: number;
  };
  recovery: {
    score: number;
    status: 'green' | 'yellow' | 'red';
    timestamp: number;
  };
  events?: {
    title: string;
    startTime: number;
    endTime: number;
    type: 'meeting' | 'workout' | 'rest' | 'other';
  }[];
}

export interface NexlaDataset {
  userId: string;
  timestamp: number;
  sources: NexlaSource[];
  aggregatedData: NexlaHealthData;
  rawData: Record<string, any>;
  syncStatus: 'success' | 'partial' | 'error';
}

export interface NexlaConfig {
  apiKey?: string;
  apiUrl?: string;
  userId?: string;
  useSandbox?: boolean;
}
