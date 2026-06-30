export function PrivateWorkspace({
  value,
  onChange,
  onRestart
}: {
  value: string;
  onChange: (value: string) => void;
  onRestart: () => void;
}) {
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
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="A strategic uncertainty, operating tension, customer pattern, or decision you need to understand…"
          autoFocus
        />
        <div className="private-actions">
          <button className="primary-button" disabled={!value.trim()}>Begin private investigation</button>
          <button className="secondary-button" onClick={onRestart}>Replay public journey</button>
        </div>
      </div>
    </div>
  );
}