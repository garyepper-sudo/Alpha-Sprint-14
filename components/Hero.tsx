export function Hero({ onStart }: { onStart: () => void }) {
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