'use client';

import { useEffect, useMemo, useState } from 'react';

type DemoDoc = {
  name: string;
  filename: string;
  cue: string;
  shift: string;
};

type EvidenceObject = { id: string; claim: string; source: string; category: string; confidence: number };
type BeliefObject = {
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
type Relationship = { from: string; to: string; type: string; strength: number; evidence: string[] };
type DecisionSupport = {
  nextStep: string;
  suggestedMeeting: string;
  meetingPurpose: string;
  questionsToAsk: string[];
  evidenceToBring: string[];
  exportTitle: string;
};

type EngineReport = {
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

const nvidiaDocs: DemoDoc[] = [
  {
    name: 'FY2025 Annual Report Notes',
    filename: 'fy2025-annual-report-notes.txt',
    cue: 'Start with the public filing. It gives Discovery the first outline of the company.',
    shift: 'The first point appears. Discovery recognizes AI infrastructure as the central context.'
  },
  {
    name: 'Q1 FY2026 Earnings Call Notes',
    filename: 'q1-fy2026-earnings-call-notes.txt',
    cue: 'Add management commentary. This tests whether the filing narrative survives leadership discussion.',
    shift: 'A branch forms. Networking begins connecting to the AI infrastructure story.'
  },
  {
    name: 'Investor Presentation Notes',
    filename: 'investor-presentation-notes.txt',
    cue: 'Add the investor narrative. Discovery can now compare strategy, language, and positioning.',
    shift: 'A second region differentiates. Software starts acting like a multiplier, not a side note.'
  },
  {
    name: 'GTC Keynote Notes',
    filename: 'gtc-keynote-notes.txt',
    cue: 'Add the product vision. This is where the model should change if a deeper pattern exists.',
    shift: 'Understanding changes. Discovery now sees a platform architecture forming around AI infrastructure.'
  },
  {
    name: 'Product Announcement Notes',
    filename: 'product-announcement-notes.txt',
    cue: 'Add product evidence. This tests whether the platform belief shows up in actual releases.',
    shift: 'Weak links strengthen. Product evidence reinforces the system-level platform pattern.'
  },
  {
    name: 'Competitive & Risk Notes',
    filename: 'competitive-risk-notes.txt',
    cue: 'Add risk context. Discovery should become more careful, not merely more confident.',
    shift: 'The model adds restraint. Confidence rises in the platform thesis while dependencies become explicit.'
  }
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [loadedDocs, setLoadedDocs] = useState(0);
  const [report, setReport] = useState<EngineReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [privateMode, setPrivateMode] = useState(false);
  const complete = loadedDocs >= nvidiaDocs.length;
  const showingAha = complete && !privateMode;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDeveloperMode((value) => !value);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const topBelief = report?.beliefs?.[0];
  const visibleEvidence = report?.evidenceObjects?.slice(0, 4) ?? [];
  const visibleRelationships = report?.relationships?.slice(0, 4) ?? [];
  const nextDoc = nvidiaDocs[loadedDocs];
  const latestShift = loadedDocs > 0 ? nvidiaDocs[loadedDocs - 1]?.shift : null;

  async function addNextEvidence() {
    if (!nextDoc || isAnalyzing) return;
    setIsAnalyzing(true);
    setFlipped(false);
    setInspecting(false);
    setMessage(`Adding evidence: ${nextDoc.name}`);
    try {
      const selectedDocs = nvidiaDocs.slice(0, loadedDocs + 1);
      const parts = await Promise.all(
        selectedDocs.map(async (doc) => {
          const res = await fetch(`/demo-packets/nvidia/${doc.filename}`);
          if (!res.ok) throw new Error(`Could not load ${doc.filename}`);
          const text = await res.text();
          return `SOURCE: ${doc.name}\n${text}`;
        })
      );
      const form = new FormData();
      form.append('companyName', 'NVIDIA');
      form.append('sampleText', parts.join('\n\n---\n\n'));
      const res = await fetch('/api/analyze', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Analyze request failed.');
      const data = (await res.json()) as EngineReport;
      setReport(data);
      setLoadedDocs((count) => count + 1);
      setMessage(nextDoc.shift);
      setTimeout(() => setMessage(null), 3600);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Discovery could not analyze this evidence.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function restart() {
    setStarted(false);
    setLoadedDocs(0);
    setReport(null);
    setMessage(null);
    setFlipped(false);
    setInspecting(false);
    setCustomQuestion('');
    setPrivateMode(false);
  }

  const currentUnderstanding = topBelief?.belief ?? (started ? 'Understanding begins with the next piece of evidence.' : 'Organizational understanding emerges.');
  const score = report?.understandingScore ?? (started ? 1 : 0);

  return (
    <main className="workspace-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <section className={cx('workspace', started && 'workspace-started', complete && 'workspace-complete', privateMode && 'workspace-private')}>
        <header className="topbar">
          <button className="brand" onClick={restart} aria-label="Discovery home">
            <span className="brand-mark" />
            <span>Discovery</span>
          </button>
          <div className="topbar-right">
            {started && <span className="quiet-pill">NVIDIA public journey</span>}
            <button className="ghost-button" onClick={() => setDeveloperMode((v) => !v)}>⌘⇧D</button>
          </div>
        </header>

        {!started ? (
          <Hero onStart={() => { setStarted(true); setMessage('Discovery is waiting for evidence.'); setTimeout(() => setMessage(null), 1800); }} />
        ) : privateMode ? (
          <PrivateWorkspace value={customQuestion} onChange={setCustomQuestion} onRestart={restart} />
        ) : (
          <div className={cx('unfolding-grid', showingAha && 'aha-grid')}>
            <section className="model-stage">
              <p className="eyebrow">Understanding</p>
              <h1>{showingAha ? 'Understanding emerged.' : currentUnderstanding}</h1>
              <p className="stage-copy">
                {showingAha
                  ? 'Six public sources have resolved into one testable belief. The model is now ready for questions.'
                  : 'Add one document at a time. Discovery will only surface what the current evidence can support.'}
              </p>
              <UnderstandingModel step={loadedDocs} score={score} tension={(report?.contradictions?.length ?? 0) > 0} mature={showingAha} />
              <LearningProgress docs={nvidiaDocs} loadedDocs={loadedDocs} complete={complete} latestShift={latestShift} isAnalyzing={isAnalyzing} />
            </section>

            <section className="evidence-rail">
              {!complete ? (
                <EvidencePrompt doc={nextDoc} step={loadedDocs + 1} total={nvidiaDocs.length} isAnalyzing={isAnalyzing} onAdd={addNextEvidence} />
              ) : (
                <AhaPrompt belief={topBelief} report={report} onBegin={() => setPrivateMode(true)} />
              )}
              {report && <BeliefCard belief={topBelief} report={report} flipped={flipped} setFlipped={setFlipped} onInspect={() => setInspecting(true)} />}
              {report && <ActionPlan report={report} belief={topBelief} complete={complete} />}
            </section>

            {report && !complete && (
              <section className="emergence-panel">
                <div className="panel-header">
                  <p className="eyebrow">What changed</p>
                  <span>{loadedDocs}/{nvidiaDocs.length} sources</span>
                </div>
                <div className="mini-stack">
                  {visibleRelationships.length > 0 && (
                    <div className="mini-card">
                      <span>Relationships</span>
                      {visibleRelationships.map((rel, index) => (
                        <p key={`${rel.from}-${rel.to}-${index}`}>{rel.from} <b>→</b> {rel.to}</p>
                      ))}
                    </div>
                  )}
                  {report.contradictions?.[0] && (
                    <div className="mini-card tension">
                      <span>Tension</span>
                      <p>{report.contradictions[0].title}</p>
                    </div>
                  )}
                  <div className="mini-card">
                    <span>What would change our mind?</span>
                    <p>{report.nextBestEvidence?.[0] ?? report.openQuestions?.[0] ?? 'Add an independent source from a different perspective.'}</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      {inspecting && report && (
        <InspectionDrawer report={report} evidence={visibleEvidence} relationships={visibleRelationships} onClose={() => setInspecting(false)} />
      )}

      {developerMode && (
        <DeveloperPanel report={report} loadedDocs={loadedDocs} onClose={() => setDeveloperMode(false)} />
      )}
    </main>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="hero-clean">
      <div className="hero-copy">
        <p className="eyebrow">Discovery alpha</p>
        <h1>Organizational understanding,<br />emerges.</h1>
        <p>Add public evidence one piece at a time. Watch understanding take shape before you ask your own question.</p>
      </div>
      <div className="hero-point-wrap">
        <div className="single-point" />
        <div className="faint-schematic">
          <span />
          <span />
          <span />
          <i />
          <i />
        </div>
      </div>
      <button className="primary-button" onClick={onStart}>Begin with public evidence</button>
    </div>
  );
}

function EvidencePrompt({ doc, step, total, isAnalyzing, onAdd }: { doc?: DemoDoc; step: number; total: number; isAnalyzing: boolean; onAdd: () => void }) {
  if (!doc) return null;
  return (
    <div className="evidence-prompt">
      <div className="panel-header">
        <p className="eyebrow">Evidence {step} of {total}</p>
        <span>{doc.name}</span>
      </div>
      <h2>{doc.cue}</h2>
      <p>{doc.shift}</p>
      <button className="primary-button full" onClick={onAdd} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing…' : 'Add evidence'}
      </button>
    </div>
  );
}

function BeliefCard({ belief, report, flipped, setFlipped, onInspect }: { belief?: BeliefObject; report: EngineReport; flipped: boolean; setFlipped: (value: boolean) => void; onInspect: () => void }) {
  const title = belief?.belief ?? report.brief?.[0] ?? 'Initial understanding formed.';
  return (
    <article className={cx('belief-card', flipped && 'is-flipped')}>
      <div className="belief-face belief-front" onClick={() => setFlipped(true)}>
        <div className="panel-header">
          <p className="eyebrow">Current belief</p>
          <span>{belief?.confidence ?? report.understandingScore}% confidence</span>
        </div>
        <h2>{title}</h2>
        <p>{belief?.whyItMatters ?? report.brief?.[1] ?? 'Discovery is forming a belief from the available evidence.'}</p>
        <button className="text-button">Why this belief?</button>
      </div>
      <div className="belief-face belief-back">
        <div className="panel-header">
          <p className="eyebrow">Reasoning</p>
          <button className="text-button" onClick={() => setFlipped(false)}>Back</button>
        </div>
        <ul className="reason-list">
          <li><b>Evidence:</b> {(belief?.supportingEvidence?.length ?? report.evidenceObjects.length)} objects currently support this belief.</li>
          <li><b>Assumption:</b> {belief?.assumptions?.[0] ?? 'More independent evidence is needed.'}</li>
          <li><b>Dependency:</b> {belief?.externalDependencies?.[0] ?? 'External dependencies are not yet clear.'}</li>
          <li><b>Confidence movement:</b> {belief ? `${belief.previousConfidence}% → ${belief.confidence}%` : `0% → ${report.understandingScore}%`}</li>
        </ul>
        <button className="secondary-button full" onClick={onInspect}>Inspect deeper</button>
      </div>
    </article>
  );
}


function LearningProgress({ docs, loadedDocs, complete, latestShift, isAnalyzing }: { docs: DemoDoc[]; loadedDocs: number; complete: boolean; latestShift: string | null; isAnalyzing: boolean }) {
  const labels = ['Context', 'Commentary', 'Narrative', 'Vision', 'Product', 'Restraint'];
  return (
    <div className="learning-progress" aria-label="Understanding timeline">
      <div className="progress-head">
        <span>{complete ? 'Coherence formed' : 'Understanding timeline'}</span>
        <b>{loadedDocs}/{docs.length}</b>
      </div>
      <div className="timeline-list">
        {docs.map((doc, index) => {
          const active = index < loadedDocs;
          const current = index === loadedDocs;
          return (
            <div className={cx('timeline-step', active && 'is-active', current && !complete && 'is-current')} key={doc.filename}>
              <i />
              <div>
                <span>{labels[index] ?? `Source ${index + 1}`}</span>
                <p>{active ? doc.shift : current ? doc.cue : 'Waiting for evidence.'}</p>
              </div>
            </div>
          );
        })}
      </div>
      {(latestShift || isAnalyzing) && (
        <div className={cx('current-change', isAnalyzing && 'is-thinking')}>
          <span>{isAnalyzing ? 'Discovery is comparing the evidence…' : 'What changed'}</span>
          <p>{isAnalyzing ? 'The model is checking whether this document strengthens, weakens, or revises the current belief.' : latestShift}</p>
        </div>
      )}
    </div>
  );
}

function ActionPlan({ report, belief, complete }: { report: EngineReport; belief?: BeliefObject; complete: boolean }) {
  const nextEvidence = report.nextBestEvidence?.slice(0, 3) ?? [];
  const primaryUnknown = report.decisionSupport?.nextStep ?? nextEvidence[0] ?? report.openQuestions?.[0] ?? 'Add one independent source that could challenge the current belief.';
  const meetingTarget = report.decisionSupport?.suggestedMeeting?.replace(/^Meet with\s+/i, '') ?? (complete ? 'Finance and Strategy' : 'the owner closest to this evidence');
  const confidence = belief?.confidence ?? report.understandingScore;
  const questionsToAsk = report.decisionSupport?.questionsToAsk?.length
    ? report.decisionSupport.questionsToAsk
    : nextEvidence.length
      ? nextEvidence.map((item) => `What evidence do we have for ${item.toLowerCase()}?`)
      : ['What evidence would most challenge the current belief?'];

  function downloadBrief() {
    const title = report.decisionSupport?.exportTitle || `Discovery meeting brief - ${report.companyName}`;
    const lines = [
      title,
      '',
      'Current belief:',
      belief?.belief ?? report.brief?.[0] ?? 'Discovery has formed an initial belief.',
      '',
      `Confidence: ${confidence}%`,
      '',
      'Why it matters:',
      belief?.whyItMatters ?? report.brief?.[1] ?? 'This belief may affect the next investigation.',
      '',
      'Suggested meeting:',
      report.decisionSupport?.suggestedMeeting ?? `Meet with ${meetingTarget} to test the largest unresolved assumption.`,
      '',
      'Meeting purpose:',
      report.decisionSupport?.meetingPurpose ?? 'Pressure-test the current belief and identify the highest-value evidence to collect next.',
      '',
      'Questions to ask:',
      ...questionsToAsk.map((item, index) => `${index + 1}. ${item}`),
      '',
      'Evidence to bring:',
      ...(report.decisionSupport?.evidenceToBring?.length ? report.decisionSupport.evidenceToBring : report.evidenceObjects.slice(0, 5).map((item) => `${item.source}: ${item.claim}`)).map((item) => `- ${item}`),
      '',
      'Open questions:',
      ...report.openQuestions.slice(0, 5).map((item) => `- ${item}`)
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.companyName.toLowerCase()}-discovery-meeting-brief.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="action-plan">
      <div className="panel-header">
        <p className="eyebrow">Next best step</p>
        <span>{complete ? 'Ready for action' : 'To deepen confidence'}</span>
      </div>
      <h3>{complete ? `Meet with ${meetingTarget}` : 'Add the evidence most likely to change the belief.'}</h3>
      <p>{complete ? (report.decisionSupport?.meetingPurpose ?? 'Use the current belief as a working hypothesis. The next step is to pressure-test the assumption behind it.') : primaryUnknown}</p>
      <div className="action-grid">
        <div>
          <span>What Discovery wants next</span>
          <b>{nextEvidence[0] ?? report.openQuestions?.[0] ?? primaryUnknown}</b>
        </div>
        <div>
          <span>Potential lift</span>
          <b>{Math.min(99, confidence + 3)}% confidence</b>
        </div>
      </div>
      <button className="secondary-button full" onClick={downloadBrief}>Download meeting cheat sheet</button>
    </section>
  );
}

function AhaPrompt({ belief, report, onBegin }: { belief?: BeliefObject; report: EngineReport | null; onBegin: () => void }) {
  return (
    <div className="aha-prompt">
      <p className="eyebrow">Aha moment</p>
      <h2>One dominant belief has formed.</h2>
      <p>{belief?.belief ?? report?.brief?.[0] ?? 'Discovery has formed a current best understanding from the evidence.'}</p>
      <div className="aha-meta">
        <span><b>{report?.sourceCount ?? 6}</b> sources</span>
        <span><b>{belief?.confidence ?? report?.understandingScore ?? 0}%</b> confidence</span>
      </div>
      <button className="primary-button full begin-button" onClick={onBegin}>Start gaining your insights</button>
    </div>
  );
}

function PrivateWorkspace({ value, onChange, onRestart }: { value: string; onChange: (value: string) => void; onRestart: () => void }) {
  return (
    <div className="private-workspace">
      <div className="private-organism" aria-hidden="true">
        <div className="private-seed" />
        <div className="private-orbit orbit-one" />
        <div className="private-orbit orbit-two" />
      </div>
      <div className="private-copy">
        <p className="eyebrow">Your organization</p>
        <h1>What has been keeping you up at night?</h1>
        <p>The public journey is complete. Discovery is ready to build a private understanding around your evidence, questions, and decisions.</p>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="A strategic uncertainty, operating tension, customer pattern, or decision you need to understand…" autoFocus />
        <div className="private-actions">
          <button className="primary-button" disabled={!value.trim()}>Begin private investigation</button>
          <button className="secondary-button" onClick={onRestart}>Replay public journey</button>
        </div>
      </div>
    </div>
  );
}

function FinalPrompt({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="final-prompt">
      <p className="eyebrow">Your organization</p>
      <h2>What has been keeping you up at night?</h2>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="A strategic uncertainty, operating tension, customer pattern, or decision you need to understand…" />
      <button className="primary-button full" disabled={!value.trim()}>Start a private investigation</button>
    </div>
  );
}

function UnderstandingModel({ step, score, tension, mature = false }: { step: number; score: number; tension: boolean; mature?: boolean }) {
  const nodes = useMemo(() => {
    const base = [
      { x: 50, y: 50 },
      { x: 62, y: 40 },
      { x: 39, y: 36 },
      { x: 66, y: 61 },
      { x: 34, y: 63 },
      { x: 52, y: 25 },
      { x: 75, y: 48 },
      { x: 25, y: 48 }
    ];
    return base.slice(0, Math.max(1, Math.min(base.length, step + 1)));
  }, [step]);
  return (
    <div className={cx('model-wrap', mature && 'is-mature')} aria-label="Current understanding model">
      <svg viewBox="0 0 100 100" className="model-svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0d39a" stopOpacity="1" />
            <stop offset="100%" stopColor="#f0d39a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {nodes.slice(1).map((node, index) => {
          const prev = nodes[Math.max(0, index)];
          return <line key={`line-${index}`} x1={prev.x} y1={prev.y} x2={node.x} y2={node.y} className={cx('model-line', step > 3 && 'strong')} />;
        })}
        {nodes.map((node, index) => (
          <g key={`node-${index}`} className={cx('model-node', index === nodes.length - 1 && 'new-node', tension && index === nodes.length - 1 && 'tension-node')}>
            <circle cx={node.x} cy={node.y} r={index === 0 ? 3.3 : 2.25} className="node-core" />
            <circle cx={node.x} cy={node.y} r={index === 0 ? 10 : 7} fill="url(#nodeGlow)" className="node-halo" />
          </g>
        ))}
      </svg>
      {step > 0 && <div className="score-chip">{score}% legible</div>}
    </div>
  );
}

function InspectionDrawer({ report, evidence, relationships, onClose }: { report: EngineReport; evidence: EvidenceObject[]; relationships: Relationship[]; onClose: () => void }) {
  return (
    <aside className="drawer">
      <div className="drawer-head">
        <div>
          <p className="eyebrow">Deeper inspection</p>
          <h2>{report.companyName}</h2>
        </div>
        <button className="ghost-button" onClick={onClose}>Close</button>
      </div>
      <section>
        <h3>Evidence</h3>
        {evidence.map((item) => <p key={item.id} className="drawer-row">{item.claim}<span>{item.confidence}%</span></p>)}
      </section>
      <section>
        <h3>Relationships</h3>
        {relationships.map((rel, index) => <p key={index} className="drawer-row">{rel.from} → {rel.to}<span>{rel.strength}%</span></p>)}
      </section>
      <section>
        <h3>Open questions</h3>
        {(report.openQuestions ?? []).slice(0, 5).map((q) => <p key={q} className="drawer-row solo">{q}</p>)}
      </section>
    </aside>
  );
}

function DeveloperPanel({ report, loadedDocs, onClose }: { report: EngineReport | null; loadedDocs: number; onClose: () => void }) {
  return (
    <aside className="developer-panel">
      <div className="drawer-head">
        <div>
          <p className="eyebrow">Developer mode</p>
          <h2>Engine inspection</h2>
        </div>
        <button className="ghost-button" onClick={onClose}>Close</button>
      </div>
      <div className="dev-grid">
        <span>Documents</span><b>{loadedDocs}</b>
        <span>Beliefs</span><b>{report?.beliefs?.length ?? 0}</b>
        <span>Evidence</span><b>{report?.evidenceObjects?.length ?? 0}</b>
        <span>Relationships</span><b>{report?.relationships?.length ?? 0}</b>
      </div>
      <pre>{JSON.stringify(report ?? { status: 'No engine report yet. Add evidence to inspect output.' }, null, 2)}</pre>
    </aside>
  );
}
