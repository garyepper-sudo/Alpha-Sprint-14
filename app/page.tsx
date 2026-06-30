'use client';

import { useEffect, useState } from 'react';

import { ActionPanel } from '../components/ActionPanel';
import { BeliefCard } from '../components/BeliefCard';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { EvidencePrompt } from '../components/EvidencePrompt';
import { Hero } from '../components/Hero';
import { InspectionDrawer } from '../components/InspectionDrawer';
import { Organism } from '../components/Organism';
import { PrivateWorkspace } from '../components/PrivateWorkspace';
import { StewardshipBrief } from '../components/StewardshipBrief';
import { UnderstandingTimeline } from '../components/UnderstandingTimeline';

import type { DemoDoc, EngineReport, InsightFeedback } from '../components/types';

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
  const [insightFeedback, setInsightFeedback] = useState<InsightFeedback>(null);

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

  const currentUnderstanding =
    topBelief?.belief ??
    (started ? 'Understanding begins with the next piece of evidence.' : 'Organizational understanding emerges.');

  const score = report?.understandingScore ?? (started ? 1 : 0);

  async function addNextEvidence() {
    if (!nextDoc || isAnalyzing) return;

    setIsAnalyzing(true);
    setFlipped(false);
    setInspecting(false);
    setInsightFeedback(null);
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

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: form
      });

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
    setInsightFeedback(null);
  }

  return (
    <main className="workspace-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <section
        className={cx(
          'workspace',
          started && 'workspace-started',
          complete && 'workspace-complete',
          privateMode && 'workspace-private'
        )}
      >
        <header className="topbar">
          <button className="brand" onClick={restart} aria-label="Discovery home">
            <span className="brand-mark" />
            <span>Discovery</span>
          </button>

          <div className="topbar-right">
            {started && <span className="quiet-pill">NVIDIA public journey</span>}
            <button className="ghost-button" onClick={() => setDeveloperMode((value) => !value)}>
              ⌘⇧D
            </button>
          </div>
        </header>

        {!started ? (
          <Hero
            onStart={() => {
              setStarted(true);
              setMessage('Discovery is waiting for evidence.');
              setTimeout(() => setMessage(null), 1800);
            }}
          />
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

              <Organism
                step={loadedDocs}
                score={score}
                tension={(report?.contradictions?.length ?? 0) > 0}
                mature={showingAha}
              />

              <UnderstandingTimeline
                docs={nvidiaDocs}
                loadedDocs={loadedDocs}
                complete={complete}
                latestShift={latestShift}
                isAnalyzing={isAnalyzing}
              />
            </section>

            <section className="evidence-rail">
              {!complete ? (
                <EvidencePrompt
                  doc={nextDoc}
                  step={loadedDocs + 1}
                  total={nvidiaDocs.length}
                  isAnalyzing={isAnalyzing}
                  onAdd={addNextEvidence}
                />
              ) : (
                <StewardshipBrief
                  belief={topBelief}
                  report={report}
                  onBegin={() => setPrivateMode(true)}
                  feedback={insightFeedback}
                  onFeedback={setInsightFeedback}
                />
              )}

              {report && (
                <BeliefCard
                  belief={topBelief}
                  report={report}
                  flipped={flipped}
                  setFlipped={setFlipped}
                  onInspect={() => setInspecting(true)}
                />
              )}

              {report && <ActionPanel report={report} belief={topBelief} complete={complete} />}
            </section>

            {report && !complete && (
              <section className="emergence-panel">
                <div className="panel-header">
                  <p className="eyebrow">What changed</p>
                  <span>
                    {loadedDocs}/{nvidiaDocs.length} sources
                  </span>
                </div>

                <div className="mini-stack">
                  {visibleRelationships.length > 0 && (
                    <div className="mini-card">
                      <span>Relationships</span>
                      {visibleRelationships.map((rel, index) => (
                        <p key={`${rel.from}-${rel.to}-${index}`}>
                          {rel.from} <b>→</b> {rel.to}
                        </p>
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
                    <p>
                      {report.nextBestEvidence?.[0] ??
                        report.openQuestions?.[0] ??
                        'Add an independent source from a different perspective.'}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      {message && <div className="change-note">{message}</div>}

      {inspecting && report && (
        <InspectionDrawer
          report={report}
          evidence={visibleEvidence}
          relationships={visibleRelationships}
          onClose={() => setInspecting(false)}
        />
      )}

      {developerMode && (
        <DeveloperPanel report={report} loadedDocs={loadedDocs} onClose={() => setDeveloperMode(false)} />
      )}
    </main>
  );
}