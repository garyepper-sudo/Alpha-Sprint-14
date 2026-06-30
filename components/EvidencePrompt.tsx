import type { DemoDoc } from './types';

export function EvidencePrompt({
  doc,
  step,
  total,
  isAnalyzing,
  onAdd
}: {
  doc?: DemoDoc;
  step: number;
  total: number;
  isAnalyzing: boolean;
  onAdd: () => void;
}) {
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