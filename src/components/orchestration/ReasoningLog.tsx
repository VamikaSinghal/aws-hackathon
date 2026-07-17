'use client';

import { AgentMessage, SponsorMessage, TimelineEntry, StageType } from '@/lib/orchestration/types';
import { useEffect, useRef } from 'react';
import { Copy, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';

interface ReasoningLogProps {
  agentMessages: AgentMessage[];
  sponsorMessages: SponsorMessage[];
  stage?: StageType;
  maxHeight?: string;
}

export function ReasoningLog({ agentMessages, sponsorMessages, stage, maxHeight = 'max-h-96' }: ReasoningLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentMessages, sponsorMessages]);

  // Combine and sort messages by timestamp
  const allMessages = [
    ...agentMessages.map(m => ({
      type: 'agent' as const,
      timestamp: m.timestamp,
      id: m.id,
      content: m,
    })),
    ...sponsorMessages.map(m => ({
      type: 'sponsor' as const,
      timestamp: m.timestamp,
      id: m.id,
      content: m,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  const filteredMessages = stage
    ? allMessages.filter(m => {
      if (m.type === 'agent') return true;
      return (m.content as SponsorMessage).stage === stage;
    })
    : allMessages;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getAgentColor = (agent: string): string => {
    const colors: { [key: string]: string } = {
      'Planner': '#7fee64',
      'Critic': '#aed2a4',
      'Workout Expert': '#9cbf93',
      'Nutrition Expert': '#aed2a4',
    };
    return colors[agent] || '#8cab87';
  };

  return (
    <div className={`${maxHeight} overflow-y-auto bg-[#000000] rounded-cards border border-[#485346]/40 p-4 space-y-2 font-mono text-body-sm`}>
      {filteredMessages.length === 0 ? (
        <div className="text-center py-8 text-[#677d64]">
          <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
          <p>No messages yet. Start a loop to see orchestration in action.</p>
        </div>
      ) : (
        filteredMessages.map((msg) => {
          if (msg.type === 'agent') {
            const agent = msg.content as AgentMessage;
            const color = getAgentColor(agent.agent);

            return (
              <div key={msg.id} className="flex gap-2 p-2 hover:bg-[#181818] rounded transition-colors group">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ color }}>
                      [{agent.agent}]
                    </span>
                    {agent.type === 'approval' && <CheckCircle size={12} style={{ color }} />}
                    {agent.type === 'block' && <AlertCircle size={12} style={{ color }} />}
                  </div>
                  <p className="text-[#8cab87] break-words">{agent.content}</p>
                </div>
                <button
                  onClick={() => handleCopy(agent.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  title="Copy to clipboard"
                >
                  <Copy size={12} className="text-[#677d64] hover:text-[#8cab87]" />
                </button>
              </div>
            );
          } else {
            const sponsor = msg.content as SponsorMessage;

            return (
              <div key={msg.id} className="flex gap-2 p-2 hover:bg-[#181818] rounded transition-colors group">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#485346]" />
                <div className="flex-1 min-w-0">
                  <div className="text-[#677d64] text-caption mb-0.5">
                    {sponsor.source} → {sponsor.destination}
                  </div>
                  <p className="text-[#8cab87] break-words text-caption">{sponsor.content}</p>
                </div>
                <button
                  onClick={() => handleCopy(sponsor.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  title="Copy to clipboard"
                >
                  <Copy size={12} className="text-[#677d64] hover:text-[#8cab87]" />
                </button>
              </div>
            );
          }
        })
      )}
    </div>
  );
}
