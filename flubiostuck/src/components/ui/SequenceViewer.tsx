'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface SequenceViewerProps {
  sequence: string;
  type?: 'DNA' | 'Protein' | 'scFv';
}

const colors: Record<string, Record<string, string>> = {
  DNA: {
    A: 'text-alert-300',   // A -> 红
    T: 'text-bio-300',     // T -> 青
    G: 'text-glow-300',    // G -> 绿
    C: 'text-ip-300'       // C -> 琥珀
  },
  scFv: {
    A: 'text-alert-300',
    T: 'text-bio-300',
    G: 'text-glow-300',
    C: 'text-ip-300'
  }
};

export function SequenceViewer({ sequence, type = 'DNA' }: SequenceViewerProps) {
  const [copied, setCopied] = useState(false);

  const formatSequence = () => {
    const formatted = sequence.match(/.{1,10}/g)?.join(' ') || sequence;
    return formatted.match(/.{1,60}/g) || [formatted];
  };

  // v2026.09.20-Final: 兼容 navigator.clipboard 不可用的环境（HTTP / 旧浏览器）
  const fallbackCopy = (text: string) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    let ok = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sequence);
        ok = true;
      } else {
        ok = fallbackCopy(sequence);
      }
    } catch {
      ok = fallbackCopy(sequence);
    }
    if (ok) {
      setCopied(true);
      toast.success('序列已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('复制失败，请手动选择文本');
    }
  };

  const lines = formatSequence();
  const colorMap = colors[type] || colors.DNA;

  return (
    <div className="panel-strong overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-ink-900/40">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-1.5 py-0.5 bg-compute-700/30 text-bio-200 border border-compute-500/40 rounded">
            {type}
          </span>
          <span className="text-xs text-text-tertiary">
            长度:{' '}
            <span className="font-mono text-white">
              {sequence.length.toLocaleString()}
            </span>{' '}
            bp/aa
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-text-tertiary hover:text-white hover:bg-white/5"
          aria-label="Copy sequence"
        >
          {copied ? (
            <Check className="w-4 h-4 text-glow-300" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="font-mono text-xs leading-6 max-h-96 overflow-y-auto bg-ink-950/60 p-4">
        {lines.map((line, lineIdx) => (
          <div key={lineIdx} className="flex">
            <span className="w-16 flex-shrink-0 text-text-tertiary select-none text-right pr-3 font-mono">
              {String(lineIdx * 60 + 1).padStart(5, ' ')}
            </span>
            <span className="flex-1 tracking-wider text-white">
              {line.split('').map((char, idx) => (
                <span
                  key={idx}
                  className={char === ' ' ? '' : colorMap[char] || 'text-text-primary'}
                >
                  {char}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 px-4 py-2 border-t border-white/5 text-[11px] text-text-tertiary bg-ink-900/40">
        <span className="text-text-tertiary uppercase tracking-[0.18em] mr-1">Legend</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-alert-400" /> A · 腺嘌呤
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-bio-400" /> T · 胸腺嘧啶
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-glow-400" /> G · 鸟嘌呤
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-ip-400" /> C · 胞嘧啶
        </span>
      </div>
    </div>
  );
}
