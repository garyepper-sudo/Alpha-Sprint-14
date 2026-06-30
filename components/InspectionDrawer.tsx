import type { EngineReport, EvidenceObject, Relationship } from './types';

export function InspectionDrawer({
  report,
  evidence,
  relationships,
  onClose
}: {
  report: EngineReport;
  evidence: EvidenceObject[];
  relationships: Relationship[];
  onClose: () => void;
}) {
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