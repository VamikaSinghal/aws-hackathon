'use client';

import { AgentReasoning, AgentType } from '@/lib/orchestration/types';
import { CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface AgentReasoningTimelineProps {
  reasoning: AgentReasoning[];
  collapsed?: boolean;
}

export function AgentReasoningTimeline({ reasoning, collapsed = false }: AgentReasoningTimelineProps) {
  const getAgentColor = (agent: AgentType): string => {
    const colors: { [key in AgentType]: string } = {
      'Planner': '#7fee64',
      'Critic': '#aed2a4',
      'Workout Expert': '#9cbf93',
      'Nutrition Expert': '#aed2a4',
    };
    return colors[agent];
  };

  const getAgentIcon = (agent: AgentType) => {
    const icons: { [key in AgentType]: string } = {
      'Planner': '📋',
      'Critic': '🔍',
      'Workout Expert': '🏋️',
      'Nutrition Expert': '🥗',
    };
    return icons[agent];
  };

  if (reasoning.length === 0) {
    return (
      <div className="text-center py-8 text-[#677d64]">
        <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
        <p>No agent reasoning yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reasoning.map((entry, idx) => {
        const color = getAgentColor(entry.agent);
        const icon = getAgentIcon(entry.agent);

        return (
          <div key={idx} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-cards border-2 flex items-center justify-center bg-[#181818] text-lg"
                style={{ borderColor: color, backgroundColor: `${color}15` }}
              >
                {icon}
              </div>
              {idx < reasoning.length - 1 && (
                <div
                  className="w-0.5 h-10 my-1"
                  style={{ backgroundColor: color }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-body-sm font-medium text-[#ddffdc]">
                  {entry.agent}
                </span>
                {entry.approved && (
                  <CheckCircle size={14} style={{ color }} />
                )}
                {!entry.approved && (
                  <AlertCircle size={14} style={{ color }} />
                )}
                <span className="text-caption text-[#677d64]">
                  {entry.confidence}% confident
                </span>
              </div>

              <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-3 mb-2">
                {entry.proposal && (
                  <div className="mb-2">
                    <p className="text-caption text-[#677d64] mb-1">Proposal:</p>
                    <p className="text-body-sm text-[#8cab87]">{entry.proposal}</p>
                  </div>
                )}
                {entry.feedback && (
                  <div>
                    <p className="text-caption text-[#677d64] mb-1">Feedback:</p>
                    <p className="text-body-sm text-[#8cab87]">{entry.feedback}</p>
                  </div>
                )}
              </div>

              <p className="text-caption text-[#677d64]">
                {entry.reasoning}
              </p>

              {idx === reasoning.length - 1 && (
                <div className="mt-2 px-2 py-1 bg-[#7fee64]/10 border border-[#7fee64]/30 rounded text-caption text-[#7fee64] font-medium">
                  ✓ Consensus reached
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
