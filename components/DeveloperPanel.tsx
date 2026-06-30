import type { EngineReport } from './types';

export function DeveloperPanel({
  report,
  loadedDocs,
  onClose
}: {
  report: EngineReport | null;
  loadedDocs: number;
  onClose: () => void;
}) {
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