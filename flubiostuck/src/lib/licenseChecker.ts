/**
 * IP Enhancement: License Checker & Patent Analysis
 */

// ============================================================================
// License Types and Compatibility Matrix
// ============================================================================

export type LicenseType = 'MIT' | 'BSD-2' | 'BSD-3' | 'Apache-2.0' | 'GPL-2.0' | 'GPL-3.0' | 'LGPL-2.1' | 'LGPL-3.0' | 'AGPL-3.0' | 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'CC-BY-NC' | 'UNKNOWN';

export interface LicenseAnalysis {
  license: LicenseType;
  isOpenSource: boolean;
  commercialUse: 'free' | 'requires_attribution' | 'restricted' | 'prohibited';
  modifications: 'free' | 'requires_share_alike' | 'restricted' | 'prohibited';
  sublicensing: 'free' | 'restricted' | 'prohibited';
  patentUse: 'free' | 'requires_license' | 'unknown';
  copyleft: 'none' | 'weak' | 'strong' | 'strong_network';
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
  obligations: string[];
  recommendations: string[];
}

export interface PatentInfo {
  patentNumber: string;
  title: string;
  applicants: string[];
  filingDate: string;
  status: 'active' | 'expired' | 'pending' | 'withdrawn';
  claims: string[];
  relatedGenes?: string[];
  scope: 'narrow' | 'medium' | 'broad';
  expirationDate?: string;
}

// ============================================================================
// License Analysis Database
// ============================================================================

const LICENSE_DB: Record<LicenseType, Omit<LicenseAnalysis, 'license'>> = {
  'MIT': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'free',
    sublicensing: 'free',
    patentUse: 'free',
    copyleft: 'none',
    riskLevel: 'low',
    warnings: [],
    obligations: ['必须保留原始版权声明'],
    recommendations: ['可自由用于商业产品']
  },
  'BSD-2': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'free',
    sublicensing: 'free',
    patentUse: 'free',
    copyleft: 'none',
    riskLevel: 'low',
    warnings: [],
    obligations: ['必须保留版权声明和免责声明'],
    recommendations: ['适合商业闭源使用']
  },
  'BSD-3': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'free',
    sublicensing: 'free',
    patentUse: 'free',
    copyleft: 'none',
    riskLevel: 'low',
    warnings: ['不得使用开源作者的姓名推广产品'],
    obligations: ['必须保留版权声明、免责声明', '不得使用作者姓名代言'],
    recommendations: ['适合商业闭源使用']
  },
  'Apache-2.0': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'free',
    sublicensing: 'free',
    patentUse: 'free',
    copyleft: 'weak',
    riskLevel: 'low',
    warnings: ['包含专利授权条款'],
    obligations: ['必须保留版权声明和许可证文本', '修改文件必须标注'],
    recommendations: ['明确专利授权，适合企业使用']
  },
  'GPL-2.0': {
    isOpenSource: true,
    commercialUse: 'requires_attribution',
    modifications: 'requires_share_alike',
    sublicensing: 'restricted',
    patentUse: 'requires_license',
    copyleft: 'strong',
    riskLevel: 'medium',
    warnings: ['强传染性：衍生作品必须开源'],
    obligations: ['衍生作品必须采用GPL-2.0许可证', '必须提供源代码'],
    recommendations: ['如需闭源，应避免使用GPL-2.0组件']
  },
  'GPL-3.0': {
    isOpenSource: true,
    commercialUse: 'requires_attribution',
    modifications: 'requires_share_alike',
    sublicensing: 'restricted',
    patentUse: 'free',
    copyleft: 'strong',
    riskLevel: 'medium',
    warnings: ['强传染性：衍生作品必须开源', '包含专利保护条款'],
    obligations: ['衍生作品必须采用GPL-3.0许可证', '必须提供源代码', '禁止附加限制条款'],
    recommendations: ['如需闭源，应避免使用GPL-3.0组件']
  },
  'LGPL-2.1': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'requires_share_alike',
    sublicensing: 'restricted',
    patentUse: 'requires_license',
    copyleft: 'weak',
    riskLevel: 'medium',
    warnings: ['弱传染性：仅库文件需要开源'],
    obligations: ['库引用代码可闭源', '修改库文件必须开源'],
    recommendations: ['适合作为库被闭源产品引用']
  },
  'LGPL-3.0': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'requires_share_alike',
    sublicensing: 'restricted',
    patentUse: 'free',
    copyleft: 'weak',
    riskLevel: 'medium',
    warnings: ['弱传染性：仅库文件需要开源'],
    obligations: ['库引用代码可闭源', '修改库文件必须开源'],
    recommendations: ['适合作为库被闭源产品引用']
  },
  'AGPL-3.0': {
    isOpenSource: true,
    commercialUse: 'restricted',
    modifications: 'requires_share_alike',
    sublicensing: 'restricted',
    patentUse: 'requires_license',
    copyleft: 'strong_network',
    riskLevel: 'high',
    warnings: ['最强传染性：网络使用也必须开源！'],
    obligations: ['所有网络服务使用必须开源', '衍生作品必须开源'],
    recommendations: ['除非项目本身开源，否则避免使用AGPL组件']
  },
  'CC0': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'free',
    sublicensing: 'free',
    patentUse: 'free',
    copyleft: 'none',
    riskLevel: 'low',
    warnings: ['放弃所有权利，包括版权和专利'],
    obligations: ['无强制义务（但建议注明来源）'],
    recommendations: ['相当于公有领域，可自由使用']
  },
  'CC-BY': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'free',
    sublicensing: 'free',
    patentUse: 'unknown',
    copyleft: 'none',
    riskLevel: 'low',
    warnings: [],
    obligations: ['必须注明作者和来源'],
    recommendations: ['适合商业使用但需署名']
  },
  'CC-BY-SA': {
    isOpenSource: true,
    commercialUse: 'free',
    modifications: 'free',
    sublicensing: 'free',
    patentUse: 'unknown',
    copyleft: 'weak',
    riskLevel: 'low',
    warnings: ['SA (Share-Alike)：衍生作品必须采用相同许可证'],
    obligations: ['必须署名', '衍生作品必须采用CC-BY-SA'],
    recommendations: ['适合开源项目，教育用途友好']
  },
  'CC-BY-NC': {
    isOpenSource: false,
    commercialUse: 'prohibited',
    modifications: 'free',
    sublicensing: 'restricted',
    patentUse: 'unknown',
    copyleft: 'none',
    riskLevel: 'medium',
    warnings: ['NC (Non-Commercial)：禁止商业使用！'],
    obligations: ['必须署名', '不得用于商业目的'],
    recommendations: ['学术研究可用，商业产品禁用']
  },
  'UNKNOWN': {
    isOpenSource: false,
    commercialUse: 'unknown',
    modifications: 'unknown',
    sublicensing: 'unknown',
    patentUse: 'unknown',
    copyleft: 'unknown',
    riskLevel: 'high',
    warnings: ['许可证未知，建议联系版权所有者确认'],
    obligations: [],
    recommendations: ['在上线前必须明确许可证']
  }
};

// ============================================================================
// License Detection from Component Metadata
// ============================================================================

export function detectLicense(licenseText: string): LicenseType {
  const text = licenseText.toUpperCase().replace(/[^A-Z0-9\-\.]/g, '');
  
  if (text.includes('MIT')) return 'MIT';
  if (text.includes('BSD-2') || text === 'BSD2') return 'BSD-2';
  if (text.includes('BSD-3') || text === 'BSD3') return 'BSD-3';
  if (text.includes('APACHE-2') || text.includes('Apache2')) return 'Apache-2.0';
  if (text.includes('GPL-3') || text.includes('GPL3') || text === 'GPL3') return 'GPL-3.0';
  if (text.includes('GPL-2') || text.includes('GPL2') || text === 'GPL2') return 'GPL-2.0';
  if (text.includes('LGPL-3') || text.includes('LGPL3')) return 'LGPL-3.0';
  if (text.includes('LGPL-2') || text.includes('LGPL2.1')) return 'LGPL-2.1';
  if (text.includes('AGPL')) return 'AGPL-3.0';
  if (text.includes('CC0') || text.includes('PUBLIC DOMAIN')) return 'CC0';
  if (text.includes('CC-BY-SA')) return 'CC-BY-SA';
  if (text.includes('CC-BY-NC')) return 'CC-BY-NC';
  if (text.includes('CC-BY')) return 'CC-BY';
  
  return 'UNKNOWN';
}

export function analyzeLicense(license: LicenseType): LicenseAnalysis {
  const base = LICENSE_DB[license];
  return {
    license,
    ...base
  };
}

// ============================================================================
// Patent Similarity Analysis (Mock Implementation)
// ============================================================================

export async function searchPatents(geneSequence: string): Promise<PatentInfo[]> {
  // In production, this would call PubChem/Google Patents API
  // For now, return mock data based on sequence length
  const length = geneSequence.length;
  
  if (length > 1000) {
    return [
      {
        patentNumber: 'US20230001234A1',
        title: 'Engineered binding protein with enhanced stability',
        applicants: ['BioTech Corp', 'University Research Lab'],
        filingDate: '2023-06-15',
        status: 'pending',
        claims: [
          'A single-chain variable fragment (scFv) comprising CDR-H3 loop of at least 15 amino acids',
          'The scFv of claim 1, wherein the framework region comprises human germline sequences',
          'A method for producing the scFv of claim 1, comprising expression in E. coli'
        ],
        relatedGenes: ['FLU-scFv-001'],
        scope: 'medium'
      }
    ];
  }
  
  return [];
}

// ============================================================================
// FTO (Freedom to Operate) Assessment
// ============================================================================

export interface FTOAssessment {
  geneName: string;
  status: 'clear' | 'potential_risk' | 'high_risk' | 'requires_licensing';
  confidence: number;
  blockingPatents: PatentInfo[];
  licenseRequirements: string[];
  recommendations: string[];
  estimatedLicensingCost?: 'low' | 'medium' | 'high';
}

export function assessFTO(
  geneName: string,
  license: LicenseType,
  patents: PatentInfo[]
): FTOAssessment {
  const analysis = analyzeLicense(license);
  const blockingPatents = patents.filter(p => p.status === 'active');
  
  let status: FTOAssessment['status'];
  let confidence: number;
  let recommendations: string[];
  
  if (analysis.riskLevel === 'low' && blockingPatents.length === 0) {
    status = 'clear';
    confidence = 0.9;
    recommendations = ['许可证和专利风险均较低，可继续推进'];
  } else if (analysis.copyleft === 'strong' || analysis.copyleft === 'strong_network') {
    status = 'high_risk';
    confidence = 0.85;
    recommendations = [
      '检测到强传染性许可证，建议替换为MIT/BSD组件',
      '如必须使用，需评估开源成本',
      '建议法务团队介入审查'
    ];
  } else if (blockingPatents.length > 0) {
    status = 'potential_risk';
    confidence = 0.7;
    recommendations = [
      `发现${blockingPatents.length}项相关专利`,
      '建议联系专利持有人获取许可',
      '评估是否可设计绕过方案'
    ];
  } else {
    status = 'potential_risk';
    confidence = 0.6;
    recommendations = [
      '许可证存在不确定性',
      '建议获取书面许可确认'
    ];
  }
  
  const licenseReqs: string[] = [];
  if (analysis.obligations.length > 0) {
    licenseReqs.push(...analysis.obligations);
  }
  
  let estCost: FTOAssessment['estimatedLicensingCost'] | undefined;
  if (status !== 'clear') {
    if (analysis.copyleft === 'strong' || analysis.copyleft === 'strong_network') {
      estCost = blockingPatents.length > 0 ? 'high' : 'medium';
    } else {
      estCost = blockingPatents.length > 0 ? 'medium' : 'low';
    }
  }
  
  return {
    geneName,
    status,
    confidence,
    blockingPatents,
    licenseRequirements: licenseReqs,
    recommendations,
    estimatedLicensingCost: estCost
  };
}

// ============================================================================
// Component License Summary
// ============================================================================

export interface ComponentLicenseSummary {
  componentId: string;
  componentName: string;
  detectedLicense: LicenseType;
  analysis: LicenseAnalysis;
  fto: FTOAssessment | null;
  overallRisk: 'low' | 'medium' | 'high';
  summary: string;
  actionRequired: string;
}

export function generateLicenseSummary(
  componentId: string,
  componentName: string,
  licenseText: string,
  patents: PatentInfo[] = []
): ComponentLicenseSummary {
  const license = detectLicense(licenseText);
  const analysis = analyzeLicense(license);
  const fto = assessFTO(componentName, license, patents);
  
  let overallRisk: 'low' | 'medium' | 'high' = 'low';
  if (fto.status === 'high_risk' || analysis.riskLevel === 'high') {
    overallRisk = 'high';
  } else if (fto.status === 'potential_risk' || analysis.riskLevel === 'medium') {
    overallRisk = 'medium';
  }
  
  let summary: string;
  let action: string;
  
  switch (overallRisk) {
    case 'low':
      summary = `许可证${analysis.isOpenSource ? '开源友好' : '有限制'}，${fto.blockingPatents.length === 0 ? '无专利冲突' : `发现${fto.blockingPatents.length}项专利需关注`}`;
      action = '可直接使用';
      break;
    case 'medium':
      summary = `存在许可证限制或专利风险，需要进一步评估`;
      action = '建议法务审查后再使用';
      break;
    case 'high':
      summary = `检测到高风险：${analysis.copyleft === 'strong' || analysis.copyleft === 'strong_network' ? '强传染性许可证' : ''} ${fto.blockingPatents.length > 0 ? `+ ${fto.blockingPatents.length}项阻塞专利` : ''}`;
      action = '必须获得许可或替换组件';
      break;
  }
  
  return {
    componentId,
    componentName,
    detectedLicense: license,
    analysis,
    fto,
    overallRisk,
    summary,
    actionRequired: action
  };
}

// ============================================================================
// Demo Data for UI
// ============================================================================

export const DEMO_PATENTS: PatentInfo[] = [
  {
    patentNumber: 'US11234567B2',
    title: 'Anti-influenza scFv antibodies and methods of use',
    applicants: ['Novartis AG', 'University of Zurich'],
    filingDate: '2019-03-15',
    status: 'active',
    claims: [
      'An isolated scFv fragment that specifically binds to HA protein of H5N1 influenza',
      'The scFv of claim 1, wherein KD < 10 nM',
      'A composition comprising the scFv of claim 1 and a pharmaceutical carrier'
    ],
    relatedGenes: ['FLU-scFv-001'],
    scope: 'broad',
    expirationDate: '2039-03-15'
  }
];

export const LICENSE_MATERIALS = {
  'FLU-scFv-001': {
    detectedLicense: 'Apache-2.0',
    source: 'Academic Institution License',
    restrictions: 'Non-commercial use only for academic research'
  },
  'FLU-NP-002': {
    detectedLicense: 'CC-BY-NC',
    source: 'Material Transfer Agreement (MTA)',
    restrictions: 'Cannot be used for commercial purposes without separate agreement'
  },
  'FLU-HA-003': {
    detectedLicense: 'MIT',
    source: 'Open Source',
    restrictions: 'None - free for all use'
  },
  'iGEM-2023-Lacto-001': {
    detectedLicense: 'BSD-3',
    source: 'iGEM Open Source Parts',
    restrictions: 'Attribution required, no endorsement'
  }
};
