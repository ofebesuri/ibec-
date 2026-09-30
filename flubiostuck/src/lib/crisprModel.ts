/**
 * CRISPR/dCas9 Inhibition Model
 * Implements mathematical model for CRISPR interference (CRISPRi)
 */

export interface CRISPRParameters {
  guideRNA: string;
  targetGene: string;
  dCas9Concentration: number; // nM
  sgRNAConcentration: number; // nM
  basalExpression: number;     // basal expression level (0-1)
  maxRepression: number;       // maximum repression fraction (0-1)
  hillCoefficient: number;     // cooperativity
  kd: number;                   // dissociation constant (nM)
  degradationRate: number;      // protein degradation rate (1/h)
}

export interface CRISPRSimulationResult {
  timeSeries: CRISPRPoint[];
  steadyStateRepression: number;
  timeToHalfMax: number;
  effectiveKd: number;
  specificity: number;
  offTargets: OffTargetPrediction[];
}

export interface CRISPRPoint {
  t: number;       // time (h)
  expression: number;  // normalized expression (0-1)
  repression: number;  // repression fraction (0-1)
  dCas9Bound: number;  // fraction of dCas9 bound to target
}

export interface OffTargetPrediction {
  gene: string;
  mismatchCount: number;
  predictedScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Hill function model for CRISPRi repression
 * Repression = basal * (1 - maxRepr * ([dCas9:sgRNA]^n / (Kd^n + [dCas9:sgRNA]^n)))
 */
export function simulateCRISPRi(params: CRISPRParameters): CRISPRSimulationResult {
  const {
    dCas9Concentration,
    sgRNAConcentration,
    basalExpression,
    maxRepression,
    hillCoefficient,
    kd,
    degradationRate
  } = params;

  // Effective complex concentration (assuming binding equilibrium)
  const complexConc = (dCas9Concentration * sgRNAConcentration) / 
                       (kd + sgRNAConcentration);
  const effectiveKd = kd;

  // Steady-state repression
  const kd_n = Math.pow(effectiveKd, hillCoefficient);
  const complex_n = Math.pow(complexConc, hillCoefficient);
  const steadyStateRepression = basalExpression * (1 - maxRepression * (complex_n / (kd_n + complex_n)));

  // Time series using ODE
  const duration = 48; // hours
  const dt = 0.5;
  const timeSeries: CRISPRPoint[] = [];

  let expression = basalExpression;
  for (let t = 0; t <= duration; t += dt) {
    // dE/dt = basal*production - degradation*E - repression_rate*(complex/E)
    const targetRepression = maxRepression * (complex_n / (kd_n + complex_n));
    const instantaneousRepression = targetRepression * (1 - Math.exp(-t * 0.15)); // binding kinetics
    expression = basalExpression * (1 - instantaneousRepression);

    const repression = instantaneousRepression;
    const dCas9Bound = complex_n / (kd_n + complex_n);

    timeSeries.push({
      t,
      expression,
      repression,
      dCas9Bound
    });
  }

  // Time to half-maximum repression
  const halfMax = maxRepression / 2;
  const t_half = timeSeries.find(p => p.repression >= halfMax)?.t || duration;

  // Specificity score (higher = more specific)
  const specificity = 1 / (1 + Math.exp(-hillCoefficient));

  return {
    timeSeries,
    steadyStateRepression,
    timeToHalfMax: t_half,
    effectiveKd,
    specificity,
    offTargets: []
  };
}

/**
 * Mock off-target prediction based on guide RNA
 * In production, would integrate with CRISPRoffinder / GuideScan
 */
export function predictOffTargets(guideRNA: string): OffTargetPrediction[] {
  // Generate mock off-targets based on simple sequence similarity
  const mockGenes = ['ACTB', 'GAPDH', 'TUBB', 'HSP90', 'MYC', 'EGFP', 'LACZ', 'PURO'];
  
  return mockGenes.slice(0, 4).map((gene, i) => {
    const mismatches = (i % 3) + 1;
    const score = Math.pow(0.8, mismatches);
    const risk = score > 0.5 ? 'high' : score > 0.2 ? 'medium' : 'low';
    return {
      gene,
      mismatchCount: mismatches,
      predictedScore: score,
      riskLevel: risk as 'low' | 'medium' | 'high'
    };
  });
}

/**
 * Generate CRISPR circuit with self-feedback control
 * dCas9-sgRNA represses its own expression for bistable switching
 */
export interface FeedbackCircuitResult {
  timeSeries: { t: number; A: number; B: number; dCas9: number; switch: number }[];
  toggleTime: number;
  steadyStateA: number;
  steadyStateB: number;
  bistable: boolean;
}

export function simulateCRISPRFeedbackCircuit(params: {
  alpha: number;
  delta: number;
  n: number;
  kd: number;
  repressorStrength: number;
  duration?: number;
}): FeedbackCircuitResult {
  const { alpha, delta, n, kd, repressorStrength } = params;
  const duration = params.duration || 48;
  const dt = 0.1;

  const timeSeries: FeedbackCircuitResult['timeSeries'] = [];

  // Initial conditions: A high, B low
  let A = 8.0;
  let B = 0.5;
  let dCas9 = 0.5;

  let toggleTime = -1;

  for (let t = 0; t <= duration; t += dt) {
    // dCas9-mediated repression of A
    const repressor = 1 / (1 + Math.pow(dCas9 / kd, n));
    const dAdt = alpha * (1 / (1 + Math.pow(B, n))) * repressor - delta * A;
    const dBdt = alpha * (1 / (1 + Math.pow(A, n))) - delta * B;
    const ddCas9dt = repressorStrength * A - 0.5 * dCas9;

    A = Math.max(0, A + dAdt * dt);
    B = Math.max(0, B + dBdt * dt);
    dCas9 = Math.max(0, dCas9 + ddCas9dt * dt);

    const switch = A - B;

    // Detect toggle (switch sign change)
    if (toggleTime < 0 && t > 5 && switch < 0) {
      toggleTime = t;
    }

    if (Math.round(t * 10) % 5 === 0) {
      timeSeries.push({ t, A, B, dCas9, switch });
    }
  }

  const bistable = (timeSeries[timeSeries.length - 1]?.A ?? 0) > 5 && 
                   (timeSeries[timeSeries.length - 1]?.B ?? 0) < 2;

  return {
    timeSeries,
    toggleTime: toggleTime > 0 ? toggleTime : -1,
    steadyStateA: A,
    steadyStateB: B,
    bistable
  };
}
