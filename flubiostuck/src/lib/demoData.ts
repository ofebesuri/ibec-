// ============================================================================
// Demo Data - 演示数据
// TODO: 替换为真实 API 调用
// 当前阶段所有数据均为占位演示数据，便于前端开发和后续替换
// ============================================================================

export interface Component {
  id: string;
  name: string;
  subtype: string;
  strain: string;
  ipNumber: string;
  ipStatus: 'protected' | 'free' | 'pending' | 'restricted';
  riskLevel: 'low' | 'medium' | 'high';
  sequence: string;
  sequenceType: 'DNA' | 'Protein' | 'scFv';
  description: string;
  pdbId?: string;
  molecularWeight?: number;
  pi?: number;
  gcContent?: number;
  neutralizationData: NeutralizationPoint[];
  dbtlSteps: DBTLStep[];
  references: Reference[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  owner: string;
  community: boolean;
  // Phase 1 Gold Award Enhancement Fields
  biosafetyLevel?: 'BSL-1' | 'BSL-2' | 'BSL-3' | 'BSL-4';
  license?: string;
  dualUse?: boolean;
  dualUseType?: string;
  ispVerified?: boolean;
  measuredIC50Data?: MeasuredIC50Point[];
}

export interface NeutralizationPoint {
  concentration: number;
  inhibition: number;
  stdDev?: number;
}

export interface MeasuredIC50Point {
  mutation: string;
  ic50: number;
  unit: string;
  method: string;
  date: string;
  lab: string;
  notes?: string;
}

export interface DBTLStep {
  phase: 'Design' | 'Build' | 'Test' | 'Learn';
  date: string;
  description: string;
  result?: string;
  status: 'completed' | 'in_progress' | 'planned';
}

export interface Reference {
  doi: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
}

export interface AnalysisResult {
  id: string;
  type: 'multiomics' | 'scfv_screening' | 'circuit_simulation' | 'epidemic_prediction';
  name: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  results: any;
}

export interface BenchmarkResult {
  algorithm: string;
  accuracy: number;
  runtime: number;
  memory: number;
  f1Score: number;
  dataset: string;
}

export interface CommunityDataset {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  downloads: number;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

// ============================================================================
// 元件库演示数据
// ============================================================================

export const DEMO_COMPONENTS: Component[] = [
  {
    id: 'FLU-scFv-001',
    name: 'Anti-H5N1 High-Affinity scFv',
    subtype: 'H5N1',
    strain: 'A/Vietnam/1203/2004',
    ipNumber: 'CN202310123456.7',
    ipStatus: 'protected',
    riskLevel: 'low',
    sequence: 'ATGGCCGTCAGCCTGGTGCAGTCTGGCGCCGAAGTGAAGAAACCTGGCGCCAGCGTGAAGGTGAGCTGCAAGGCCAGCGGCTACACCTTCACCGACTACAGCATGCACTGGGTGCGCCAGGCCCCCGGCCAGAAGCTGGAATGGATGGGCGCCATCAACCCCAACAACGGCGGCACCACCTACAACGAGAAGTTCAAGAGCAGAGCCACCCTGACCGTGGACAAGACCAGCAGCACCGCCTACATGGAACTGAGCAGCCTGACCAGCGAGGACAGCGCCGTGTACTACTGCGCCAGAGAGGACTGGGGCCAGGGCACCACCGTGACCGTGAGCAGCGCCAGCACCAAGGGCCCCAGCGTGTTCCCCCTGGCCCCCAGCAGCAAGAGCACCAGCGGCGGCACCGCCGCCCTGGGCTGCCTGGTGAAGGACTACTTCCCCGAACCGGTGACCGTGTCCTGGAACAGCGGAGCCCTGACCTCCGGCGTGCACACCTTCCCCGCCGTGCTGCAGAGCAGCGGCCTGTACTCCCTGAGCAGCGTGGTGACCGTGCCCAGCAGCAGCCTGGGCACCCAGACCTACATCTGCAACGTGAACCACAAGCCCAGCAACACCAAGGTGGACAAGAAAGTGGAGCCCAAGAGCTGCGACAAGACCCACACCTGCCCCCCCTGCCCTGCCCCCGAGCTGCTGGGCGGCCCCAGCGTGTTCCTGTTCCCCCCCAAGCCCAAGGACACCCTGATGATCAGCAGAACCCCCGAGGTGACCTGCGTGGTGGTGGACGTGAGCCACGAGGACCCCGAGGTGAAGTTCAACTGGTACGTGGACGGCGTGGAGGTGCACAACGCCAAGACCAAGCCCAGAGAGGAACAGTACAACAGCACCTACAGGGTGGTGAGCGTGCTGACCGTGCTGCACCAGGACTGGCTGAACGGCAAGGAATACAAGTGCAAGGTGAGCAACAAGGCCCTGCCCGCCCCCATCGAGAAGACCATCAGCAAGGCCAAGGGCCAGCCCAGAGAGCCCCAGGTGTACACCCTGCCCCCCAGCAGAGATGAGCTGACCAAGAACCAGGTGAGCCTGACCTGCCTGGTGAAGGGCTTCTACCCCAGCGACATCGCCGTGGAGTGGGAGAGCAACGGCCAGCCCGAGAACAACTACAAGACCACCCCCCCCGTGCTGGACAGCGACGGCAGCTTCTTCCTGTACAGCAAGCTGACCGTGGACAAGAGCAGATGGCAGCAGGGCAACGTGTTCAGCTGCAGCGTGATGCACGAGGCCCTGCACAACCACTACACCCAGAAGAGCCTGAGCCTGTCCCCCGGCAAG',
    sequenceType: 'scFv',
    description: '针对H5N1禽流感病毒的高亲和力单链可变区片段(scFv)，通过噬菌体展示技术筛选获得，KD = 2.3 nM',
    pdbId: '8ABC',
    molecularWeight: 27500,
    pi: 8.7,
    gcContent: 51.2,
    // Gold Award Enhancement
    biosafetyLevel: 'BSL-1',
    license: 'Apache-2.0',
    dualUse: false,
    ispVerified: true,
    measuredIC50Data: [
      { mutation: 'WT', ic50: 2.3, unit: 'nM', method: 'Surface Plasmon Resonance', date: '2023-08-20', lab: 'FluBioStack Lab' },
      { mutation: 'S31R', ic50: 1.1, unit: 'nM', method: 'SPR', date: '2023-09-15', lab: 'FluBioStack Lab', notes: 'Improved affinity' },
      { mutation: 'Y52H', ic50: 1.8, unit: 'nM', method: 'ELISA', date: '2023-09-15', lab: 'FluBioStack Lab' },
      { mutation: 'K96Q', ic50: 0.95, unit: 'nM', method: 'SPR', date: '2023-09-20', lab: 'Partner Lab', notes: 'Best candidate' },
      { mutation: 'L147F', ic50: 2.1, unit: 'nM', method: 'ELISA', date: '2023-09-15', lab: 'FluBioStack Lab' }
    ],
    neutralizationData: [
      { concentration: 0.01, inhibition: 8, stdDev: 2.1 },
      { concentration: 0.1, inhibition: 22, stdDev: 3.4 },
      { concentration: 1.0, inhibition: 48, stdDev: 4.2 },
      { concentration: 10.0, inhibition: 78, stdDev: 5.6 },
      { concentration: 100.0, inhibition: 92, stdDev: 3.8 }
    ],
    dbtlSteps: [
      { phase: 'Design', date: '2023-06-01', description: '基于已发表的H5N1 HA蛋白晶体结构(PDB: 2IBX)进行scFv骨架设计', status: 'completed' },
      { phase: 'Build', date: '2023-07-15', description: '克隆至pET-22b载体，转化BL21(DE3)大肠杆菌', status: 'completed' },
      { phase: 'Test', date: '2023-08-20', description: 'ELISA验证结合活性，IC50 = 2.3 nM', result: 'KD = 2.3 nM', status: 'completed' },
      { phase: 'Learn', date: '2023-09-10', description: '热稳定性分析Tm = 68.5°C，启动第二轮突变优化', status: 'completed' }
    ],
    references: [
      { doi: '10.1038/nature12345', title: 'Structural basis for broad H5N1 neutralization', authors: ['Smith J', 'Liu X', 'Wang Y'], journal: 'Nature', year: 2023 },
      { doi: '10.1126/science.abcd5678', title: 'Phage display engineering of influenza scFvs', authors: ['Chen L', 'Park S'], journal: 'Science', year: 2022 }
    ],
    tags: ['scFv', 'H5N1', '高亲和力', '已保护', '学术可用', '湿实验验证'],
    createdAt: '2023-06-01',
    updatedAt: '2023-09-15',
    owner: 'FluBioStack Lab',
    community: false
  },
  {
    id: 'FLU-NP-002',
    name: 'Universal Influenza B Nucleoprotein',
    subtype: 'Influenza B',
    strain: 'B/Yamagata/16/1988',
    ipNumber: 'CN202410234567.8',
    ipStatus: 'pending',
    riskLevel: 'medium',
    sequence: 'ATGGCCAGCCTGAGAGCCCTGATCCTGCTGCTGCTGCTGGGCCTGCTGCCCACCGGCAGCAGCCACAGAGCCAGCAGCGGCAGCGTGAGCAGCAGCAGAGCCAGCGGCAGCAGAGAGAGAGCCAGAGCAGCAGAGAGAGAGAGAGAGCAGCAGAGAGAGAGCAGCAGCAG',
    sequenceType: 'Protein',
    description: '流感B病毒通用核蛋白，可作为广谱疫苗靶点',
    molecularWeight: 56200,
    pi: 9.4,
    gcContent: 48.7,
    // Gold Award Enhancement
    biosafetyLevel: 'BSL-2',
    license: 'CC-BY-NC',
    dualUse: false,
    ispVerified: false,
    neutralizationData: [
      { concentration: 0.1, inhibition: 5, stdDev: 1.2 },
      { concentration: 1.0, inhibition: 18, stdDev: 2.8 },
      { concentration: 10.0, inhibition: 42, stdDev: 4.5 },
      { concentration: 100.0, inhibition: 65, stdDev: 5.2 }
    ],
    dbtlSteps: [
      { phase: 'Design', date: '2024-01-10', description: '基于B/Yamagata序列设计优化密码子', status: 'completed' },
      { phase: 'Build', date: '2024-02-20', description: 'Gibson组装至pcDNA3.1', status: 'completed' },
      { phase: 'Test', date: '2024-03-15', description: 'Western blot验证表达', status: 'in_progress' },
      { phase: 'Learn', date: '2024-04-01', description: '等待结果', status: 'planned' }
    ],
    references: [
      { doi: '10.1016/j.cell.2024.01.001', title: 'Universal flu B vaccine target', authors: ['Wang H', 'Lee K'], journal: 'Cell', year: 2024 }
    ],
    tags: ['核蛋白', '流感B', '广谱', '审核中'],
    createdAt: '2024-01-10',
    updatedAt: '2024-03-20',
    owner: 'FluBioStack Lab',
    community: false
  },
  {
    id: 'FLU-HA-003',
    name: 'H7N9 Engineered Hemagglutinin',
    subtype: 'H7N9',
    strain: 'A/Shanghai/02/2013',
    ipNumber: 'CN202456789012.3',
    ipStatus: 'free',
    riskLevel: 'low',
    sequence: 'ATGAACACTCAAATCCTGGTATTCGCTCTGATTCTCGTCAGCCTGCTGGCCAGCATATGCAGCACATCAGGGGCAACATCAGACTGAGCAGACTGACACAACAACGGAACCAACACCAAATGCCGGCAGAGAGAGGAGGAATGAATGAATTCCTCAGAGAGAGAGAGAG',
    sequenceType: 'Protein',
    description: '工程化改造的H7N9血凝素蛋白，提高稳定性',
    pdbId: '4NCL',
    molecularWeight: 62800,
    pi: 6.8,
    gcContent: 45.3,
    // Gold Award Enhancement
    biosafetyLevel: 'BSL-2',
    license: 'MIT',
    dualUse: false,
    ispVerified: true,
    neutralizationData: [
      { concentration: 0.1, inhibition: 12 },
      { concentration: 1.0, inhibition: 35 },
      { concentration: 10.0, inhibition: 68 },
      { concentration: 100.0, inhibition: 85 }
    ],
    dbtlSteps: [
      { phase: 'Design', date: '2024-02-15', description: '通过Rosetta设计引入稳定性突变', status: 'completed' },
      { phase: 'Build', date: '2024-03-25', description: '昆虫细胞表达系统', status: 'completed' },
      { phase: 'Test', date: '2024-04-30', description: '血凝抑制实验', status: 'completed' },
      { phase: 'Learn', date: '2024-05-20', description: 'Tm提高12°C，发布', status: 'completed' }
    ],
    references: [
      { doi: '10.1038/s41586-024-07123-x', title: 'Engineered H7N9 HA with enhanced stability', authors: ['Zhang Y', 'Liu P', 'Chen Z'], journal: 'Nature', year: 2024 }
    ],
    tags: ['HA', 'H7N9', '工程化', '免费使用'],
    createdAt: '2024-02-15',
    updatedAt: '2024-05-25',
    owner: 'FluBioStack Lab',
    community: false
  },
  {
    id: 'iGEM-2023-Lacto-001',
    name: 'iGEM 2023 Engineered Probiotic',
    subtype: 'Probiotic',
    strain: 'Lactobacillus plantarum',
    ipNumber: 'OPEN-SOURCE',
    ipStatus: 'free',
    riskLevel: 'low',
    sequence: 'ATGGCCAAGCTGATCGTGCTGCTGCTGTTCGGCTTCAGCCTGAGCAGCAGCAGCCCGAGCAGCAGCAGCAGCGGCAGCAGCGGCAGCAGCAGCAGCAGCAG',
    sequenceType: 'DNA',
    description: 'iGEM 2023参赛队伍开源益生菌元件，用于鼻黏膜免疫调控',
    molecularWeight: 15200,
    pi: 7.2,
    gcContent: 49.8,
    // Gold Award Enhancement
    biosafetyLevel: 'BSL-1',
    license: 'BSD-3',
    dualUse: false,
    ispVerified: true,
    neutralizationData: [],
    dbtlSteps: [
      { phase: 'Design', date: '2023-08-01', description: 'iGEM队伍设计的双组分信号通路', status: 'completed' },
      { phase: 'Build', date: '2023-09-15', description: 'Golden Gate组装', status: 'completed' },
      { phase: 'Test', date: '2023-10-20', description: '小鼠模型验证', status: 'completed' },
      { phase: 'Learn', date: '2023-11-30', description: '开源发布', status: 'completed' }
    ],
    references: [
      { doi: '10.1515/iGEM-2023-team-xyz', title: 'Engineering Lactobacillus for mucosal immunity', authors: ['Team XYZ'], journal: 'iGEM Proceedings', year: 2023 }
    ],
    tags: ['益生菌', 'iGEM', '开源', '社区贡献'],
    createdAt: '2023-08-01',
    updatedAt: '2023-11-30',
    owner: 'iGEM Team XYZ',
    community: true
  },
  {
    id: 'DUR-DEMO-001',
    name: 'Enhanced Pathogenicity Vector (Educational Example)',
    subtype: 'Pathogen',
    strain: 'Modified Vaccinia Ankara',
    ipNumber: 'RESTRICTED',
    ipStatus: 'restricted',
    riskLevel: 'high',
    sequence: 'ATGGCCGCCACCATGGCGCTGCTGCTGCTGCTGCTGCTGCTGGCCGCCGCCGCCGCAGCCGCCGCCGCCGCCGCCGCCGCCGCAGCCGCCGCCGCC',
    sequenceType: 'DNA',
    description: '教育示例 - 用于演示双用途研究警示系统的元件',
    molecularWeight: 18500,
    pi: 8.2,
    gcContent: 52.1,
    biosafetyLevel: 'BSL-3',
    license: 'RESTRICTED',
    dualUse: true,
    dualUseType: 'ENHANCED_PATHOGEN',
    ispVerified: false,
    neutralizationData: [],
    dbtlSteps: [
      { phase: 'Design', date: '2024-01-01', description: '教育演示用例', status: 'completed' },
      { phase: 'Build', date: '2024-01-15', description: '未实际构建', status: 'completed' },
      { phase: 'Test', date: '2024-02-01', description: '仅用于风险评估演示', status: 'completed' },
      { phase: 'Learn', date: '2024-02-15', description: '触发 DURC 警告', status: 'completed' }
    ],
    references: [
      { doi: '10.1038/s41467-024-DEMO', title: 'Ethics in Synthetic Biology', authors: ['FluBioStack Lab'], journal: 'Nature Communications', year: 2024 }
    ],
    tags: ['DURC', 'BSL-3', '限制使用', '教育示例', '双用途警告'],
    createdAt: '2024-01-01',
    updatedAt: '2024-02-15',
    owner: 'FluBioStack Lab',
    community: false
  }
];

// ============================================================================
// 分析结果演示数据
// ============================================================================

export const DEMO_ANALYSIS_RESULTS: AnalysisResult[] = [
  {
    id: 'ANL-001',
    type: 'multiomics',
    name: '小鼠多组学整合分析 - 工程菌免疫调控',
    status: 'completed',
    progress: 100,
    startedAt: '2024-05-01T10:30:00Z',
    completedAt: '2024-05-01T10:34:25Z',
    duration: 265,
    results: {
      pathways: [
        { name: 'NF-κB信号通路', score: 0.92, genes: ['TLR4', 'MYD88', 'NFKB1', 'RELA'] },
        { name: 'JAK-STAT通路', score: 0.87, genes: ['JAK1', 'STAT1', 'STAT3', 'IRF1'] },
        { name: 'Toll样受体通路', score: 0.84, genes: ['TLR2', 'TLR4', 'TLR9', 'TRAF6'] },
        { name: '细胞因子-细胞因子受体相互作用', score: 0.79, genes: ['IL6', 'TNF', 'IL1B', 'CXCL8'] }
      ],
      networkNodes: 156,
      networkEdges: 423,
      heatmapSize: { rows: 42, cols: 38 }
    }
  },
  {
    id: 'ANL-002',
    type: 'scfv_screening',
    name: 'scFv突变体稳定性筛选',
    status: 'completed',
    progress: 100,
    startedAt: '2024-05-05T14:20:00Z',
    completedAt: '2024-05-05T14:23:18Z',
    duration: 198,
    results: {
      totalCandidates: 1247,
      topCandidates: [
        { id: 'MUT-001', mutation: 'S31R', score: 0.94, stability: '+12.3°C', affinity: '+2.1x' },
        { id: 'MUT-002', mutation: 'Y52H', score: 0.91, stability: '+9.8°C', affinity: '+1.8x' },
        { id: 'MUT-003', mutation: 'K96Q', score: 0.89, stability: '+11.2°C', affinity: '+2.4x' },
        { id: 'MUT-004', mutation: 'L147F', score: 0.86, stability: '+8.5°C', affinity: '+1.6x' },
        { id: 'MUT-005', mutation: 'D213N', score: 0.84, stability: '+10.7°C', affinity: '+2.0x' }
      ]
    }
  },
  {
    id: 'ANL-003',
    type: 'circuit_simulation',
    name: '双自杀开关动力学仿真',
    status: 'completed',
    progress: 100,
    startedAt: '2024-05-08T09:15:00Z',
    completedAt: '2024-05-08T09:17:42Z',
    duration: 162,
    results: {
      simulationHours: 48,
      timePoints: 480,
      toggleTime: 6.2,
      leakRate: 0.003,
      stabilityIndex: 0.96
    }
  },
  {
    id: 'ANL-004',
    type: 'epidemic_prediction',
    name: 'H5N1禽流感流行趋势预测',
    status: 'completed',
    progress: 100,
    startedAt: '2024-05-10T16:00:00Z',
    completedAt: '2024-05-10T16:01:55Z',
    duration: 115,
    results: {
      forecastHorizon: 12, // weeks
      predictedCases: [1240, 1380, 1520, 1690, 1850, 2100, 2380, 2650, 2890, 3120, 3300, 3420],
      peakWeek: 11,
      riskLevel: 'moderate',
      regions: ['华东', '华南', '华中']
    }
  }
];

// ============================================================================
// FluBench 基准测试演示数据
// ============================================================================

export const DEMO_BENCHMARKS: BenchmarkResult[] = [
  { algorithm: 'FluBioStack-AI', accuracy: 94.2, runtime: 12.3, memory: 256, f1Score: 0.93, dataset: 'H5N1-2023' },
  { algorithm: 'Baseline-v2', accuracy: 87.5, runtime: 18.7, memory: 384, f1Score: 0.86, dataset: 'H5N1-2023' },
  { algorithm: 'DeepSeq-3', accuracy: 91.3, runtime: 24.5, memory: 512, f1Score: 0.90, dataset: 'H5N1-2023' },
  { algorithm: 'BioBERT-Large', accuracy: 88.9, runtime: 32.1, memory: 768, f1Score: 0.88, dataset: 'H5N1-2023' },
  { algorithm: 'ESM-2 (650M)', accuracy: 89.7, runtime: 45.2, memory: 1024, f1Score: 0.89, dataset: 'H5N1-2023' }
];

// ============================================================================
// 社区数据集演示数据
// ============================================================================

export const DEMO_COMMUNITY_DATASETS: CommunityDataset[] = [
  {
    id: 'DS-001',
    title: 'iGEM 2023 全球参赛队伍元件汇总',
    description: '包含2023年全球iGEM参赛队伍开源贡献的350+益生菌/工程菌元件序列',
    category: 'iGEM',
    size: '125 MB',
    downloads: 1834,
    uploadedBy: 'iGEM HQ',
    uploadedAt: '2023-12-01',
    tags: ['iGEM', '益生菌', '开源', '社区贡献']
  },
  {
    id: 'DS-002',
    title: 'H5N1临床分离株基因组数据集',
    description: '2018-2024年全球H5N1临床分离株基因组数据，含元信息',
    category: '基因组',
    size: '2.3 GB',
    downloads: 562,
    uploadedBy: 'WHO Reference Lab',
    uploadedAt: '2024-01-15',
    tags: ['H5N1', '基因组', '临床', 'WHO']
  },
  {
    id: 'DS-003',
    title: '工程菌代谢通路实验数据',
    description: '125株工程菌在24种碳源下的代谢通量数据',
    category: '代谢组',
    size: '890 MB',
    downloads: 421,
    uploadedBy: 'FluBioStack Lab',
    uploadedAt: '2024-02-28',
    tags: ['代谢组', '通量分析', '工程菌']
  }
];

// ============================================================================
// 教学视频演示数据
// ============================================================================

export const DEMO_TUTORIALS = [
  {
    id: 'TUT-001',
    title: 'FluBioStack平台快速入门',
    duration: '15:32',
    level: 'beginner',
    views: 3452,
    thumbnail: '/images/tutorial-1.jpg'
  },
  {
    id: 'TUT-002',
    title: '数据库检索与元件查询',
    duration: '12:18',
    level: 'beginner',
    views: 2103,
    thumbnail: '/images/tutorial-2.jpg'
  },
  {
    id: 'TUT-003',
    title: '多组学分析实战演练',
    duration: '28:45',
    level: 'intermediate',
    views: 1567,
    thumbnail: '/images/tutorial-3.jpg'
  },
  {
    id: 'TUT-004',
    title: 'IP保护与专利风险评估',
    duration: '18:24',
    level: 'advanced',
    views: 892,
    thumbnail: '/images/tutorial-4.jpg'
  }
];

// ============================================================================
// LLM 智能体演示数据
// ============================================================================

export const DEMO_LLM_EXAMPLES = [
  {
    query: '筛选针对H5N1的高稳定scFv突变序列',
    response: '正在调取数据库并运行筛选工具...',
    agent: 'scFv-Screening Agent',
    tools: ['search_database', 'run_scfv_screen', 'fetch_pdb_structure']
  },
  {
    query: '导入这组小鼠多组学数据，挖掘工程菌调控鼻黏膜免疫通路',
    response: '正在启动TriOmeFlow流程...',
    agent: 'MultiOmics Agent',
    tools: ['upload_data', 'run_triomeflow', 'visualize_network']
  },
  {
    query: '查询双自杀开关元件知识产权是否可免费用于学术研究',
    response: '正在调取IP数据库...',
    agent: 'IP-Protection Agent',
    tools: ['search_ip_database', 'generate_risk_report']
  }
];
