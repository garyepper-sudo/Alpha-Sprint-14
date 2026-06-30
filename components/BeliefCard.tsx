import type { BeliefObject, EngineReport } from './types';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function BeliefCard({
  belief,
  report,
  flipped,
  setFlipped,
  onInspect
}: {
  belief?: BeliefObject;
  report: EngineReport;
  flipped: boolean;
  setFlipped: (value: boolean) => void;
  onInspect: () => void;
}) {
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