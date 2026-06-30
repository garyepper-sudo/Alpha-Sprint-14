import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type SourceDoc = { id: string; name: string; text: string; wordCount: number };
type EvidenceObject = {
  id: string;
  claim: string;
  source: string;
  category: string;
  confidence: number;
  weight: number;
  topics: string[];
  quote: string;
};
type Entity = { name: string; type: string; mentions: number; salience: number };
type Relationship = { id: string; from: string; to: string; type: string; strength: number; evidence: string[]; explanation: string };
type BeliefObject = {
  id: string;
  belief: string;
  type: 'current_belief' | 'strengthening_belief' | 'competing_explanation' | 'open_question';
  confidence: number;
  previousConfidence: number;
  delta: number;
  supportingEvidence: string[];
  assumptions: string[];
  externalDependencies: string[];
  contradictions: string[];
  whyItMatters: string;
};
type Insight = {
  type: string;
  title: string;
  body: string;
  confidence: number;
  beliefId?: string;
  why: string;
  sources: number;
  tags: string[];
};

type Topic = {
  id: string;
  label: string;
  category: string;
  keywords: string[];
  belief: string;
  assumptions: string[];
  externalDependencies: string[];
  whyItMatters: string;
};

const topics: Topic[] = [
  {
    id: 'ai-infrastructure',
    label: 'AI Infrastructure',
    category: 'Strategy',
    keywords: ['ai infrastructure', 'accelerated computing', 'data center', 'data centre', 'ai demand', 'gpu', 'blackwell', 'h100', 'h200', 'compute', 'ai factory', 'ai factories'],
    belief: 'The company is increasingly behaving like an AI infrastructure platform, not just a product-cycle semiconductor supplier.',
    assumptions: ['Customers continue building AI capacity', 'AI workloads require specialized infrastructure', 'Demand is not purely pull-forward from a short-term cycle'],
    externalDependencies: ['Hyperscaler capex', 'Power and data-center capacity', 'Enterprise AI adoption', 'Semiconductor supply'],
    whyItMatters: 'This determines whether growth should be evaluated as a durable infrastructure buildout or a shorter product-cycle demand spike.'
  },
  {
    id: 'platform-strategy',
    label: 'Platform Strategy',
    category: 'Strategy',
    keywords: ['platform', 'full-stack', 'full stack', 'ecosystem', 'developer', 'cuda', 'software stack', 'systems', 'reference architecture', 'end-to-end'],
    belief: 'The strongest strategic explanation is a platform architecture that links compute, networking, software, and ecosystem adoption.',
    assumptions: ['Customers value integrated systems over isolated components', 'Developer adoption creates durable switching costs', 'Software strengthens hardware demand'],
    externalDependencies: ['Competing platform ecosystems', 'Developer adoption', 'Enterprise deployment velocity'],
    whyItMatters: 'A platform thesis implies durability and compounding advantages beyond a single hardware cycle.'
  },
  {
    id: 'networking',
    label: 'Networking',
    category: 'Operations',
    keywords: ['networking', 'infiniband', 'ethernet', 'nvlink', 'spectrum-x', 'switching', 'connectx', 'network'],
    belief: 'Networking appears increasingly central to scaling AI systems.',
    assumptions: ['AI clusters require high-performance interconnects', 'Networking constraints influence deployment speed', 'Networking is integrated into the broader infrastructure sale'],
    externalDependencies: ['Cluster architecture choices', 'Cloud provider purchasing cycles', 'Competitive networking alternatives'],
    whyItMatters: 'If networking is structurally tied to AI infrastructure, the company may capture more of the system-level value chain.'
  },
  {
    id: 'inference',
    label: 'Inference',
    category: 'Customer',
    keywords: ['inference', 'serving', 'deployment', 'production ai', 'tokens', 'ai workloads', 'utilization'],
    belief: 'Inference and production deployment are becoming important demand vectors.',
    assumptions: ['AI applications move from experimentation to production', 'Inference economics support continued infrastructure purchases', 'Utilization remains high enough to justify buildout'],
    externalDependencies: ['Enterprise AI usage', 'Model efficiency improvements', 'Customer utilization economics'],
    whyItMatters: 'Inference demand can make infrastructure spending more recurring and operationally embedded.'
  },
  {
    id: 'hyperscaler-capex',
    label: 'Hyperscaler Capex',
    category: 'Risk',
    keywords: ['hyperscaler', 'cloud provider', 'capex', 'capital expenditure', 'customer concentration', 'cloud spending', 'microsoft', 'amazon', 'google', 'meta'],
    belief: 'The thesis remains sensitive to external infrastructure spending by large cloud customers.',
    assumptions: ['Large customers continue infrastructure investment', 'Purchasing remains concentrated but durable', 'Customer budgets do not reset materially lower'],
    externalDependencies: ['Cloud capex cycles', 'Interest rates', 'AI monetization by hyperscalers', 'Customer concentration'],
    whyItMatters: 'A strong platform thesis may still depend on external capital-allocation decisions outside the company’s control.'
  },
  {
    id: 'supply-policy-risk',
    label: 'Supply & Policy Risk',
    category: 'Risk',
    keywords: ['supply', 'constraint', 'capacity', 'export control', 'china', 'geopolitical', 'regulation', 'tariff', 'risk factor', 'shortage'],
    belief: 'Execution certainty is constrained by supply, policy, and geopolitical dependencies.',
    assumptions: ['Supply remains a limiting factor', 'Policy can affect regional demand and product availability', 'Risk exposure is material enough to affect confidence'],
    externalDependencies: ['Export controls', 'Taiwan semiconductor supply chain', 'US-China policy', 'Manufacturing capacity'],
    whyItMatters: 'External constraints can weaken otherwise coherent strategic beliefs.'
  },
  {
    id: 'partners-distribution',
    label: 'Partners & Distribution',
    category: 'Strategy',
    keywords: ['partner', 'partnership', 'oem', 'cloud', 'enterprise partner', 'distribution', 'channel', 'alliance'],
    belief: 'Partners appear to function as distribution infrastructure for the broader platform.',
    assumptions: ['Partners accelerate adoption', 'Channel relationships reinforce platform reach', 'Ecosystem activity reflects durable demand'],
    externalDependencies: ['Partner execution', 'Cloud marketplace adoption', 'Enterprise procurement cycles'],
    whyItMatters: 'Distribution architecture can turn technical advantage into repeatable market penetration.'
  },
  {
    id: 'financial-durability',
    label: 'Financial Durability',
    category: 'Finance',
    keywords: ['revenue', 'margin', 'gross margin', 'operating margin', 'free cash flow', 'profit', 'pricing', 'arpu', 'backlog'],
    belief: 'Financial performance needs to be interpreted through durability, mix, margin, and backlog quality.',
    assumptions: ['Current growth converts into durable economics', 'Margins are not purely cyclical', 'Backlog indicates real future demand'],
    externalDependencies: ['Pricing pressure', 'Competitive response', 'Customer mix', 'Supply allocation'],
    whyItMatters: 'Strategic coherence only matters commercially if it converts into durable financial performance.'
  }
];

export async function POST(request: NextRequest) {
  try {
    const sources = await readEvidenceFromRequest(request);

    if (!sources.length) {
      return NextResponse.json({ error: 'No evidence received.' }, { status: 400 });
    }

    const combined = sources.map((source) => source.text).join('\n\n');
    const evidenceObjects = extractEvidence(sources);
    const entities = extractEntities(combined, evidenceObjects);
    const relationships = extractRelationships(evidenceObjects);
    const contradictions = detectContradictions(evidenceObjects, relationships);
    const beliefs = buildBeliefs(evidenceObjects, relationships, contradictions, sources.length);
    const insights = generateInsights(beliefs, evidenceObjects, relationships);
    const openQuestions = generateOpenQuestions(beliefs, evidenceObjects, relationships, contradictions);
    const nextBestEvidence = suggestNextEvidence(beliefs, evidenceObjects, openQuestions);
    const understandingScore = scoreUnderstanding(evidenceObjects, entities, relationships, beliefs, contradictions, sources.length);
    const previousScore = Math.max(1, Math.round(understandingScore - Math.max(4, sources.length * 3 + beliefs.length)));
    const companyName = inferCompanyName(combined, sources.map((source) => source.name));

    const baseReport = {
      engineVersion: 'v11.0-hybrid-belief-engine',
      engineMode: process.env.OPENAI_API_KEY ? 'hybrid-llm' : 'local-deterministic',
      companyName,
      sourceCount: sources.length,
      sources: sources.map(({ id, name, wordCount }) => ({ id, name, wordCount })),
      evidenceObjects,
      entities: entities.slice(0, 30),
      relationships: relationships.slice(0, 30),
      beliefs,
      insights,
      contradictions,
      openQuestions,
      nextBestEvidence,
      understandingScore,
      previousScore,
      delta: understandingScore - previousScore,
      organismState: buildOrganismState(beliefs, relationships, understandingScore),
      brief: generateBrief(beliefs, insights, contradictions, openQuestions, nextBestEvidence),
      decisionSupport: generateDecisionSupport(beliefs, insights, contradictions, openQuestions, nextBestEvidence, evidenceObjects, companyName),
      raw: {
        topicCoverage: topicCoverage(evidenceObjects),
        relationshipPaths: buildRelationshipPaths(relationships),
        assumptionMap: beliefs.map((belief) => ({ beliefId: belief.id, assumptions: belief.assumptions, externalDependencies: belief.externalDependencies }))
      }
    };

    const llmReport = await maybeGenerateLLMReport(sources, baseReport);
    return NextResponse.json(llmReport ? mergeLLMReport(baseReport, llmReport) : baseReport);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown analysis error.' }, { status: 500 });
  }
}


async function readEvidenceFromRequest(request: NextRequest): Promise<SourceDoc[]> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const files = form.getAll('files').filter((value): value is File => value instanceof File);
    if (files.length) return Promise.all(files.map(readFileAsText));

    const sampleText = String(form.get('sampleText') || '').trim();
    const companyName = String(form.get('companyName') || inferCompanyName(sampleText, ['Evidence'])).trim();
    if (sampleText) {
      return splitTextEvidence(sampleText, companyName || 'Evidence');
    }

    const content = String(form.get('content') || form.get('text') || '').trim();
    if (content) return splitTextEvidence(content, companyName || 'Evidence');
    return [];
  }

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null) as any;
    if (!body) return [];

    const docs = Array.isArray(body.documents) ? body.documents : Array.isArray(body.evidence) ? body.evidence : [];
    if (docs.length) {
      return docs.map((doc: any, index: number) => normalizeEvidenceDoc(doc, index)).filter(Boolean);
    }

    const text = String(body.sampleText || body.content || body.text || '').trim();
    const companyName = String(body.companyName || inferCompanyName(text, ['Evidence'])).trim();
    if (text) return splitTextEvidence(text, companyName || 'Evidence');
  }

  const text = (await request.text().catch(() => '')).trim();
  return text ? splitTextEvidence(text, 'Evidence') : [];
}

function normalizeEvidenceDoc(doc: any, index: number): SourceDoc | null {
  const text = String(doc?.text || doc?.content || doc?.sampleText || '').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const name = String(doc?.name || doc?.source || doc?.filename || `Evidence ${index + 1}`);
  return { id: slug(name), name, text: text.slice(0, 120000), wordCount: text.split(/\s+/).filter(Boolean).length };
}

function splitTextEvidence(text: string, fallbackName: string): SourceDoc[] {
  const chunks = text
    .split(/\n\s*---\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk, index) => {
    const sourceMatch = chunk.match(/^SOURCE:\s*(.+)$/im);
    const name = sourceMatch?.[1]?.trim() || (chunks.length === 1 ? fallbackName : `${fallbackName} ${index + 1}`);
    const clean = chunk.replace(/^SOURCE:\s*.+$/im, '').replace(/\s+/g, ' ').trim();
    return {
      id: slug(name),
      name,
      text: (clean || chunk).slice(0, 120000),
      wordCount: (clean || chunk).split(/\s+/).filter(Boolean).length
    };
  });
}

async function readFileAsText(file: File): Promise<SourceDoc> {
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = buffer.toString('utf8');
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  if (!text || text.length < 20) text = `[${file.name}] Binary file received. Text extraction for this file type is limited in engine v10.`;
  return { id: slug(file.name), name: file.name, text: text.slice(0, 120000), wordCount: text.split(/\s+/).filter(Boolean).length };
}

function splitClaims(text: string) {
  const pieces = text.split(/(?<=[.!?])\s+|\n|\r|;\s+/);
  return pieces.map((piece) => piece.trim()).filter((piece) => piece.length > 38 && piece.length < 520).slice(0, 90);
}

function extractEvidence(sources: SourceDoc[]): EvidenceObject[] {
  const evidence: EvidenceObject[] = [];
  sources.forEach((source, sourceIndex) => {
    splitClaims(source.text).forEach((claim, claimIndex) => {
      const matchedTopics = topicsFor(claim);
      const category = categoryFor(claim, matchedTopics);
      const hasNumber = /\d/.test(claim);
      const connective = /because|therefore|driven by|due to|depends on|linked to|supports|constrains|enables|risk|despite|while/i.test(claim);
      const confidence = clamp(42 + (hasNumber ? 10 : 0) + matchedTopics.length * 8 + (connective ? 8 : 0) + Math.min(10, Math.floor(claim.length / 45)), 45, 94);
      const weight = clamp(Math.round(confidence * (1 + matchedTopics.length * 0.16)), 40, 120);
      evidence.push({
        id: `E${sourceIndex + 1}-${claimIndex + 1}`,
        claim,
        source: source.name,
        category,
        confidence,
        weight,
        topics: matchedTopics.map((topic) => topic.id),
        quote: claim.slice(0, 220)
      });
    });
  });
  return evidence.sort((a, b) => b.weight - a.weight).slice(0, 120);
}

function topicsFor(text: string) {
  const lower = text.toLowerCase();
  return topics.filter((topic) => topic.keywords.some((keyword) => lower.includes(keyword)));
}

function categoryFor(claim: string, matchedTopics: Topic[]) {
  if (matchedTopics.length) return matchedTopics[0].category;
  const lower = claim.toLowerCase();
  if (/revenue|margin|cash|profit|pricing|backlog|financial|cost/.test(lower)) return 'Finance';
  if (/customer|member|subscriber|churn|retention|engagement|enterprise|adoption/.test(lower)) return 'Customer';
  if (/supply|capacity|manufacturing|delivery|process|operations/.test(lower)) return 'Operations';
  if (/risk|constraint|uncertain|pressure|dependency|competition|export/.test(lower)) return 'Risk';
  if (/strategy|market|product|roadmap|growth|platform|partner/.test(lower)) return 'Strategy';
  return 'General';
}

function extractEntities(text: string, evidence: EvidenceObject[]): Entity[] {
  const candidates = text.match(/\b[A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,3}\b/g) ?? [];
  const counts = new Map<string, number>();
  const stop = new Set(['The', 'This', 'That', 'Because', 'However', 'Annual Report', 'Quarter', 'Notes', 'Company', 'Discovery']);
  for (const raw of candidates) {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (name.length < 3 || stop.has(name)) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  for (const topic of topics) {
    const mentions = evidence.filter((item) => item.topics.includes(topic.id)).length;
    if (mentions) counts.set(topic.label, (counts.get(topic.label) ?? 0) + mentions);
  }
  return Array.from(counts.entries())
    .map(([name, mentions]) => ({ name, mentions, type: inferEntityType(name), salience: clamp(mentions * 10, 10, 100) }))
    .sort((a, b) => b.salience - a.salience)
    .slice(0, 50);
}

function inferEntityType(name: string) {
  if (/NVIDIA|Amazon|Microsoft|Google|Meta|AMD|Intel|Cloud|Retail|Inc|Corp/i.test(name)) return 'Organization';
  if (/Revenue|Margin|Capex|ARR|MRR|FY|Q[1-4]/i.test(name)) return 'Metric';
  if (/Platform|CUDA|Blackwell|AI Infrastructure|Networking|Inference/i.test(name)) return 'Strategic concept';
  return name.split(' ').length >= 2 ? 'Concept' : 'Entity';
}

function extractRelationships(evidence: EvidenceObject[]): Relationship[] {
  const pairs = new Map<string, EvidenceObject[]>();
  for (const item of evidence) {
    for (let i = 0; i < item.topics.length; i++) {
      for (let j = i + 1; j < item.topics.length; j++) {
        const a = topicById(item.topics[i]);
        const b = topicById(item.topics[j]);
        if (!a || !b) continue;
        const key = [a.id, b.id].sort().join('|');
        pairs.set(key, [...(pairs.get(key) ?? []), item]);
      }
    }
  }

  const relationships: Relationship[] = Array.from(pairs.entries()).map(([key, items], index) => {
    const [aId, bId] = key.split('|');
    const a = topicById(aId)!;
    const b = topicById(bId)!;
    const uniqueSources = new Set(items.map((item) => item.source)).size;
    const strength = clamp(42 + items.length * 8 + uniqueSources * 9 + average(items.map((item) => item.confidence)) * 0.16, 48, 96);
    return {
      id: `R${index + 1}`,
      from: a.label,
      to: b.label,
      type: relationshipType(a, b),
      strength: Math.round(strength),
      evidence: items.slice(0, 5).map((item) => item.id),
      explanation: `${a.label} and ${b.label} appear together across ${uniqueSources} source${uniqueSources === 1 ? '' : 's'}, suggesting the model should treat them as connected rather than separate themes.`
    };
  });

  const topicCounts = topicCoverage(evidence);
  const categories = Object.entries(topicCounts).filter(([, count]) => count >= 2).map(([id]) => topicById(id)).filter(Boolean) as Topic[];
  for (let i = 0; i < categories.length; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      const a = categories[i];
      const b = categories[j];
      if (relationships.some((r) => new Set([r.from, r.to]).has(a.label) && new Set([r.from, r.to]).has(b.label))) continue;
      const supporting = evidence.filter((item) => item.topics.includes(a.id) || item.topics.includes(b.id)).slice(0, 4);
      relationships.push({
        id: `R${relationships.length + 1}`,
        from: a.label,
        to: b.label,
        type: 'Contextual adjacency',
        strength: clamp(38 + supporting.length * 7, 40, 78),
        evidence: supporting.map((item) => item.id),
        explanation: `${a.label} and ${b.label} are both material in the packet. Discovery has not proven causality, but the relationship is worth testing.`
      });
    }
  }

  return relationships.sort((a, b) => b.strength - a.strength);
}

function relationshipType(a: Topic, b: Topic) {
  const labels = [a.id, b.id].sort().join('|');
  if (labels.includes('platform-strategy') && labels.includes('networking')) return 'Platform dependency';
  if (labels.includes('ai-infrastructure') && labels.includes('hyperscaler-capex')) return 'Demand dependency';
  if (labels.includes('platform-strategy') && labels.includes('partners-distribution')) return 'Distribution reinforcement';
  if (labels.includes('financial-durability') && labels.includes('supply-policy-risk')) return 'Execution risk';
  return 'Reinforcing relationship';
}

function detectContradictions(evidence: EvidenceObject[], relationships: Relationship[]) {
  const text = evidence.map((item) => item.claim.toLowerCase()).join(' ');
  const contradictions: { title: string; body: string; confidence: number; evidence: string[] }[] = [];
  if (/(growth|increase|accelerat|strong demand|record)/.test(text) && /(constraint|risk|export|supply|capacity|competition|pressure|slow)/.test(text)) {
    contradictions.push({
      title: 'Strong demand signals coexist with execution and external-dependency risks',
      body: 'Discovery sees a coherent growth narrative, but it also sees constraints that could affect how much of that narrative converts into durable performance.',
      confidence: 76,
      evidence: evidence.filter((item) => /growth|demand|constraint|risk|export|supply|capacity/i.test(item.claim)).slice(0, 5).map((item) => item.id)
    });
  }
  if (relationships.some((r) => r.from.includes('Platform') || r.to.includes('Platform')) && evidence.some((item) => item.topics.includes('hyperscaler-capex'))) {
    contradictions.push({
      title: 'Platform coherence may still depend on customer capital spending',
      body: 'The platform thesis can be strategically strong while remaining sensitive to infrastructure-spending cycles outside the company.',
      confidence: 72,
      evidence: evidence.filter((item) => item.topics.includes('platform-strategy') || item.topics.includes('hyperscaler-capex')).slice(0, 5).map((item) => item.id)
    });
  }
  return contradictions;
}

function buildBeliefs(evidence: EvidenceObject[], relationships: Relationship[], contradictions: ReturnType<typeof detectContradictions>, sourceCount: number): BeliefObject[] {
  const coverage = topicCoverage(evidence);
  const beliefs = Object.entries(coverage)
    .map(([topicId, count]) => {
      const topic = topicById(topicId)!;
      const supporting = evidence.filter((item) => item.topics.includes(topic.id)).slice(0, 8);
      const relationshipBoost = relationships.filter((rel) => rel.from === topic.label || rel.to === topic.label).length * 4;
      const contradictionPenalty = contradictions.filter((c) => c.body.toLowerCase().includes(topic.label.toLowerCase().split(' ')[0])).length * 4;
      const confidence = clamp(42 + count * 8 + new Set(supporting.map((item) => item.source)).size * 8 + relationshipBoost - contradictionPenalty, 45, 94);
      const previousConfidence = clamp(confidence - Math.max(5, sourceCount * 2 + count), 28, confidence - 1);
      return {
        id: `B-${topic.id}`,
        belief: topic.belief,
        type: count >= 4 ? 'current_belief' : count >= 2 ? 'strengthening_belief' : 'open_question',
        confidence,
        previousConfidence,
        delta: confidence - previousConfidence,
        supportingEvidence: supporting.map((item) => item.id),
        assumptions: topic.assumptions,
        externalDependencies: topic.externalDependencies,
        contradictions: contradictions.filter((c) => c.evidence.some((id) => supporting.some((item) => item.id === id))).map((c) => c.title),
        whyItMatters: topic.whyItMatters
      } satisfies BeliefObject;
    })
    .sort((a, b) => b.confidence + b.supportingEvidence.length * 2 - (a.confidence + a.supportingEvidence.length * 2));

  if (!beliefs.length) {
    beliefs.push({
      id: 'B-initial',
      belief: 'Discovery has enough evidence to begin forming an initial organizational understanding, but not enough to elevate a strong belief.',
      type: 'open_question',
      confidence: 38,
      previousConfidence: 25,
      delta: 13,
      supportingEvidence: evidence.slice(0, 3).map((item) => item.id),
      assumptions: ['Additional evidence will clarify whether early signals are meaningful or incidental'],
      externalDependencies: [],
      contradictions: [],
      whyItMatters: 'The system should preserve uncertainty until stronger relationships emerge.'
    });
  }

  return beliefs.slice(0, 8);
}

function generateInsights(beliefs: BeliefObject[], evidence: EvidenceObject[], relationships: Relationship[]): Insight[] {
  const top = beliefs[0];
  const insightList: Insight[] = [{
    type: 'Most impactful',
    title: top.belief,
    body: top.contradictions.length
      ? `${top.supportingEvidence.length} evidence objects support this belief, but Discovery is preserving visible uncertainty because competing pressure also appears in the packet.`
      : `${top.supportingEvidence.length} evidence objects support this belief. Discovery elevated it because it is both well-supported and connected to other parts of the model.`,
    confidence: top.confidence,
    beliefId: top.id,
    why: `${top.whyItMatters} The belief is listed because it has ${top.supportingEvidence.length} supporting evidence objects, ${relationships.filter((r) => r.from.includes(labelFromBelief(top)) || r.to.includes(labelFromBelief(top))).length} related connections, and a confidence change of +${top.delta} points.`,
    sources: new Set(evidence.filter((item) => top.supportingEvidence.includes(item.id)).map((item) => item.source)).size,
    tags: tagsForBelief(top)
  }];

  beliefs.slice(1, 5).forEach((belief) => {
    insightList.push({
      type: belief.type === 'open_question' ? 'Open question' : 'Strengthening belief',
      title: belief.belief,
      body: belief.contradictions.length ? `This belief is forming, but Discovery found tension: ${belief.contradictions[0]}.` : `This belief is strengthening as more evidence connects to the model.`,
      confidence: belief.confidence,
      beliefId: belief.id,
      why: belief.whyItMatters,
      sources: new Set(evidence.filter((item) => belief.supportingEvidence.includes(item.id)).map((item) => item.source)).size,
      tags: tagsForBelief(belief)
    });
  });
  return insightList;
}

function labelFromBelief(belief: BeliefObject) {
  const match = topics.find((topic) => belief.id.endsWith(topic.id));
  return match?.label ?? '';
}

function tagsForBelief(belief: BeliefObject) {
  const topic = topics.find((candidate) => belief.id.endsWith(candidate.id));
  return topic ? [topic.category, ...topic.label.split(' ').slice(0, 2)] : ['Belief'];
}

function generateOpenQuestions(beliefs: BeliefObject[], evidence: EvidenceObject[], relationships: Relationship[], contradictions: ReturnType<typeof detectContradictions>) {
  const questions: string[] = [];
  const top = beliefs[0];
  if (top) {
    top.externalDependencies.slice(0, 2).forEach((dependency) => questions.push(`What evidence would show whether ${dependency.toLowerCase()} strengthens or weakens this belief?`));
    top.assumptions.slice(0, 1).forEach((assumption) => questions.push(`What would disprove the assumption that ${assumption.toLowerCase()}?`));
  }
  contradictions.forEach((contradiction) => questions.push(`Is this tension explained by timing, segmentation, or a real strategic trade-off: ${contradiction.title}?`));
  if (relationships.length) questions.push(`Is the relationship between ${relationships[0].from} and ${relationships[0].to} causal, reinforcing, or merely correlated?`);
  if (evidence.length < 10) questions.push('What second source would test whether the current belief survives independent evidence?');
  return Array.from(new Set(questions)).slice(0, 7);
}

function suggestNextEvidence(beliefs: BeliefObject[], evidence: EvidenceObject[], questions: string[]) {
  const missing: string[] = [];
  const ids = new Set(evidence.flatMap((item) => item.topics));
  if (ids.has('hyperscaler-capex')) missing.push('Customer concentration by hyperscaler and multi-year purchasing commitments');
  if (ids.has('ai-infrastructure')) missing.push('Backlog, supply allocation, and deployment timing data');
  if (ids.has('inference')) missing.push('Inference utilization economics and production workload mix');
  if (ids.has('supply-policy-risk')) missing.push('Export-control exposure by region and product category');
  if (!ids.has('financial-durability')) missing.push('Gross margin bridge, backlog quality, and revenue mix by product line');
  if (!ids.has('partners-distribution')) missing.push('Partner pipeline, channel contribution, and enterprise deployment data');
  beliefs[0]?.externalDependencies.slice(0, 1).forEach((dependency) => missing.push(`Evidence that measures ${dependency.toLowerCase()}`));
  questions.slice(0, 1).forEach((q) => missing.push(`Evidence to answer: ${q}`));
  return Array.from(new Set(missing)).slice(0, 6);
}

function scoreUnderstanding(evidence: EvidenceObject[], entities: Entity[], relationships: Relationship[], beliefs: BeliefObject[], contradictions: unknown[], sources: number) {
  return clamp(
    Math.round(4 + sources * 5 + Math.min(22, evidence.length * 0.45) + Math.min(18, entities.length * 0.4) + Math.min(20, relationships.length * 1.6) + Math.min(18, beliefs.length * 3) - contradictions.length * 2),
    1,
    92
  );
}

function buildOrganismState(beliefs: BeliefObject[], relationships: Relationship[], understandingScore: number) {
  const nodes = beliefs.map((belief, index) => ({
    id: belief.id,
    label: labelFromBelief(belief) || `Belief ${index + 1}`,
    confidence: belief.confidence,
    radius: Math.round(26 + belief.confidence * 0.45),
    zone: belief.type,
    tension: belief.contradictions.length > 0
  }));
  const edges = relationships.slice(0, 16).map((rel) => ({ from: rel.from, to: rel.to, strength: rel.strength, type: rel.type }));
  return {
    maturity: understandingScore,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodes,
    edges,
    lastMeaningfulChange: beliefs[0] ? `${labelFromBelief(beliefs[0]) || 'Current belief'} strengthened by ${beliefs[0].delta} confidence points.` : 'Initial understanding formed.'
  };
}

function generateBrief(beliefs: BeliefObject[], insights: Insight[], contradictions: { title: string }[], questions: string[], nextBestEvidence: string[]) {
  const top = beliefs[0];
  return [
    top?.belief ?? 'Discovery formed an initial understanding.',
    insights[1]?.title ?? 'More evidence is needed before strong conclusions should be trusted.',
    contradictions[0]?.title ?? questions[0] ?? 'The next step is to add an independent source.',
    `What would change our mind: ${nextBestEvidence[0] ?? 'Upload a source from a different function or perspective.'}`
  ];
}

function buildRelationshipPaths(relationships: Relationship[]) {
  return relationships.slice(0, 6).map((rel) => ({ path: [rel.from, rel.type, rel.to], strength: rel.strength, evidence: rel.evidence }));
}

function topicCoverage(evidence: EvidenceObject[]) {
  return evidence.reduce<Record<string, number>>((acc, item) => {
    item.topics.forEach((topic) => { acc[topic] = (acc[topic] ?? 0) + 1; });
    return acc;
  }, {});
}

function topicById(id: string) {
  return topics.find((topic) => topic.id === id);
}


type DecisionSupport = {
  nextStep: string;
  suggestedMeeting: string;
  meetingPurpose: string;
  questionsToAsk: string[];
  evidenceToBring: string[];
  exportTitle: string;
};

type LLMEnginePatch = {
  currentBelief?: string;
  confidence?: number;
  whyItMatters?: string;
  mostImpactfulInsight?: { title: string; body: string; why: string; tags?: string[] };
  strengtheningBeliefs?: Array<{ belief: string; confidence?: number; whyItMatters?: string }>;
  contradictions?: Array<{ title: string; body: string; confidence?: number }>;
  openQuestions?: string[];
  nextBestEvidence?: string[];
  actionPlan?: DecisionSupport;
};

function generateDecisionSupport(
  beliefs: BeliefObject[],
  insights: Insight[],
  contradictions: { title: string; body?: string }[],
  questions: string[],
  nextBestEvidence: string[],
  evidence: EvidenceObject[],
  companyName: string
): DecisionSupport {
  const top = beliefs[0];
  const topEvidence = nextBestEvidence[0] ?? questions[0] ?? 'one independent source that could challenge the current belief';
  const riskTone = contradictions.length ? 'pressure-test the tension in the current belief' : 'test the strongest assumption behind the current belief';
  const meeting = top?.externalDependencies?.some((item) => /capex|spending|margin|backlog|pricing|financial/i.test(item))
    ? 'Finance and Strategy'
    : top?.externalDependencies?.some((item) => /customer|adoption|enterprise|deployment/i.test(item))
      ? 'Customer, Sales, and Product'
      : 'Strategy owner closest to the evidence';

  return {
    nextStep: nextBestEvidence.length ? `Collect ${topEvidence}.` : `Run a focused meeting to ${riskTone}.`,
    suggestedMeeting: `Meet with ${meeting}`,
    meetingPurpose: `Use the current belief as a working hypothesis and identify what would strengthen, weaken, or revise it.`,
    questionsToAsk: [
      `What evidence would most directly challenge the belief: ${top?.belief ?? insights[0]?.title ?? 'the current belief'}?`,
      ...(top?.assumptions ?? []).slice(0, 2).map((assumption) => `What would disprove this assumption: ${assumption}?`),
      ...(nextBestEvidence ?? []).slice(0, 3).map((item) => `Who owns the data for ${item.toLowerCase()}?`),
      ...(questions ?? []).slice(0, 2)
    ].slice(0, 7),
    evidenceToBring: evidence.slice(0, 5).map((item) => `${item.source}: ${item.claim}`),
    exportTitle: `${companyName} Discovery meeting brief`
  };
}

async function maybeGenerateLLMReport(sources: SourceDoc[], baseReport: any): Promise<LLMEnginePatch | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const sourceDigest = sources.map((source, index) => `SOURCE ${index + 1}: ${source.name}\n${source.text.slice(0, 5000)}`).join('\n\n---\n\n');
  const deterministicDigest = JSON.stringify({
    beliefs: baseReport.beliefs?.slice(0, 5),
    contradictions: baseReport.contradictions?.slice(0, 4),
    nextBestEvidence: baseReport.nextBestEvidence?.slice(0, 5),
    relationships: baseReport.relationships?.slice(0, 8)
  }).slice(0, 12000);

  const prompt = `You are Discovery's Understanding Engine. Your job is not to summarize. Create executive-grade, evidence-constrained beliefs from the provided evidence packet.\n\nRules:\n- Do not invent facts outside the packet.\n- Distinguish current belief, uncertainty, contradiction, and next-best evidence.\n- Prefer one strong testable belief over many generic insights.\n- Make the output useful for an executive deciding what to investigate next.\n- Use concise language.\n\nReturn only valid JSON matching this shape:\n{\n  "currentBelief": string,\n  "confidence": number,\n  "whyItMatters": string,\n  "mostImpactfulInsight": {"title": string, "body": string, "why": string, "tags": string[]},\n  "strengtheningBeliefs": [{"belief": string, "confidence": number, "whyItMatters": string}],\n  "contradictions": [{"title": string, "body": string, "confidence": number}],\n  "openQuestions": string[],\n  "nextBestEvidence": string[],\n  "actionPlan": {\n    "nextStep": string,\n    "suggestedMeeting": string,\n    "meetingPurpose": string,\n    "questionsToAsk": string[],\n    "evidenceToBring": string[],\n    "exportTitle": string\n  }\n}\n\nEvidence packet:\n${sourceDigest}\n\nDeterministic engine scaffold:\n${deterministicDigest}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You produce strict JSON for an evidence-constrained organizational understanding engine.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as LLMEnginePatch;
  } catch {
    return null;
  }
}

function mergeLLMReport(baseReport: any, patch: LLMEnginePatch) {
  const top = baseReport.beliefs?.[0];
  const currentBelief = patch.currentBelief?.trim();
  if (currentBelief && top) {
    top.belief = currentBelief;
    top.confidence = clamp(patch.confidence ?? top.confidence, 45, 97);
    top.delta = Math.max(1, top.confidence - top.previousConfidence);
    if (patch.whyItMatters) top.whyItMatters = patch.whyItMatters;
  }

  if (patch.strengtheningBeliefs?.length) {
    const additional = patch.strengtheningBeliefs.slice(0, 4).map((item, index) => ({
      id: `B-llm-${index + 1}`,
      belief: item.belief,
      type: 'strengthening_belief' as const,
      confidence: clamp(item.confidence ?? 68, 45, 94),
      previousConfidence: clamp((item.confidence ?? 68) - 9, 35, 90),
      delta: 9,
      supportingEvidence: baseReport.evidenceObjects.slice(index, index + 4).map((e: EvidenceObject) => e.id),
      assumptions: top?.assumptions ?? [],
      externalDependencies: top?.externalDependencies ?? [],
      contradictions: [],
      whyItMatters: item.whyItMatters || 'This belief may affect what Discovery should investigate next.'
    }));
    baseReport.beliefs = [baseReport.beliefs[0], ...additional, ...baseReport.beliefs.slice(1)].slice(0, 8);
  }

  if (patch.mostImpactfulInsight) {
    baseReport.insights[0] = {
      type: 'Most impactful',
      title: patch.mostImpactfulInsight.title || currentBelief || baseReport.insights[0]?.title,
      body: patch.mostImpactfulInsight.body || baseReport.insights[0]?.body,
      confidence: top?.confidence ?? patch.confidence ?? baseReport.insights[0]?.confidence ?? baseReport.understandingScore,
      beliefId: top?.id,
      why: patch.mostImpactfulInsight.why || baseReport.insights[0]?.why,
      sources: baseReport.sourceCount,
      tags: patch.mostImpactfulInsight.tags?.slice(0, 4) ?? baseReport.insights[0]?.tags ?? ['Belief']
    };
  }

  if (patch.contradictions?.length) baseReport.contradictions = patch.contradictions.slice(0, 5);
  if (patch.openQuestions?.length) baseReport.openQuestions = patch.openQuestions.slice(0, 8);
  if (patch.nextBestEvidence?.length) baseReport.nextBestEvidence = patch.nextBestEvidence.slice(0, 8);
  if (patch.actionPlan) baseReport.decisionSupport = patch.actionPlan;
  baseReport.brief = generateBrief(baseReport.beliefs, baseReport.insights, baseReport.contradictions, baseReport.openQuestions, baseReport.nextBestEvidence);
  baseReport.organismState = buildOrganismState(baseReport.beliefs, baseReport.relationships, baseReport.understandingScore);
  baseReport.engineMode = 'hybrid-llm';
  baseReport.modelUsed = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  return baseReport;
}

function inferCompanyName(text: string, sourceNames: string[]) {
  if (/nvidia/i.test(text + ' ' + sourceNames.join(' '))) return 'NVIDIA';
  const match = text.match(/(?:Company|Organization|Customer|Packet):\s*([A-Z][A-Za-z0-9& .-]{2,50})/i);
  if (match) return match[1].trim();
  const entity = extractEntities(text, []).find((item) => item.type === 'Organization')?.name;
  return entity || sourceNames[0]?.replace(/\.[^.]+$/, '') || 'Uploaded organization';
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'source';
}

function average(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
