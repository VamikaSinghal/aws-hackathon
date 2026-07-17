'use client';

'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrchestrationState, OrchestrationEvent, StageType } from '@/lib/orchestration/types';
import { getOrchestrator } from '@/lib/orchestration/orchestrator';
import { RealTimeMetrics } from './RealTimeMetrics';
import { ReasoningLog } from './ReasoningLog';
import { AgentReasoningTimeline } from './AgentReasoningTimeline';
import { OrchestrationDataFlow } from './OrchestrationDataFlow';
import { Play, Pause, RotateCcw, Zap, Download } from 'lucide-react';

interface DemoLoopVisualizerProps {
  autoStart?: boolean;
}

export function DemoLoopVisualizer({ autoStart = false }: DemoLoopVisualizerProps) {
  const [state, setState] = useState<OrchestrationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'flow' | 'reasoning' | 'timeline' | 'log'>('flow');

  useEffect(() => {
    const orchestrator = getOrchestrator();
    setState(orchestrator.getState());

    const unsubscribe = orchestrator.subscribeToEvents((event: OrchestrationEvent) => {
      setState(orchestrator.getState());
    });

    return () => unsubscribe();
  }, []);

  const handleStart = useCallback(async () => {
    if (!state) return;

    setIsRunning(true);
    try {
      const orchestrator = getOrchestrator();
      await orchestrator.startLoop();
      setState(orchestrator.getState());
    } catch (error) {
      console.error('Error starting loop:', error);
    } finally {
      setIsRunning(false);
    }
  }, [state]);

  const handleReset = useCallback(() => {
    const orchestrator = getOrchestrator();
    orchestrator.reset();
    setState(orchestrator.getState());
    setIsRunning(false);
  }, []);

  const handleExport = useCallback(() => {
    if (!state) return;

    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orchestration-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  if (!state) {
    return <div className="text-center py-8 text-[#677d64]">Loading orchestrator...</div>;
  }

  const currentLoop = state.currentLoop;
  const tabs: Array<{ id: typeof activeTab; label: string; icon: React.ReactNode }> = [
    { id: 'flow', label: 'Data Flow', icon: <Zap size={16} /> },
    { id: 'reasoning', label: 'Agent Reasoning', icon: '🤖' },
    { id: 'timeline', label: 'Timeline', icon: '📊' },
    { id: 'log', label: 'Log', icon: '📝' },
  ];

  return (
    <div className="space-y-8">
      {/* Header with controls */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
        <div className="flex flex-col gap-6">
          {/* Title and stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-heading-sm text-[#ddffdc] font-medium">Live Orchestration Demo</h2>
              <div className="text-caption text-[#677d64]">Loop #{currentLoop.loopNumber}</div>
            </div>
            <p className="text-body-sm text-[#8cab87]">
              Watch the 6-step agent loop in action. Data flows through sponsors, agents debate, and actions execute.
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Play/Pause/Reset */}
            <div className="flex gap-2">
              <button
                onClick={handleStart}
                disabled={isRunning}
                className="flex-1 flex items-center justify-center gap-2 bg-[#7fee64] text-black font-medium px-4 py-2 rounded-pills hover:bg-[#9fff80] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={16} />
                Start Loop
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-pills border border-[#485346] text-[#8cab87] hover:text-[#ddffdc] hover:border-[#485346] transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Speed control */}
            <div>
              <label className="text-caption text-[#677d64] block mb-2">Speed</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-cards bg-[#212525] border border-[#485346]/40 text-[#ddffdc] text-body-sm"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-pills border border-[#485346] text-[#8cab87] hover:text-[#ddffdc] hover:border-[#485346] transition-colors"
              title="Export current loop as JSON"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {/* Status indicators */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#7fee64] animate-pulse' : 'bg-[#677d64]'}`} />
              <span className="text-caption text-[#8cab87]">
                {isRunning ? 'Running' : 'Idle'} • {currentLoop.currentStage} stage
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#9cbf93]" />
              <span className="text-caption text-[#8cab87]">{state.stats.totalLoops} loops completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#aed2a4]" />
              <span className="text-caption text-[#8cab87]">{state.stats.totalActionsApproved} actions approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time metrics */}
      <div>
        <h3 className="text-body-sm font-medium text-[#ddffdc] mb-4">Real-Time Metrics</h3>
        <RealTimeMetrics
          current={currentLoop.healthMetrics}
          previous={currentLoop.previousMetrics}
        />
      </div>

      {/* Tab navigation */}
      <div className="border-b border-[#485346]/40">
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#7fee64] text-[#7fee64]'
                  : 'border-transparent text-[#8cab87] hover:text-[#ddffdc]'
              }`}
            >
              {tab.icon}
              <span className="text-body-sm font-medium hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'flow' && (
          <OrchestrationDataFlow stage={currentLoop.currentStage} />
        )}

        {activeTab === 'reasoning' && (
          <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
            <AgentReasoningTimeline reasoning={currentLoop.reasoning} />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
            <div className="space-y-4">
              {Object.entries(currentLoop.stages).map(([stage, info]) => (
                <div key={stage} className="flex items-start gap-4 pb-4 border-b border-[#485346]/20">
                  <div className="w-24 flex-shrink-0">
                    <p className="text-body-sm font-medium text-[#ddffdc]">{stage}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            info.status === 'completed'
                              ? '#7fee64'
                              : info.status === 'running'
                                ? '#9cbf93'
                                : '#485346',
                        }}
                      />
                      <span className="text-caption text-[#8cab87] capitalize">{info.status}</span>
                    </div>
                    <p className="text-caption text-[#677d64]">
                      {Array.isArray(info.sponsor) ? info.sponsor.join(', ') : info.sponsor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <ReasoningLog
            agentMessages={currentLoop.agentMessages}
            sponsorMessages={currentLoop.sponsorMessages}
            maxHeight="max-h-96"
          />
        )}
      </div>
    </div>
  );
}
