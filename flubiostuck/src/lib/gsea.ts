/**
 * Gene Set Enrichment Analysis (GSEA)
 * Implements Subramanian et al. 2005 GSEA algorithm
 */

export interface GeneRanking {
  gene: string;
  rankMetric: number; // e.g., -log10(P) * sign(log2FC)
}

export interface GeneSet {
  name: string;
  source: 'KEGG' | 'Reactome' | 'GO-BP' | 'MSigDB';
  description?: string;
  genes: string[];
}

export interface GSEAInput {
  rankedGenes: GeneRanking[];
  geneSets: GeneSet[];
  permutations?: number;
  minSetSize?: number;
  maxSetSize?: number;
}

export interface GSEAEnrichmentScore {
  name: string;
  source: string;
  es: number;          // Enrichment Score
  nes: number;         // Normalized ES
  pValue: number;      // Nominal p-value
  fdr: number;         // False Discovery Rate (Benjamini-Hochberg)
  leadingEdge: string[];
  hits: number;
  setSize: number;
}

/**
 * Calculate GSEA Enrichment Score (ES)
 * Walks down the ranked list, incrementing when gene is in set
 * (weighted by rank metric), decrementing otherwise.
 */
export function calculateES(
  rankedGenes: GeneRanking[],
  geneSet: Set<string>,
  weightedKS: boolean = true
): { es: number; leadingEdge: string[] } {
  const N = rankedGenes.length;
  const Nh = rankedGenes.filter(r => geneSet.has(r.gene)).length;

  if (Nh === 0) return { es: 0, leadingEdge: [] };

  // Compute sum of |rank metric| for genes in set
  let sumRankHit = 0;
  for (const r of rankedGenes) {
    if (geneSet.has(r.gene)) {
      sumRankHit += weightedKS ? Math.abs(r.rankMetric) : 1;
    }
  }

  let runningSum = 0;
  let maxES = -Infinity;
  let minES = Infinity;
  let peakIndex = 0;
  let peakType: 'pos' | 'neg' = 'pos';
  const leadingEdge: string[] = [];

  for (let i = 0; i < N; i++) {
    const r = rankedGenes[i];
    const inSet = geneSet.has(r.gene);

    if (inSet) {
      const increment = weightedKS
        ? Math.abs(r.rankMetric) / sumRankHit
        : 1 / Nh;
      runningSum += increment;
      leadingEdge.push(r.gene);
      if (runningSum > maxES) {
        maxES = runningSum;
        peakIndex = i;
        peakType = 'pos';
      }
    } else {
      const decrement = 1 / (N - Nh);
      runningSum -= decrement;
      if (runningSum < minES) {
        minES = runningSum;
        peakType = 'neg';
      }
    }
  }

  // ES = max deviation from 0 (positive or negative)
  const es = Math.abs(maxES) > Math.abs(minES) ? maxES : minES;
  // Trim leading edge to peak position if positive ES
  const trimmedLeadingEdge = peakType === 'pos'
    ? leadingEdge.slice(0, peakIndex + 1)
    : leadingEdge.slice(peakIndex);

  return { es, leadingEdge: trimmedLeadingEdge };
}

/**
 * Compute GSEA with permutation testing
 */
export function runGSEA(input: GSEAInput): GSEAEnrichmentScore[] {
  const {
    rankedGenes,
    geneSets,
    permutations = 1000,
    minSetSize = 15,
    maxSetSize = 500
  } = input;

  const results: GSEAEnrichmentScore[] = [];

  for (const geneSet of geneSets) {
    const setSize = geneSet.genes.length;

    // Skip if set size out of range
    if (setSize < minSetSize || setSize > maxSetSize) continue;

    const setMembers = new Set(geneSet.genes);
    const hits = rankedGenes.filter(r => setMembers.has(r.gene));

    if (hits.length < minSetSize) continue;

    // Calculate observed ES
    const { es, leadingEdge } = calculateES(rankedGenes, setMembers);

    // Permutation testing
    const nullES: number[] = [];
    const permutedRanks = [...rankedGenes];

    for (let p = 0; p < permutations; p++) {
      // Fisher-Yates shuffle
      for (let i = permutedRanks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [permutedRanks[i], permutedRanks[j]] = [permutedRanks[j], permutedRanks[i]];
      }
      const permES = calculateES(permutedRanks, setMembers).es;
      nullES.push(permES);
    }

    // Normalize ES (NES)
    const sameSign = nullES.filter(e => Math.sign(e) === Math.sign(es));
    const meanPos = sameSign.length > 0
      ? sameSign.reduce((a, b) => a + b, 0) / sameSign.length
      : 0;
    const meanNeg = nullES.filter(e => Math.sign(e) !== Math.sign(es));
    const meanNegES = meanNeg.length > 0
      ? meanNeg.reduce((a, b) => a + b, 0) / meanNeg.length
      : 0;

    let meanNull: number;
    if (es >= 0) {
      const pos = nullES.filter(e => e >= 0);
      meanNull = pos.length > 0 ? pos.reduce((a, b) => a + b, 0) / pos.length : 1;
    } else {
      const neg = nullES.filter(e => e < 0);
      meanNull = neg.length > 0 ? neg.reduce((a, b) => a + b, 0) / neg.length : 1;
    }

    const nes = meanNull !== 0 ? es / Math.abs(meanNull) : es;

    // p-value (fraction of null ES >= observed ES in same direction)
    const numMoreExtreme = nullES.filter(e =>
      es >= 0 ? e >= es : e <= es
    ).length;
    const pValue = numMoreExtreme / permutations;

    results.push({
      name: geneSet.name,
      source: geneSet.source,
      es,
      nes,
      pValue,
      fdr: 1, // Will be calculated after BH correction
      leadingEdge,
      hits: hits.length,
      setSize
    });
  }

  // Benjamini-Hochberg FDR correction
  results.sort((a, b) => a.pValue - b.pValue);
  const m = results.length;
  for (let i = 0; i < m; i++) {
    const rank = i + 1;
    const fdr = results[i].pValue * m / rank;
    results[i].fdr = Math.min(fdr, 1);
  }
  // Enforce monotonicity (FDR is non-increasing with rank)
  for (let i = m - 2; i >= 0; i--) {
    results[i].fdr = Math.min(results[i].fdr, results[i + 1].fdr);
  }

  return results.sort((a, b) => a.pValue - b.pValue);
}

// ============================================================================
// Demo Data - Pre-built Gene Sets
// ============================================================================

export const MSIGDB_DEMO: GeneSet[] = [
  {
    name: 'HALLMARK_INFLAMMATORY_RESPONSE',
    source: 'MSigDB',
    description: 'Genes involved in inflammatory response',
    genes: ['TNF', 'IL6', 'IL1B', 'CXCL8', 'CCL2', 'NFKB1', 'RELA', 'TLR4', 'MYD88', 'TRAF6',
            'JAK1', 'JAK2', 'STAT1', 'STAT3', 'IRF1', 'IRF3', 'MAPK1', 'MAPK8', 'JUN', 'FOS']
  },
  {
    name: 'HALLMARK_INTERFERON_ALPHA_RESPONSE',
    source: 'MSigDB',
    description: 'Genes upregulated in response to IFN-alpha',
    genes: ['STAT1', 'STAT2', 'IRF1', 'IRF7', 'IRF9', 'MX1', 'OAS1', 'OAS2', 'OAS3', 'ISG15',
            'IFIT1', 'IFIT2', 'IFIT3', 'BST2', 'IFI44', 'IFI44L', 'RSAD2', 'DDX58', 'IFIH1']
  },
  {
    name: 'KEGG_INFLUENZA_A',
    source: 'KEGG',
    description: 'Influenza A viral infection pathway',
    genes: ['TLR3', 'TLR7', 'TLR8', 'RIGI', 'MDA5', 'MAVS', 'IRF3', 'IRF7', 'NFKB1', 'RELA',
            'JAK1', 'STAT1', 'MX1', 'OAS1', 'PKR', 'IFIT1', 'IFIT2', 'ISG15', 'BST2', 'IFITM3']
  },
  {
    name: 'GO_APOPTOSIS',
    source: 'GO-BP',
    description: 'Programmed cell death',
    genes: ['BAX', 'BAK1', 'BCL2', 'CASP3', 'CASP7', 'CASP9', 'CYCS', 'APAF1', 'BID', 'BIM',
            'PUMA', 'NOXA', 'BCLXL', 'MCL1', 'SURVIVIN', 'XIAP', 'SMAC', 'HTRA2', 'ENDOG', 'AIFM1']
  },
  {
    name: 'REACTOME_INTERFERON_SIGNALING',
    source: 'Reactome',
    description: 'Interferon signaling pathway',
    genes: ['IFNAR1', 'IFNAR2', 'JAK1', 'TYK2', 'STAT1', 'STAT2', 'IRF9', 'ISGF3', 'SOCS1', 'SOCS3',
            'USP18', 'IFI35', 'IFIT1', 'IFIT2', 'IFIT3', 'MX1', 'OAS1', 'OAS2', 'OAS3', 'ISG15']
  },
  {
    name: 'HALLMARK_OXIDATIVE_PHOSPHORYLATION',
    source: 'MSigDB',
    description: 'Genes encoding components of mitochondrial respiratory chain',
    genes: ['NDUFA1', 'NDUFA2', 'NDUFA3', 'NDUFA4', 'NDUFA5', 'NDUFA6', 'NDUFA7', 'NDUFA8', 'NDUFA9', 'NDUFA10',
            'SDHA', 'SDHB', 'SDHC', 'SDHD', 'UQCR1', 'UQCR2', 'COX5A', 'COX5B', 'ATP5A1', 'ATP5B']
  },
  {
    name: 'KEGG_JAK_STAT_SIGNALING',
    source: 'KEGG',
    description: 'JAK-STAT signaling pathway',
    genes: ['JAK1', 'JAK2', 'JAK3', 'TYK2', 'STAT1', 'STAT2', 'STAT3', 'STAT4', 'STAT5A', 'STAT5B',
            'STAT6', 'SOCS1', 'SOCS2', 'SOCS3', 'CISH', 'IRF1', 'IRF9', 'PIAS1', 'PIAS3', 'PTPN2']
  },
  {
    name: 'HALLMARK_P53_PATHWAY',
    source: 'MSigDB',
    description: 'p53-mediated response to DNA damage',
    genes: ['TP53', 'MDM2', 'MDM4', 'CDKN1A', 'CDKN2A', 'BAX', 'PUMA', 'NOXA', 'GADD45A', 'BBC3',
            'TP53I3', 'DDB2', 'XPC', 'RAD23B', 'GML', 'PERP', 'SFN', 'TNFRSF10B', 'FAS', 'TRAIL']
  }
];

// Demo ranked gene list (e.g., from differential expression analysis)
export const DEMO_RANKED_GENES: GeneRanking[] = [
  { gene: 'IFIT1', rankMetric: 8.42 },
  { gene: 'MX1', rankMetric: 7.89 },
  { gene: 'OAS1', rankMetric: 7.51 },
  { gene: 'ISG15', rankMetric: 7.23 },
  { gene: 'IFIT2', rankMetric: 6.92 },
  { gene: 'STAT1', rankMetric: 6.45 },
  { gene: 'TNF', rankMetric: 6.21 },
  { gene: 'OAS2', rankMetric: 6.05 },
  { gene: 'IFIT3', rankMetric: 5.89 },
  { gene: 'IRF7', rankMetric: 5.67 },
  { gene: 'CXCL8', rankMetric: 5.43 },
  { gene: 'BST2', rankMetric: 5.21 },
  { gene: 'IL6', rankMetric: 5.01 },
  { gene: 'IRF9', rankMetric: 4.89 },
  { gene: 'DDX58', rankMetric: 4.72 },
  { gene: 'IFI44', rankMetric: 4.56 },
  { gene: 'NFKB1', rankMetric: 4.41 },
  { gene: 'RSAD2', rankMetric: 4.32 },
  { gene: 'IL1B', rankMetric: 4.21 },
  { gene: 'TLR3', rankMetric: 4.12 },
  { gene: 'JAK1', rankMetric: 4.05 },
  { gene: 'SOCS1', rankMetric: 3.95 },
  { gene: 'OAS3', rankMetric: 3.88 },
  { gene: 'IRF1', rankMetric: 3.75 },
  { gene: 'TYK2', rankMetric: 3.62 },
  { gene: 'IFIH1', rankMetric: 3.51 },
  { gene: 'CCL2', rankMetric: 3.42 },
  { gene: 'RELA', rankMetric: 3.32 },
  { gene: 'IFNAR1', rankMetric: 3.21 },
  { gene: 'MYD88', rankMetric: 3.12 },
  { gene: 'TRAF6', rankMetric: 3.01 },
  { gene: 'IFITM3', rankMetric: 2.91 },
  { gene: 'TLR4', rankMetric: 2.81 },
  { gene: 'ISGF3', rankMetric: 2.71 },
  { gene: 'STAT2', rankMetric: 2.61 },
  { gene: 'PKR', rankMetric: 2.51 },
  { gene: 'IFNAR2', rankMetric: 2.41 },
  { gene: 'USP18', rankMetric: 2.31 },
  { gene: 'SOCS3', rankMetric: 2.21 },
  { gene: 'JAK2', rankMetric: 2.11 },
  { gene: 'IRF3', rankMetric: 2.01 },
  { gene: 'MAPK1', rankMetric: 1.91 },
  { gene: 'MAVS', rankMetric: 1.81 },
  { gene: 'FOS', rankMetric: 1.71 },
  { gene: 'JUN', rankMetric: 1.61 },
  { gene: 'RIGI', rankMetric: 1.51 },
  { gene: 'TLR7', rankMetric: 1.41 },
  { gene: 'TLR8', rankMetric: 1.31 },
  { gene: 'IFI35', rankMetric: 1.21 },
  { gene: 'TP53', rankMetric: -1.51 },
  { gene: 'MDM2', rankMetric: -1.61 },
  { gene: 'CDKN1A', rankMetric: -1.71 },
  { gene: 'BAX', rankMetric: -1.81 },
  { gene: 'BAK1', rankMetric: -1.91 },
  { gene: 'CASP3', rankMetric: -2.01 },
  { gene: 'BCL2', rankMetric: -2.11 },
  { gene: 'CASP9', rankMetric: -2.21 },
  { gene: 'CYCS', rankMetric: -2.31 },
  { gene: 'NDUFA1', rankMetric: -2.41 },
  { gene: 'NDUFA2', rankMetric: -2.51 },
  { gene: 'COX5A', rankMetric: -2.61 },
  { gene: 'ATP5A1', rankMetric: -2.71 }
];
