import type { BeliefObject, EngineReport } from './types';

export function ActionPanel({
  report,
  belief,
  complete
}: {
  report: EngineReport;
  belief?: BeliefObject;
  complete: boolean;
}) {
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
      ...(report.decisionSupport?.evidenceToBring?.length
        ? report.decisionSupport.evidenceToBring
        : report.evidenceObjects.slice(0, 5).map((item) => `${item.source}: ${item.claim}`)
      ).map((item) => `- ${item}`),
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