'use client';

import { Shield, ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion } from 'lucide-react';

interface IPStatusBadgeProps {
  status: 'protected' | 'free' | 'pending' | 'restricted';
  riskLevel: 'low' | 'medium' | 'high';
  ipNumber?: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

const statusConfig = {
  protected: { label: '已保护', icon: ShieldCheck, badgeClass: 'badge-warning' },
  free: { label: '免费使用', icon: Shield, badgeClass: 'badge-success' },
  pending: { label: '审核中', icon: ShieldQuestion, badgeClass: 'badge-info' },
  restricted: { label: '限制使用', icon: ShieldX, badgeClass: 'badge-danger' }
};

const riskConfig = {
  low: { label: '低风险', dotClass: 'bg-glow-400', textClass: 'text-glow-200' },
  medium: { label: '中风险', dotClass: 'bg-ip-300', textClass: 'text-ip-200' },
  high: { label: '高风险', dotClass: 'bg-alert-400', textClass: 'text-alert-200' }
};

export function IPStatusBadge({
  status,
  riskLevel,
  ipNumber,
  size = 'md',
  compact
}: IPStatusBadgeProps) {
  const config = statusConfig[status];
  const risk = riskConfig[riskLevel];
  const Icon = config.icon;

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`${config.badgeClass} text-[10px] py-0.5`}>
          <Icon className={iconSizes[size]} />
          <span>{config.label}</span>
        </span>
        <span className="flex items-center gap-1 text-[10px] font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${risk.dotClass}`} />
          <span className={risk.textClass}>{risk.label}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={`${config.badgeClass}`}>
        <Icon className={iconSizes[size]} />
        <span>{config.label}</span>
      </span>

      {ipNumber && (
        <div className="text-xs text-text-tertiary font-mono">
          专利号: <span className="text-text-secondary">{ipNumber}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${risk.dotClass}`} />
        <span className={`text-xs ${risk.textClass}`}>风险等级: {risk.label}</span>
      </div>
    </div>
  );
}
