'use client';

import { motion } from 'framer-motion';
import { DBTLStep } from '@/lib/demoData';
import { PenTool, Hammer, FlaskConical, BookOpen, Check, Clock, Loader } from 'lucide-react';

interface DBTLTimelineProps {
  steps: DBTLStep[];
}

const phaseConfig = {
  Design: {
    icon: PenTool,
    accent: 'from-compute-500 to-bio-500',
    label: '设计'
  },
  Build: { icon: Hammer, accent: 'from-bio-500 to-glow-500', label: '构建' },
  Test: { icon: FlaskConical, accent: 'from-glow-500 to-bio-400', label: '测试' },
  Learn: { icon: BookOpen, accent: 'from-ip-400 to-compute-500', label: '学习' }
};

const statusIcons = {
  completed: Check,
  in_progress: Loader,
  planned: Clock
};

export function DBTLTimeline({ steps }: DBTLTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-compute-500/40 via-bio-500/40 to-glow-500/40" />

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const config = phaseConfig[step.phase];
          const Icon = config.icon;
          const StatusIcon = statusIcons[step.status];

          return (
            <motion.div
              key={`${step.phase}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="relative flex items-start gap-4"
            >
              <div
                className={`relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${config.accent} flex items-center justify-center z-10 shadow-glow-sm`}
              >
                <Icon className="w-4 h-4 text-ink-950" strokeWidth={2.4} />
              </div>

              <div className="flex-1 panel p-4 hover:border-compute-500/40 transition">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{config.label}</h4>
                    <StatusIcon
                      className={`w-3.5 h-3.5 ${
                        step.status === 'completed'
                          ? 'text-glow-300'
                          : step.status === 'in_progress'
                          ? 'text-bio-300 animate-spin'
                          : 'text-text-tertiary'
                      }`}
                    />
                    {step.status === 'completed' && (
                      <span className="badge badge-success text-[10px]">已完成</span>
                    )}
                    {step.status === 'in_progress' && (
                      <span className="badge badge-info text-[10px]">进行中</span>
                    )}
                    {step.status === 'planned' && (
                      <span className="badge badge-neutral text-[10px]">计划中</span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-text-tertiary">{step.date}</span>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-2">
                  {step.description}
                </p>

                {step.result && (
                  <div className="mt-2 px-3 py-1.5 rounded-md bg-glow-500/10 border border-glow-500/30 text-xs text-glow-200 font-mono">
                    结果: {step.result}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
