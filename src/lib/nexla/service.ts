import { NexlaHealthData, NexlaSource, NexlaDataset, NexlaConfig } from './types';

class NexlaService {
  private apiKey: string;
  private apiUrl: string;
  private useSandbox: boolean;
  private userId: string;

  constructor(config: NexlaConfig = {}) {
    this.apiKey = config.apiKey || process.env.NEXLA_API_KEY || '';
    this.apiUrl = config.apiUrl || process.env.NEXLA_API_URL || 'https://api-sandbox.nexla.io';
    this.useSandbox = config.useSandbox !== false;
    this.userId = config.userId || process.env.NEXLA_USER_ID || 'demo-user-lifeos';
  }

  /**
   * Fetch aggregated health data from Nexla
   * Falls back to mock data if API unavailable
   */
  async fetchHealthData(): Promise<NexlaHealthData> {
    try {
      // Try to fetch from real Nexla API
      if (this.apiKey && this.apiUrl) {
        return await this.fetchFromNexlaAPI();
      }
    } catch (error) {
      console.warn('Nexla API fetch failed, using mock data:', error);
    }

    // Fallback to mock data
    return this.getMockHealthData();
  }

  /**
   * Fetch connected data sources from Nexla
   */
  async fetchConnectedSources(): Promise<NexlaSource[]> {
    try {
      if (this.apiKey && this.apiUrl) {
        return await this.fetchSourcesFromAPI();
      }
    } catch (error) {
      console.warn('Failed to fetch sources from Nexla:', error);
    }

    return this.getMockSources();
  }

  /**
   * Get complete dataset with all sources and aggregated data
   */
  async getDataset(): Promise<NexlaDataset> {
    const sources = await this.fetchConnectedSources();
    const aggregatedData = await this.fetchHealthData();

    return {
      userId: this.userId,
      timestamp: Date.now(),
      sources,
      aggregatedData,
      rawData: {},
      syncStatus: this.apiKey ? 'success' : 'partial',
    };
  }

  /**
   * Real Nexla API call
   */
  private async fetchFromNexlaAPI(): Promise<NexlaHealthData> {
    const endpoint = `${this.apiUrl}/api/v1/users/${this.userId}/health-data`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nexla API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalizeNexlaResponse(data);
  }

  /**
   * Fetch sources from real Nexla API
   */
  private async fetchSourcesFromAPI(): Promise<NexlaSource[]> {
    const endpoint = `${this.apiUrl}/api/v1/users/${this.userId}/sources`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nexla API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalizeSources(data);
  }

  /**
   * Normalize Nexla API response to our format
   */
  private normalizeNexlaResponse(rawData: any): NexlaHealthData {
    try {
      // Handle different Nexla response formats
      const data = rawData.data || rawData;

      return {
        sleep: {
          duration: data.sleep?.duration || 0,
          quality: data.sleep?.quality || 0,
          deepSleep: data.sleep?.deepSleep || 0,
          remSleep: data.sleep?.remSleep || 0,
          timestamp: data.sleep?.timestamp || Date.now(),
        },
        activity: {
          steps: data.activity?.steps || 0,
          calories: data.activity?.calories || 0,
          activeMinutes: data.activity?.activeMinutes || 0,
          timestamp: data.activity?.timestamp || Date.now(),
        },
        heart: {
          resting: data.heart?.resting || 0,
          hrv: data.heart?.hrv || 0,
          timestamp: data.heart?.timestamp || Date.now(),
        },
        recovery: {
          score: data.recovery?.score || 0,
          status: data.recovery?.status || 'yellow',
          timestamp: data.recovery?.timestamp || Date.now(),
        },
        events: data.events || [],
      };
    } catch (error) {
      console.error('Error normalizing Nexla response:', error);
      return this.getMockHealthData();
    }
  }

  /**
   * Normalize sources from API response
   */
  private normalizeSources(rawData: any): NexlaSource[] {
    try {
      const sources = rawData.data || rawData.sources || [];
      return sources.map((source: any) => ({
        id: source.id || source.name,
        name: source.name,
        type: source.type || 'api',
        status: source.connected ? 'connected' : 'disconnected',
        lastSync: source.lastSync || Date.now(),
        dataPoints: source.dataPoints || [],
      }));
    } catch (error) {
      console.error('Error normalizing sources:', error);
      return this.getMockSources();
    }
  }

  /**
   * Mock health data (fallback)
   */
  private getMockHealthData(): NexlaHealthData {
    const now = Date.now();
    return {
      sleep: {
        duration: 292,
        quality: 35,
        deepSleep: 45,
        remSleep: 82,
        timestamp: now - 86400000,
      },
      activity: {
        steps: 2100,
        calories: 120,
        activeMinutes: 15,
        timestamp: now,
      },
      heart: {
        resting: 72,
        hrv: 28,
        timestamp: now,
      },
      recovery: {
        score: 23,
        status: 'red',
        timestamp: now,
      },
      events: [
        {
          title: '7:00 AM HIIT Workout',
          startTime: now + 3600000,
          endTime: now + 5400000,
          type: 'workout',
        },
        {
          title: 'Team Standup',
          startTime: now + 28800000,
          endTime: now + 32400000,
          type: 'meeting',
        },
      ],
    };
  }

  /**
   * Mock sources (fallback)
   */
  private getMockSources(): NexlaSource[] {
    const now = Date.now();
    return [
      {
        id: 'whoop-001',
        name: 'Whoop',
        type: 'wearable',
        status: 'connected',
        lastSync: now - 120000,
        dataPoints: ['HRV', 'Strain', 'Recovery', 'Sleep Quality'],
      },
      {
        id: 'apple-health-001',
        name: 'Apple Health',
        type: 'mobile',
        status: 'connected',
        lastSync: now - 300000,
        dataPoints: ['Steps', 'Active Calories', 'Workouts', 'Resting HR'],
      },
      {
        id: 'oura-001',
        name: 'Oura Ring',
        type: 'wearable',
        status: 'connected',
        lastSync: now - 180000,
        dataPoints: ['Sleep Score', 'Readiness', 'Activity', 'Body Temperature'],
      },
      {
        id: 'calendar-001',
        name: 'Google Calendar',
        type: 'calendar',
        status: 'connected',
        lastSync: now - 60000,
        dataPoints: ['Events', 'Free Time Blocks', 'Meeting Duration', 'Context'],
      },
      {
        id: 'gmail-001',
        name: 'Gmail',
        type: 'email',
        status: 'connected',
        lastSync: now - 240000,
        dataPoints: ['Email Metadata', 'Urgency', 'Stress Signals', 'Work Patterns'],
      },
    ];
  }

  /**
   * Test connection to Nexla
   */
  async testConnection(): Promise<{ connected: boolean; message: string; mode: string }> {
    if (!this.apiKey) {
      return {
        connected: false,
        message: 'No API key configured. Using mock data.',
        mode: 'mock',
      };
    }

    try {
      const endpoint = `${this.apiUrl}/api/v1/health-check`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        return {
          connected: true,
          message: 'Connected to Nexla API',
          mode: 'live',
        };
      }
    } catch (error) {
      console.error('Nexla connection test failed:', error);
    }

    return {
      connected: false,
      message: 'Failed to connect to Nexla. Using mock data.',
      mode: 'mock',
    };
  }
}

// Singleton instance
let nexlaServiceInstance: NexlaService | null = null;

export function getNexlaService(config?: NexlaConfig): NexlaService {
  if (!nexlaServiceInstance) {
    nexlaServiceInstance = new NexlaService(config);
  }
  return nexlaServiceInstance;
}

export function resetNexlaService(): void {
  nexlaServiceInstance = null;
}

export { NexlaService };
