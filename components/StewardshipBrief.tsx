import type { BeliefObject, EngineReport, InsightFeedback } from './types';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function StewardshipBrief({
  belief,
  report,
  onBegin,
  feedback,
  onFeedback
}: {
  belief?: BeliefObject;
  report: EngineReport | null;
  onBegin: () => void;
  feedback: InsightFeedback;
  onFeedback: (value: InsightFeedback) => void;
}) {
  const takeaway = belief?.belief ?? report?.brief?.[0] ?? 'Discovery has formed a current best understanding from the evidence.';
  const whyItMatters = belief?.whyItMatters ?? report?.brief?.[1] ?? 'This changes which assumptions leadership should test before making the next decision.';
  const action = report?.decisionSupport?.nextStep ?? report?.nextBestEvidence?.[0] ?? 'Collect one independent source that could challenge the current belief.';
  const whyAction = report?.openQuestions?.[0]
    ?? 'This is the highest-leverage action because it tests the assumption most likely to confirm, refine, or overturn the current understanding.';
  const onlyOneThing = report?.decisionSupport?.suggestedMeeting
    ?? 'Pressure-test the current belief before treating it as settled strategy.';
  const nextEvidence = report?.nextBestEvidence?.slice(0, 4) ?? [
    'Customer interviews that contradict or refine the current belief',
    'Internal strategy documents that show how leadership already thinks about this issue',
    'Operational data that tests whether the belief shows up in behavior',
    'A dissenting source that would force Discovery to revise the model'
  ];

  return (
    <div className="aha-prompt stewardship-brief">
      <p className="eyebrow">Stewardship brief</p>
      <h2>Takeaway, action, and why it matters.</h2>
      <p className="brief-intro">Discovery has formed a current best understanding. The next step is to decide what leadership should do with it.</p>

      <div className="stewardship-section">
        <span>Strategic takeaway</span>
        <p>{takeaway}</p>
      </div>

      <div className="stewardship-section">
        <span>Why this matters</span>
        <p>{whyItMatters}</p>
      </div>

      <div className="stewardship-section action-highlight">
        <span>Executive action</span>
        <p>{action}</p>
      </div>

      <div className="stewardship-section">
        <span>Why this action</span>
        <p>{whyAction}</p>
      </div>

      <div className="only-one-thing">
        <span>If you only do one thing</span>
        <p>{onlyOneThing}</p>
      </div>

      <div className="aha-meta">
        <span><b>{report?.sourceCount ?? 6}</b> sources</span>
        <span><b>{belief?.confidence ?? report?.understandingScore ?? 0}%</b> confidence</span>
      </div>

      <div className="usefulness-check">
        <span>Was this useful?</span>
        <div className="feedback-grid">
          <button className={cx('secondary-button', feedback === 'new' && 'is-selected')} onClick={() => onFeedback('new')}>New insight</button>
          <button className={cx('secondary-button', feedback === 'confirmed' && 'is-selected')} onClick={() => onFeedback('confirmed')}>Confirmed a suspicion</button>
          <button className={cx('secondary-button', feedback === 'known' && 'is-selected')} onClick={() => onFeedback('known')}>I already knew this</button>
          <button className={cx('secondary-button', feedback === 'disagree' && 'is-selected')} onClick={() => onFeedback('disagree')}>I disagree</button>
        </div>
      </div>

      {feedback === 'known' && (
        <div className="deeper-mode">
          <span>Current understanding appears established.</span>
          <p>Great. Discovery should now move one layer deeper instead of repeating what leadership already knows.</p>
          <ul>
            {nextEvidence.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {feedback === 'disagree' && (
        <div className="deeper-mode tension-mode">
          <span>Contradictory evidence needed.</span>
          <p>Excellent. Upload evidence that challenges this belief so Discovery can revise the model instead of defending the current answer.</p>
        </div>
      )}

      {feedback === 'confirmed' && (
        <div className="deeper-mode">
          <span>Confirmed understanding.</span>
          <p>Discovery should now look for the assumption beneath this belief that leadership has not fully tested.</p>
        </div>
      )}

      {feedback === 'new' && (
        <div className="deeper-mode">
          <span>New insight captured.</span>
          <p>The next investigation should test whether this belief changes decisions, resourcing, or timing.</p>
        </div>
      )}

      <button className="primary-button full begin-button" onClick={onBegin}>Begin private investigation</button>
    </div>
  );
}