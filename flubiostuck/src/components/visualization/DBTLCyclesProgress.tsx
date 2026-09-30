'use client';

import { useMemo } from 'react';
import { Circle, CheckCircle, Clock, Loader } from 'lucide-react';

export interface DBTLCycleData {
  id: string;
  cycleNumber: number;
  design: { status: 'completed' | 'in_progress' | 'planned'; date?: string; metrics?: any };
  build: { status: 'completed' | 'in_progress' | 'planned'; date?: string; metrics?: any };
  test: { status: 'completed' | 'in_progress' | 'planned'; date?: string; metrics?: any };
  learn: { status: 'completed' | 'in_progress' | 'planned'; date?: string; metrics?: any };
  summary?: string;
}

interface DBTLCyclesProgressProps {
  cycles: DBTLCycleData[];
  title?: string;
  height?: number;
}

export function DBTLCyclesProgress({ cycles, title = 'DBTL Cycle Progress', height = 280 }: DBTLCyclesProgressProps) {
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    
    cycles.forEach(cycle => {
      ['design', 'build', 'test', 'learn'].forEach(phase => {
        total++;
        if (cycle[phase as keyof DBTLCycleData]) {
          const status = (cycle[phase as keyof DBTLCycleData] as any).status;
          if (status === 'completed') completed++;
          if (status === 'in_progress') inProgress++;
        }
      });
    });

    return {
      total,
      completed,
      inProgress,
      percentComplete: Math.round((completed / total) * 100)
    };
  }, [cycles]);

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle size={12} className="text-bio-300" />;
    if (status === 'in_progress') return <Loader size={12} className="text-alert-300 animate-spin" />;
    return <Circle size={12} className="text-text-tertiary" />;
  };

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      design: 'Design',
      build: 'Build',
      test: 'Test',
      learn: 'Learn'
    };
    return labels[phase] || phase;
  };

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
            DBTL CYCLES · {cycles.length} ITERATIONS
          </div>
          <div className="text-sm font-semibold text-white mt-1">{title}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text">{stats.percentComplete}%</div>
          <div className="text-[10px] text-text-tertiary">{stats.completed}/{stats.total} 完成</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${stats.percentComplete}%`,
              background: 'linear-gradient(90deg, #16BFDB, #7E3AFF, #16D88A)'
            }}
          />
        </div>
        {stats.inProgress > 0 && (
          <div className="mt-1.5 text-[10px] font-mono text-alert-300 flex items-center gap-1">
            <Loader size={10} className="animate-spin" />
            {stats.inProgress} 项进行中
          </div>
        )}
      </div>

      {/* Cycle Grid */}
      <div className="space-y-2">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="panel p-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono text-text-secondary">
                Cycle #{cycle.cycleNumber}
              </div>
              {cycle.summary && (
                <div className="text-[10px] font-mono text-text-tertiary truncate max-w-[300px]">
                  {cycle.summary}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['design', 'build', 'test', 'learn'] as const).map((phase) => {
                const phaseData = cycle[phase];
                return (
                  <div 
                    key={phase} 
                    className="flex items-center gap-2 px-2 py-1.5 rounded"
                    style={{ 
                      backgroundColor: phaseData.status === 'completed' 
                        ? 'rgba(22, 216, 138, 0.08)' 
                        : phaseData.status === 'in_progress'
                        ? 'rgba(255, 154, 31, 0.08)'
                        : 'rgba(255,255,255,0.03)'
                    }}
                  >
                    {getStatusIcon(phaseData.status)}
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-white">{getPhaseLabel(phase)}</div>
                      {phaseData.date && (
                        <div className="text-[9px] text-text-tertiary">{phaseData.date}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Demo data for 3 DBTL cycles
export const DEMO_DBTL_CYCLES: DBTLCycleData[] = [
  {
    id: 'cycle-1',
    cycleNumber: 1,
    design: { status: 'completed', date: '2023-06-01', metrics: { ic50: 12.5 } },
    build: { status: 'completed', date: '2023-07-15' },
    test: { status: 'completed', date: '2023-08-20', metrics: { ic50: 12.5 } },
    learn: { status: 'completed', date: '2023-09-10', metrics: { improvement: 0 } },
    summary: '基线设计 · IC50=12.5nM'
  },
  {
    id: 'cycle-2',
    cycleNumber: 2,
    design: { status: 'completed', date: '2023-09-20', metrics: { mutations: ['S31R'] } },
    build: { status: 'completed', date: '2023-10-10' },
    test: { status: 'completed', date: '2023-10-30', metrics: { ic50: 3.2 } },
    learn: { status: 'completed', date: '2023-11-15', metrics: { improvement: 74 } },
    summary: '突变 S31R · IC50=3.2nM (-74%)'
  },
  {
    id: 'cycle-3',
    cycleNumber: 3,
    design: { status: 'completed', date: '2023-12-01', metrics: { mutations: ['S31R', 'Y52H'] } },
    build: { status: 'completed', date: '2023-12-20' },
    test: { status: 'in_progress', date: '2024-01-15' },
    learn: { status: 'planned', date: '2024-02-01' },
    summary: '双突变 S31R+Y52H · 进行中'
  }
];

export default DBTLCyclesProgress;
