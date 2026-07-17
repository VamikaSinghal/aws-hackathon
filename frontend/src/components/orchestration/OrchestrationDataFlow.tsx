'use client';

import { StageType, SponsorType } from '@/lib/orchestration/types';
import { useEffect, useRef } from 'react';
import { Database, Brain, Cloud, Lock, Server } from 'lucide-react';

interface OrchestrationDataFlowProps {
  stage?: StageType;
  activeSponsor?: SponsorType;
}

export function OrchestrationDataFlow({ stage, activeSponsor }: OrchestrationDataFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const sponsors: Array<{ name: SponsorType; icon: React.ReactNode; color: string; description: string }> = [
    { name: 'Nexla', icon: <Database size={20} />, color: '#9cbf93', description: 'Data hub' },
    { name: 'Zero.xyz', icon: <Brain size={20} />, color: '#aed2a4', description: 'Agents' },
    { name: 'AWS', icon: <Cloud size={20} />, color: '#7fee64', description: 'Orchestration' },
    { name: 'Pomerium', icon: <Lock size={20} />, color: '#aed2a4', description: 'Security' },
    { name: 'Akash', icon: <Server size={20} />, color: '#9cbf93', description: 'Compute' },
  ];

  // Map stages to active sponsors
  const stageToSponsors: { [key in StageType]: SponsorType[] } = {
    'Collect': ['Nexla'],
    'Diagnose': ['Nexla', 'AWS', 'Zero.xyz'],
    'Plan': ['AWS', 'Zero.xyz'],
    'Act': ['Pomerium', 'AWS'],
    'Observe': ['Nexla', 'Akash'],
    'Learn': ['AWS'],
  };

  const activeSponsorsList = stage ? stageToSponsors[stage] : [];

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const width = svg.clientWidth || 400;
    const height = svg.clientHeight || 300;

    // Remove all animation paths
    const existingPaths = svg.querySelectorAll('path.flow-path');
    existingPaths.forEach(path => path.remove());

    // Draw new animation paths
    if (activeSponsorsList.length > 1) {
      for (let i = 0; i < activeSponsorsList.length - 1; i++) {
        const fromIdx = sponsors.findIndex(s => s.name === activeSponsorsList[i]);
        const toIdx = sponsors.findIndex(s => s.name === activeSponsorsList[i + 1]);

        const fromAngle = (fromIdx / sponsors.length) * 2 * Math.PI - Math.PI / 2;
        const toAngle = (toIdx / sponsors.length) * 2 * Math.PI - Math.PI / 2;

        const fromX = width / 2 + 120 * Math.cos(fromAngle);
        const fromY = height / 2 + 120 * Math.sin(fromAngle);
        const toX = width / 2 + 120 * Math.cos(toAngle);
        const toY = height / 2 + 120 * Math.sin(toAngle);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'flow-path');
        path.setAttribute(
          'd',
          `M ${fromX} ${fromY} Q ${width / 2} ${height / 2} ${toX} ${toY}`
        );
        path.setAttribute('stroke', '#7fee64');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '4 4');
        path.setAttribute(
          'style',
          'animation: flow-animation 2s infinite; opacity: 0.6;'
        );

        // Add arrowhead
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', `arrow-${i}`);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');

        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        arrowPath.setAttribute('fill', '#7fee64');

        marker.appendChild(arrowPath);
        svg.appendChild(marker);
        path.setAttribute('marker-end', `url(#arrow-${i})`);

        svg.appendChild(path);
      }
    }
  }, [activeSponsorsList, stage]);

  return (
    <div className="space-y-4">
      {/* SVG visualization */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
        <svg
          ref={svgRef}
          viewBox="0 0 400 300"
          className="w-full h-64"
          style={{
            background: 'linear-gradient(135deg, rgba(127,238,100,0.03) 0%, transparent 100%)',
          }}
        >
          {/* Outer ring */}
          <circle cx="200" cy="150" r="120" fill="none" stroke="#485346" strokeWidth="1" strokeDasharray="4 4" />

          {/* Center */}
          <circle cx="200" cy="150" r="30" fill="#181818" stroke="#485346" strokeWidth="1" />
          <text
            x="200"
            y="155"
            textAnchor="middle"
            fill="#7fee64"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="500"
          >
            LOOP
          </text>

          {/* Sponsor nodes */}
          {sponsors.map((sponsor, idx) => {
            const angle = (idx / sponsors.length) * 2 * Math.PI - Math.PI / 2;
            const x = 200 + 120 * Math.cos(angle);
            const y = 150 + 120 * Math.sin(angle);
            const isActive = activeSponsorsList.includes(sponsor.name);

            return (
              <g key={sponsor.name}>
                {/* Active pulse */}
                {isActive && (
                  <circle
                    cx={x}
                    cy={y}
                    r="24"
                    fill="none"
                    stroke={sponsor.color}
                    strokeWidth="1.5"
                    opacity="0.4"
                    style={{
                      animation: 'pulse-ring 2s infinite',
                    }}
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill={isActive ? `${sponsor.color}20` : '#212525'}
                  stroke={isActive ? sponsor.color : '#485346'}
                  strokeWidth={isActive ? '2' : '1'}
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                />

                {/* Label */}
                <text
                  x={x}
                  y={y + 28}
                  textAnchor="middle"
                  fill={isActive ? sponsor.color : '#677d64'}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="500"
                >
                  {sponsor.name}
                </text>
              </g>
            );
          })}
        </svg>

        <style jsx>{`
          @keyframes pulse-ring {
            0% {
              r: 24px;
              opacity: 0.6;
            }
            100% {
              r: 38px;
              opacity: 0;
            }
          }

          @keyframes flow-animation {
            0% {
              stroke-dashoffset: 0;
            }
            100% {
              stroke-dashoffset: -8px;
            }
          }
        `}</style>
      </div>

      {/* Stage indicator */}
      {stage && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium">Current Stage</p>
            <p className="text-body-sm text-[#ddffdc] font-medium">{stage}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {activeSponsorsList.map(name => {
              const sponsor = sponsors.find(s => s.name === name)!;
              return (
                <div
                  key={name}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-pills bg-[#181818] border"
                  style={{ borderColor: `${sponsor.color}40` }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sponsor.color }} />
                  <span className="text-caption text-[#8cab87]">{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {sponsors.map(sponsor => (
          <div key={sponsor.name} className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-cards bg-[#212525] border flex items-center justify-center"
              style={{ borderColor: `${sponsor.color}40` }}
            >
              <div style={{ color: sponsor.color }}>{sponsor.icon}</div>
            </div>
            <p className="text-caption text-[#677d64] text-center">{sponsor.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
