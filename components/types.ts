export type DemoDoc = {
  name: string;
  filename: string;
  cue: string;
  shift: string;
};

export type EvidenceObject = {
  id: string;
  claim: string;
  source: string;
  category: string;
  confidence: number;
};

export type BeliefObject = {
  id: string;
  belief: string;
  type: string;
  confidence: number;
  previousConfidence: number;
  delta: number;
  supportingEvidence: string[];
  assumptions: string[];
  externalDependencies: string[];
  contradictions: string[];
  whyItMatters: string;
};

export type Relationship = {
  from: string;
  to: string;
  type: string;
  strength: number;
  evidence: string[];
};

export type DecisionSupport = {
  nextStep: string;
  suggestedMeeting: string;
  meetingPurpose: string;
  questionsToAsk: string[];
  evidenceToBring: string[];
  exportTitle: string;
};

export type InsightFeedback = 'new' | 'confirmed' | 'known' | 'disagree' | null;

export type EngineReport = {
  companyName: string;
  sourceCount: number;
  evidenceObjects: EvidenceObject[];
  relationships: Relationship[];
  beliefs?: BeliefObject[];
  contradictions: { title: string; body: string; confidence: number }[];
  openQuestions: string[];
  nextBestEvidence: string[];
  understandingScore: number;
  delta: number;
  brief: string[];
  engineMode?: string;
  modelUsed?: string;
  decisionSupport?: DecisionSupport;
  organismState?: {
    maturity: number;
    nodeCount: number;
    edgeCount: number;
    lastMeaningfulChange: string;
    nodes: { id: string; label: string; confidence: number; zone: string; tension: boolean }[];
    edges: { from: string; to: string; strength: number; type: string }[];
  };
  raw?: unknown;
};