'use client';

import { HealthMetrics } from '@/lib/orchestration/types';
import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Heart, Zap } from 'lucide-react';

interface RealTimeMetricsProps {
  current: HealthMetrics;
  previous?: HealthMetrics;
}

interface MetricCard {
  icon: React.ReactNode;
  label: string;
  current: string;
  improvement?: number;
  color: string;
  status?: 'red' | 'yellow' | 'green';
}

export function RealTimeMetrics({ current, previous }: RealTimeMetricsProps) {
  const [displayValues, setDisplayValues] = useState<HealthMetrics>(current);
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);

  useEffect(() => {
    setAnimatingKey(null);
    const timeouts: NodeJS.Timeout[] = [];

    Object.entries(current).forEach(([key, value], idx) => {
      const t = setTimeout(() => {
        setAnimatingKey(key);
        setDisplayValues(c => ({
          ...c,
          [key]: value,
        }));
      }, idx * 150);
      timeouts.push(t);
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [current]);

  const calculateImprovement = (curr: number, prev: number): number => {
    if (!prev || prev === 0) return 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const metrics: MetricCard[] = [
    {
      icon: <Activity size={20} className="text-[#7fee64]" />,
      label: 'Sleep Quality',
      current: `${displayValues.sleep.quality}%`,
      improvement: previous ? calculateImprovement(displayValues.sleep.quality, previous.sleep.quality) : undefined,
      color: 'from-[#212525] to-[#181818]',
      status: displayValues.sleep.quality > 70 ? 'green' : displayValues.sleep.quality > 50 ? 'yellow' : 'red',
    },
    {
      icon: <Heart size={20} className="text-[#aed2a4]" />,
      label: 'HRV Recovery',
      current: `${displayValues.hrv.percentOfBaseline}%`,
      improvement: previous ? calculateImprovement(displayValues.hrv.percentOfBaseline, previous.hrv.percentOfBaseline) : undefined,
      color: 'from-[#212525] to-[#181818]',
      status: displayValues.hrv.percentOfBaseline > 80 ? 'green' : displayValues.hrv.percentOfBaseline > 60 ? 'yellow' : 'red',
    },
    {
      icon: <Zap size={20} className="text-[#9cbf93]" />,
      label: 'Recovery Score',
      current: `${displayValues.recovery.score}%`,
      improvement: previous ? calculateImprovement(displayValues.recovery.score, previous.recovery.score) : undefined,
      color: 'from-[#212525] to-[#181818]',
      status: displayValues.recovery.status,
    },
    {
      icon: <TrendingUp size={20} className="text-[#aed2a4]" />,
      label: 'Steps Today',
      current: `${Math.round(displayValues.steps / 1000)}k`,
      improvement: previous ? calculateImprovement(displayValues.steps, previous.steps) : undefined,
      color: 'from-[#212525] to-[#181818]',
      status: displayValues.steps > 7000 ? 'green' : displayValues.steps > 4000 ? 'yellow' : 'red',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => {
        const isAnimating = animatingKey === Object.keys(current)[i];
        const statusColor = {
          green: 'border-[#7fee64]/40 bg-[#7fee64]/5',
          yellow: 'border-[#9cbf93]/40 bg-[#9cbf93]/5',
          red: 'border-[#aed2a4]/40 bg-[#aed2a4]/5',
        };

        return (
          <div
            key={metric.label}
            className={`bg-gradient-to-br ${metric.color} rounded-cards border ${statusColor[metric.status || 'yellow']} p-4 transition-all duration-300 ${
              isAnimating ? 'scale-105' : 'scale-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-cards bg-[#181818] border border-[#485346]/40 flex items-center justify-center">
                {metric.icon}
              </div>
              {metric.improvement !== undefined && (
                <div className={`text-caption font-medium ${metric.improvement >= 0 ? 'text-[#7fee64]' : 'text-[#aed2a4]'}`}>
                  {metric.improvement > 0 ? '+' : ''}{metric.improvement}%
                </div>
              )}
            </div>

            <p className="text-caption text-[#8cab87] mb-2">{metric.label}</p>
            <p className="text-heading-sm text-[#ddffdc] font-medium">{metric.current}</p>

            {metric.status && (
              <div className="mt-3 h-1 bg-[#181818] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metric.status === 'green'
                      ? 'bg-[#7fee64]'
                      : metric.status === 'yellow'
                        ? 'bg-[#9cbf93]'
                        : 'bg-[#aed2a4]'
                  }`}
                  style={{
                    width: `${metric.status === 'green' ? 85 : metric.status === 'yellow' ? 60 : 30}%`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
