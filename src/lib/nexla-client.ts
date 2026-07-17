/**
 * Nexla Client Library for LifeOS
 * Handles real-time health data integration from Nexla platform
 */

import { useState, useEffect } from 'react';

export interface HealthMetrics {
  hrv: number;
  sleep_score: number;
  steps: number;
  recovery: number;
}

export interface HealthDataSnapshot {
  timestamp: Date;
  user_id: string;
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
  schedule: Array<{
    name: string;
    start: string;
    duration_min: number;
  }>;
}

export interface SyncStatus {
  connected: boolean;
  sources: number;
  lastUpdate: string;
}

class NexlaClient {
  private baseUrl: string;
  private pollInterval: number = 5000;
  private pollingActive: boolean = false;
  private listeners: Set<(data: HealthDataSnapshot) => void> = new Set();

  constructor() {
    this.baseUrl = '/api/nexla';
  }

  /**
   * Fetch latest health data from Nexla
   */
  async fetchLatestData(): Promise<HealthDataSnapshot | null> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook`);

      if (!response.ok) {
        console.error('[Nexla] Failed to fetch data:', response.statusText);
        return null;
      }

      const data = await response.json();

      if (!data.data) {
        console.warn('[Nexla] No data available yet');
        return null;
      }

      return this.parseHealthData(data.data);

    } catch (error) {
      console.error('[Nexla Client] Fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch data history
   */
  async fetchDataHistory(limit: number = 24): Promise<HealthDataSnapshot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook?format=history`);

      if (!response.ok) return [];

      const data = await response.json();

      if (!Array.isArray(data.data)) return [];

      return data.data.slice(0, limit).map((d: any) => this.parseHealthData(d));

    } catch (error) {
      console.error('[Nexla Client] History fetch error:', error);
      return [];
    }
  }

  /**
   * Manually trigger Nexla sync
   */
  async manualSync(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST'
      });

      if (!response.ok) {
        console.error('[Nexla] Manual sync failed:', response.statusText);
        return false;
      }

      const result = await response.json();
      console.log('[Nexla] Manual sync successful:', result);
      return true;

    } catch (error) {
      console.error('[Nexla Client] Sync error:', error);
      return false;
    }
  }

  /**
   * Check Nexla connection status
   */
  async checkStatus(): Promise<SyncStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/sync`);

      if (!response.ok) return null;

      const data = await response.json();

      return {
        connected: data.status === 'connected',
        sources: data.connected_sources?.length || 0,
        lastUpdate: data.last_sync
      };

    } catch (error) {
      console.error('[Nexla Client] Status check error:', error);
      return null;
    }
  }

  /**
   * Start polling for new data
   */
  startPolling(interval: number = 5000): void {
    if (this.pollingActive) {
      console.warn('[Nexla] Polling already active');
      return;
    }

    this.pollInterval = interval;
    this.pollingActive = true;

    const poll = async () => {
      const data = await this.fetchLatestData();
      if (data) {
        this.notifyListeners(data);
      }

      if (this.pollingActive) {
        setTimeout(poll, this.pollInterval);
      }
    };

    poll();
    console.log('[Nexla] Polling started, interval:', interval + 'ms');
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    this.pollingActive = false;
    console.log('[Nexla] Polling stopped');
  }

  /**
   * Subscribe to data updates
   */
  subscribe(callback: (data: HealthDataSnapshot) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current metrics for display
   */
  async getCurrentMetrics(): Promise<HealthMetrics | null> {
    const data = await this.fetchLatestData();

    if (!data) return null;

    return {
      hrv: data.sleep.hrv,
      sleep_score: data.sleep.quality_score,
      steps: data.activity.steps,
      recovery: Math.round((data.sleep.quality_score + data.sleep.hrv / 50) / 2)
    };
  }

  /**
   * Parse raw Nexla data to HealthDataSnapshot
   */
  private parseHealthData(rawData: any): HealthDataSnapshot {
    return {
      timestamp: new Date(rawData.timestamp),
      user_id: rawData.user_id,
      sleep: {
        duration_hours: rawData.health_data.sleep.duration_hours,
        quality_score: rawData.health_data.sleep.quality_score,
        deep_sleep: rawData.health_data.sleep.deep_sleep,
        hrv: rawData.health_data.sleep.hrv
      },
      activity: {
        steps: rawData.health_data.activity.steps,
        distance_km: rawData.health_data.activity.distance_km,
        calories: rawData.health_data.activity.calories
      },
      schedule: rawData.health_data.schedule.events || []
    };
  }

  /**
   * Notify all listeners of data update
   */
  private notifyListeners(data: HealthDataSnapshot): void {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[Nexla] Listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const nexlaClient = new NexlaClient();

/**
 * Hook for React components
 */
export function useNexlaData() {
  const [data, setData] = useState<HealthDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = nexlaClient.subscribe(setData);

    nexlaClient.fetchLatestData()
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    return unsubscribe;
  }, []);

  return { data, loading, error };
}
