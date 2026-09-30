'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, Info, XCircle } from 'lucide-react';

export type BiosafetyLevel = 'BSL-1' | 'BSL-2' | 'BSL-3' | 'BSL-4';

interface BioSafetyBadgeProps {
  level: BiosafetyLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

const BSL_CONFIG: Record<BiosafetyLevel, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  description: string;
  riskColor: string;
}> = {
  'BSL-1': {
    label: 'BSL-1',
    color: '#16D88A',
    bgColor: 'rgba(22, 216, 138, 0.1)',
    borderColor: 'rgba(22, 216, 138, 0.4)',
    textColor: '#16D88A',
    icon: '✓',
    description: '低风险微生物，如E. coli K12，适用于标准实验室操作',
    riskColor: '#16D88A'
  },
  'BSL-2': {
    label: 'BSL-2',
    color: '#FF9A1F',
    bgColor: 'rgba(255, 154, 31, 0.1)',
    borderColor: 'rgba(255, 154, 31, 0.4)',
    textColor: '#FF9A1F',
    icon: '⚠',
    description: '中风险病原体，如HBV、SIV，需要生物安全柜操作',
    riskColor: '#FF9A1F'
  },
  'BSL-3': {
    label: 'BSL-3',
    color: '#FF4242',
    bgColor: 'rgba(255, 66, 66, 0.12)',
    borderColor: 'rgba(255, 66, 66, 0.5)',
    textColor: '#FF4242',
    icon: '⚡',
    description: '高风险病原体，如SARS-CoV-2，需要负压隔离操作',
    riskColor: '#FF4242'
  },
  'BSL-4': {
    label: 'BSL-4',
    color: '#7E3AFF',
    bgColor: 'rgba(126, 58, 255, 0.15)',
    borderColor: 'rgba(126, 58, 255, 0.6)',
    textColor: '#7E3AFF',
    icon: '☣',
    description: '极高风险病原体，如Ebola，需全身防护和独立设施',
    riskColor: '#7E3AFF'
  }
};

const SIZE_CONFIG = {
  sm: { padding: '2px 6px', fontSize: '10px', iconSize: 10 },
  md: { padding: '4px 10px', fontSize: '11px', iconSize: 12 },
  lg: { padding: '6px 14px', fontSize: '12px', iconSize: 14 }
};

export function BioSafetyBadge({
  level,
  showLabel = true,
  size = 'md',
  interactive = false,
  className = ''
}: BioSafetyBadgeProps) {
  const config = BSL_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];
  
  const content = (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md font-mono font-semibold tracking-wide ${className}`}
      style={{
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.textColor,
        boxShadow: `0 0 8px ${config.color}20`
      }}
      title={config.description}
    >
      <Shield 
        size={sizeConfig.iconSize} 
        style={{ color: config.textColor }} 
        strokeWidth={2.5}
      />
      {showLabel && <span>{config.label}</span>}
    </div>
  );

  if (interactive) {
    return (
      <label 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        title={config.description}
      >
        {content}
      </label>
    );
  }

  return content;
}

// ============================================================================
// Dual Use Alert Component
// ============================================================================

interface DualUseAlertProps {
  geneName: string;
  riskType: string;
  description: string;
  onAcknowledge?: () => void;
  onReviewGuidelines?: () => void;
}

export function DualUseAlert({
  geneName,
  riskType,
  description,
  onAcknowledge,
  onReviewGuidelines
}: DualUseAlertProps) {
  return (
    <div 
      className="rounded-lg border p-4 space-y-3"
      style={{
        backgroundColor: 'rgba(255, 66, 66, 0.08)',
        borderColor: 'rgba(255, 66, 66, 0.4)'
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(255, 66, 66, 0.2)' }}
        >
          <AlertTriangle size={16} style={{ color: '#FF4242' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm">Dual Use Research of Concern (DURC)</span>
            <span 
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ 
                backgroundColor: 'rgba(255, 66, 66, 0.2)', 
                color: '#FF4242',
                border: '1px solid rgba(255, 66, 66, 0.4)'
              }}
            >
              {riskType}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            元件 <span className="font-mono text-white">{geneName}</span> 存在潜在的{risKType(riskType)}风险
          </p>
          <p className="text-xs text-text-tertiary mt-1">{description}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 ml-11">
        {onReviewGuidelines && (
          <button
            onClick={onReviewGuidelines}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition"
            style={{
              backgroundColor: 'rgba(255, 154, 31, 0.15)',
              border: '1px solid rgba(255, 154, 31, 0.4)',
              color: '#FF9A1F'
            }}
          >
            <Info size={12} />
            查看指南
          </button>
        )}
        {onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition"
            style={{
              backgroundColor: 'rgba(22, 216, 138, 0.15)',
              border: '1px solid rgba(22, 216, 138, 0.4)',
              color: '#16D88A'
            }}
          >
            <Shield size={12} />
            确认已阅
          </button>
        )}
      </div>
    </div>
  );
}

function risKType(type: string): string {
  const map: Record<string, string> = {
    'TOXIN': '毒素相关',
    'PATHOGENICITY': '致病性',
    'ANTIBIOTIC_RESISTANCE': '抗生素耐药',
    'GENE_DRIVE': '基因驱动',
    'ENHANCED_PATHOGEN': '增强病原体'
  };
  return map[type] || type;
}

// ============================================================================
// BSL Selector Component for Upload
// ============================================================================

interface BSLSelectorProps {
  value: BiosafetyLevel;
  onChange: (level: BiosafetyLevel) => void;
  showDescription?: boolean;
}

const ALL_BSL_LEVELS: BiosafetyLevel[] = ['BSL-1', 'BSL-2', 'BSL-3', 'BSL-4'];

export function BSLSelector({ value, onChange, showDescription = true }: BSLSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-mono tracking-[0.16em] uppercase text-text-tertiary">
        生物安全等级
      </label>
      <div className="grid grid-cols-4 gap-2">
        {ALL_BSL_LEVELS.map((level) => {
          const config = BSL_CONFIG[level];
          const isSelected = value === level;
          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              className="relative flex flex-col items-center p-3 rounded-lg border transition-all"
              style={{
                backgroundColor: isSelected ? config.bgColor : 'transparent',
                borderColor: isSelected ? config.borderColor : 'rgba(255,255,255,0.1)',
                boxShadow: isSelected ? `0 0 12px ${config.color}30` : 'none'
              }}
            >
              <Shield 
                size={20} 
                style={{ color: isSelected ? config.textColor : '#6A77A8' }} 
                strokeWidth={2}
              />
              <span 
                className="mt-1.5 font-mono text-xs font-semibold"
                style={{ color: isSelected ? config.textColor : '#9BA8D0' }}
              >
                {level}
              </span>
              {isSelected && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: config.textColor }}
                >
                  <span className="text-[8px] text-ink-950 font-bold">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {showDescription && (
        <div className="mt-2 px-3 py-2 rounded-md text-xs text-text-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Info size={12} className="inline mr-1.5 text-bio-300" />
          {BSL_CONFIG[value].description}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Safety Checklist for Upload Review
// ============================================================================

interface SafetyCheckItem {
  id: string;
  question: string;
  category: 'containment' | 'ethics' | 'intellectual_property' | 'environmental';
  required: boolean;
}

const SAFETY_CHECKLIST: SafetyCheckItem[] = [
  { id: 'sc1', question: '本元件使用的宿主生物属于 BSL-1 或 BSL-2 级别', category: 'containment', required: true },
  { id: 'sc2', question: '本元件不涉及已知的高致病性病原体序列', category: 'containment', required: true },
  { id: 'sc3', question: '本元件不包含毒素基因（如肉毒杆菌毒素、破伤风毒素）', category: 'containment', required: true },
  { id: 'sc4', question: '本元件不涉及基因驱动（Gene Drive）系统', category: 'ethics', required: true },
  { id: 'sc5', question: '本元件不涉及抗生素耐药性选择标记的转移', category: 'containment', required: true },
  { id: 'sc6', question: '已确认本元件的使用不侵犯他人知识产权', category: 'intellectual_property', required: true },
  { id: 'sc7', question: '本元件不涉及对环境有潜在危害的转基因生物释放', category: 'environmental', required: true },
  { id: 'sc8', question: '本项目的生物安全工作已获得相关伦理委员会批准', category: 'ethics', required: true }
];

interface SafetyReviewProps {
  onComplete?: (passed: boolean) => void;
}

export function SafetyChecklist({ onComplete }: SafetyReviewProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const allRequiredChecked = SAFETY_CHECKLIST
    .filter(item => item.required)
    .every(item => checked[item.id]);

  const handleSubmit = () => {
    if (allRequiredChecked) {
      setSubmitted(true);
      onComplete?.(true);
    }
  };

  const categories = {
    containment: { label: '生物安全防控', color: '#16BFDB' },
    ethics: { label: '伦理审查', color: '#7E3AFF' },
    intellectual_property: { label: '知识产权', color: '#FF9A1F' },
    environmental: { label: '环境影响', color: '#16D88A' }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 text-center" style={{ borderColor: 'rgba(22, 216, 138, 0.4)', backgroundColor: 'rgba(22, 216, 138, 0.05)' }}>
        <Shield size={48} style={{ color: '#16D88A' }} className="mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">安全自评估通过</h3>
        <p className="text-sm text-text-secondary">您的元件已通过 FluBioStack 安全自评估流程</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} style={{ color: '#FF9A1F' }} />
        <span className="text-sm font-semibold text-white">上传前安全自评估</span>
        <span className="text-xs text-text-tertiary">（所有必填项需勾选）</span>
      </div>

      {Object.entries(categories).map(([cat, config]) => {
        const items = SAFETY_CHECKLIST.filter(item => item.category === cat);
        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono" style={{ color: config.color }}>
              <span className="w-1 h-4 rounded-full" style={{ backgroundColor: config.color }} />
              {config.label}
            </div>
            {items.map(item => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition"
                style={{
                  backgroundColor: checked[item.id] ? 'rgba(22, 216, 138, 0.05)' : 'transparent',
                  borderColor: checked[item.id] ? 'rgba(22, 216, 138, 0.3)' : 'rgba(255,255,255,0.08)'
                }}
              >
                <input
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={(e) => setChecked({ ...checked, [item.id]: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded accent-emerald-400"
                />
                <span className="text-sm text-text-secondary flex-1">{item.question}</span>
                {item.required && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,66,66,0.1)', color: '#FF4242' }}>
                    必填
                  </span>
                )}
              </label>
            ))}
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        disabled={!allRequiredChecked}
        className="w-full py-3 rounded-lg font-semibold text-sm transition disabled:opacity-40"
        style={{
          backgroundColor: allRequiredChecked ? 'linear-gradient(135deg, #16D88A, #16BFDB)' : undefined,
          background: allRequiredChecked ? 'linear-gradient(135deg, #16D88A, #16BFDB)' : undefined,
          color: allRequiredChecked ? '#0B1020' : '#6A77A8',
          border: allRequiredChecked ? 'none' : '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {allRequiredChecked ? '✓ 确认并提交' : '请完成所有必填项'}
      </button>
    </div>
  );
}

// Need useState import (already imported at top)

export default BioSafetyBadge;
