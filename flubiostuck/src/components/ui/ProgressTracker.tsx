'use client';

import { useState, useEffect } from 'react';

interface ProgressTrackerProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  label?: string;
}

/**
 * Progress Indicator with step labels and accessibility
 */
export function ProgressTracker({ steps, currentStep, onStepClick, label = '进度' }: ProgressTrackerProps) {
  const percent = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div 
      className="space-y-2" 
      role="progressbar" 
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={label}
    >
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono text-text-tertiary">{label}</span>
        <span className="font-mono text-bio-200">{currentStep + 1}/{steps.length}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-bio-500 via-compute-500 to-glow-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between gap-1 mt-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => onStepClick?.(i)}
            disabled={!onStepClick}
            className={`flex-1 text-[10px] font-mono px-1.5 py-1 rounded transition ${
              i === currentStep
                ? 'bg-bio-500/20 text-bio-200 border border-bio-500/40'
                : i < currentStep
                ? 'bg-glow-500/10 text-glow-200 border border-glow-500/30'
                : 'bg-white/3 text-text-tertiary border border-white/10'
            } ${onStepClick ? 'cursor-pointer hover:border-white/20' : ''}`}
            title={step}
          >
            <span className="truncate block">{step}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Page Loading Indicator with estimated time
 */
export function LoadingIndicator({ 
  message = '加载中', 
  submessage,
  estimatedSeconds 
}: { 
  message?: string; 
  submessage?: string;
  estimatedSeconds?: number;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-bio-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-bio-500 border-t-transparent animate-spin" />
      </div>
      <div className="text-sm font-medium text-white">{message}</div>
      {submessage && <div className="text-xs text-text-tertiary">{submessage}</div>}
      {estimatedSeconds && (
        <div className="text-[10px] font-mono text-text-tertiary">
          预计 {estimatedSeconds}s · 已用 {elapsed}s
        </div>
      )}
    </div>
  );
}
