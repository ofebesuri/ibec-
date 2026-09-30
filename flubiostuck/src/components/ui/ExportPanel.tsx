'use client';

import { Download, FileText, Code, Table, Image, BookOpen, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  format: 'json' | 'csv' | 'fasta' | 'genbank' | 'sbol' | 'markdown' | 'html' | 'pdf';
}

export const EXPORT_FORMATS: ExportOption[] = [
  {
    id: 'json',
    label: 'JSON',
    description: '完整元数据（推荐用于数据交换）',
    icon: <Code size={16} />,
    format: 'json'
  },
  {
    id: 'csv',
    label: 'CSV',
    description: '表格化数据（用于 Excel/SigmaPlot）',
    icon: <Table size={16} />,
    format: 'csv'
  },
  {
    id: 'fasta',
    label: 'FASTA',
    description: '核酸/蛋白序列格式（用于 BLAST）',
    icon: <FileText size={16} />,
    format: 'fasta'
  },
  {
    id: 'genbank',
    label: 'GenBank',
    description: '标准 GenBank 格式（用于 NCBI）',
    icon: <BookOpen size={16} />,
    format: 'genbank'
  },
  {
    id: 'sbol',
    label: 'SBOL 2.0',
    description: '合成生物学开放语言（用于 CAD）',
    icon: <Code size={16} />,
    format: 'sbol'
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'iGEM Wiki 兼容格式',
    icon: <FileText size={16} />,
    format: 'markdown'
  },
  {
    id: 'html',
    label: 'HTML',
    description: '可直接上传 Wiki 的 HTML 页面',
    icon: <Image size={16} />,
    format: 'html'
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: '完整分析报告（含图表）',
    icon: <Download size={16} />,
    format: 'pdf'
  }
];

interface ExportPanelProps {
  componentData?: any;
  analysisData?: any;
  onExport?: (format: string, data: any) => void;
  className?: string;
}

export function ExportPanel({ componentData, analysisData, onExport, className = '' }: ExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setExportSuccess(false);
    
    try {
      const format = selectedFormat;
      const data = componentData || analysisData;
      
      if (!data) {
        toast.error('没有可导出的数据');
        return;
      }

      // Call the appropriate export API
      if (format === 'markdown' || format === 'html') {
        // Use Wiki export API
        const response = await fetch('/api/export/wiki', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            format,
            title: data.name || 'FluBioStack Export',
            projectName: 'FluBioStack Project',
            sections: [
              { type: 'text', title: 'Overview', content: { text: data.description || '' } },
              { type: 'sequence', title: 'Sequence', content: { name: data.name, sequence: data.sequence || '' } },
              ...(data.dbtlSteps ? [{ type: 'dbtl' as const, title: 'DBTL Cycle', content: { steps: data.dbtlSteps } }] : [])
            ]
          })
        });

        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(data.name || 'export').replace(/\s+/g, '_')}_wiki.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Client-side export for other formats
        let content: string;
        let mimeType: string;
        let extension: string;

        switch (format) {
          case 'json':
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            extension = 'json';
            break;
          case 'csv':
            content = convertToCSV(data);
            mimeType = 'text/csv';
            extension = 'csv';
            break;
          case 'fasta':
            content = convertToFASTA(data);
            mimeType = 'text/plain';
            extension = 'fasta';
            break;
          case 'genbank':
            content = convertToGenBank(data);
            mimeType = 'text/plain';
            extension = 'gb';
            break;
          case 'sbol':
            content = generateSBOL(data);
            mimeType = 'application/xml';
            extension = 'xml';
            break;
          default:
            throw new Error('Unsupported format');
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(data.id || data.name || 'export').replace(/\s+/g, '_')}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setExportSuccess(true);
      toast.success('导出成功');
      onExport?.(selectedFormat, data);
      
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`panel p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-text-tertiary">
            DATA EXPORT
          </div>
          <div className="text-sm font-semibold text-white mt-1">导出面板</div>
        </div>
        {exportSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-bio-200">
            <CheckCircle size={14} />
            导出成功
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {EXPORT_FORMATS.slice(0, 6).map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedFormat(option.id)}
            className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
              selectedFormat === option.id
                ? 'border-bio-500/60 bg-bio-500/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className={`${selectedFormat === option.id ? 'text-bio-300' : 'text-text-tertiary'}`}>
              {option.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-semibold ${selectedFormat === option.id ? 'text-white' : 'text-text-secondary'}`}>
                {option.label}
              </div>
              <div className="text-[10px] text-text-tertiary truncate">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="panel px-4 py-3 text-xs text-text-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-start gap-2">
          <span className="text-alert-300">⚠</span>
          <span>
            {selectedFormat === 'genbank' && 'GenBank 格式包含 LOCUS、DEFINITION、ACCESSION、FEATURES 等标准字段，可直接提交至 NCBI GenBank。'}
            {selectedFormat === 'sbol' && 'SBOL 2.0 是合成生物学标准数据格式，支持 SynBioHub、 Benchling 等主流平台。'}
            {selectedFormat === 'fasta' && 'FASTA 是 BLAST、Clustal 等工具的标准输入格式，仅包含序列信息。'}
            {selectedFormat === 'csv' && 'CSV 格式可用于 Excel、GraphPad Prism 等数据分析软件。'}
            {selectedFormat === 'markdown' && 'Markdown 格式可直接粘贴到 iGEM Wiki。'}
            {selectedFormat === 'html' && 'HTML 格式可直接作为 iGEM Wiki 页面，保留样式和布局。'}
            {!['genbank', 'sbol', 'fasta', 'csv', 'markdown', 'html'].includes(selectedFormat) && '请选择导出格式。'}
          </span>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting || !componentData && !analysisData}
        className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{
          background: exporting ? undefined : 'linear-gradient(135deg, #16BFDB, #7E3AFF)',
          color: exporting ? '#9BA8D0' : '#0B1020'
        }}
      >
        {exporting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            导出中...
          </>
        ) : (
          <>
            <Download size={14} />
            导出 {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.label}
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// Format Converters
// ============================================================================

function convertToCSV(data: any): string {
  if (data.sequence) {
    // For sequence data, create CSV with sequence chunks
    const chunks = data.sequence.match(/.{1,60}/g) || [];
    return 'position,sequence\n' + chunks.map((chunk: string, i: number) => `${i * 60 + 1},${chunk}`).join('\n');
  }
  
  if (data.candidates) {
    // For analysis results
    const headers = ['rank', 'mutation', 'position', 'stabilityScore', 'affinityScore', 'deltaTm'];
    const rows = data.candidates.map((c: any) => 
      [c.rank, c.mutation, c.position, c.stabilityScore, c.affinityScore, c.deltaTmC].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  // Generic
  return JSON.stringify(data, null, 2);
}

function convertToFASTA(data: any): string {
  const seq = data.sequence || '';
  const name = data.name || data.id || 'sequence';
  const description = data.description || '';
  
  return `>${name} ${description}\n${seq.match(/.{1,70}/g)?.join('\n') || seq}`;
}

function convertToGenBank(data: any): string {
  const seq = data.sequence || '';
  const name = data.name || data.id || 'UNKNOWN';
  const organism = data.strain || 'synthetic construct';
  
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const length = seq.length;
  
  let gb = `LOCUS       ${name.padEnd(16)} ${length} bp    DNA     SYN\n`;
  gb += `DEFINITION  ${data.description || name}\n`;
  gb += `ACCESSION   ${data.id || 'XXXX'}\n`;
  gb += `VERSION     ${data.id || 'XXXX'}.1\n`;
  gb += `KEYWORDS    .\n`;
  gb += `SOURCE      ${organism}\n`;
  gb += `  ORGANISM  ${organism}\n`;
  gb += `REFERENCES  .\n`;
  gb += `FEATURES             Location/Qualifiers\n`;
  
  if (data.sequenceType === 'scFv') {
    gb += `     CDS             1..${length}\n`;
    gb += `                     /product="${name}"\n`;
    gb += `                     /protein_id="${data.id || 'XXX'}"\n`;
    gb += `                     /translation="${seq.match(/.{1,60}/g)?.join('\n                     ') || seq}"\n`;
  }
  
  gb += `ORIGIN\n`;
  // Numbered sequence
  const chunks = seq.match(/.{1,60}/g) || [];
  chunks.forEach((chunk: string, i: number) => {
    const pos = i * 60 + 1;
    const paddedPos = pos.toString().padStart(9);
    const formatted = chunk.match(/.{1,10}/g)?.join(' ') || chunk;
    gb += `${paddedPos} ${formatted.padEnd(60)}\n`;
  });
  gb += '//';
  
  return gb;
}

function generateSBOL(data: any): string {
  const seq = data.sequence || '';
  const name = data.name || data.id || 'component';
  const uri = `http://flubiostack.edu/parts/${data.id || 'unknown'}`;
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:sbol="http://sbols.org/v2#"
         xmlns:dc="http://purl.org/dc/elements/1.1/">
  <sbol:ComponentDefinition rdf:about="${uri}">
    <dc:title>${name}</dc:title>
    <sbol:persistentIdentity>${uri}</sbol:persistentIdentity>
    <sbol:displayId>${data.id || 'unknown'}</sbol:displayId>
    <sbol:version>1.0.0</sbol:version>
    <sbol:type rdf:resource="http://www.biopax.org/release/biopax-level3.owl#DnaRegion"/>
    <sbol:role rdf:resource="http://sbols.org/v2#CDS"/>
    <sbol:sequence rdf:about="${uri}/sequence/1">
      <sbol:encoding rdf:resource="http://sbols.org/v2#IUPACDNA"/>
      <sbol:elements>${seq}</sbol:elements>
    </sbol:sequence>
  </sbol:ComponentDefinition>
</rdf:RDF>`;
  
  return xml;
}

export default ExportPanel;
