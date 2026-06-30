import type { DemoDoc } from './types';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function UnderstandingTimeline({
  docs,
  loadedDocs,
  complete,
  latestShift,
  isAnalyzing
}: {
  docs: DemoDoc[];
  loadedDocs: number;
  complete: boolean;
  latestShift: string | null;
  isAnalyzing: boolean;
}) {
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
          <p>
            {isAnalyzing
              ? 'The model is checking whether this document strengthens, weakens, or revises the current belief.'
              : latestShift}
          </p>
        </div>
      )}
    </div>
  );
}