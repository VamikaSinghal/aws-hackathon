'use client';

import { DemoLoopVisualizer } from '@/components/orchestration/DemoLoopVisualizer';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#000000]">
      {/* Header */}
      <div className="bg-[#181818] border-b border-[#485346]/40 sticky top-0 z-40">
        <div className="max-w-page mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#8cab87] hover:text-[#ddffdc] transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-body-sm font-medium">Back</span>
            </Link>
            <div className="w-px h-6 bg-[#485346]/40" />
            <h1 className="text-heading-sm text-[#ddffdc] font-medium">Orchestration Explorer</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#7fee64] animate-pulse" />
              <span className="text-caption text-[#8cab87]">Live Demo</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-page mx-auto px-6 py-12">
        <DemoLoopVisualizer autoStart={true} />
      </div>

      {/* Footer */}
      <div className="border-t border-[#485346]/20 bg-[#000000] py-8 px-6 mt-16">
        <div className="max-w-page mx-auto">
          <p className="text-caption text-[#677d64] text-center">
            This demo shows how LifeOS orchestrates sponsor services in real-time. Sponsor data flows through the loop while AI agents reason and debate. All actions are authorized by Pomerium before execution.
          </p>
        </div>
      </div>
    </main>
  );
}
