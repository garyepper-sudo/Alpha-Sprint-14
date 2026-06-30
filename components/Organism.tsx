'use client';

import { useMemo } from 'react';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function Organism({
  step,
  score,
  tension,
  mature = false
}: {
  step: number;
  score: number;
  tension: boolean;
  mature?: boolean;
}) {
  const nodes = useMemo(() => {
    const base = [
      { x: 50, y: 50 },
      { x: 62, y: 40 },
      { x: 39, y: 36 },
      { x: 66, y: 61 },
      { x: 34, y: 63 },
      { x: 52, y: 25 },
      { x: 75, y: 48 },
      { x: 25, y: 48 }
    ];
    return base.slice(0, Math.max(1, Math.min(base.length, step + 1)));
  }, [step]);

  return (
    <div className={cx('model-wrap', mature && 'is-mature')} aria-label="Current understanding model">
      <svg viewBox="0 0 100 100" className="model-svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0d39a" stopOpacity="1" />
            <stop offset="100%" stopColor="#f0d39a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {nodes.slice(1).map((node, index) => {
          const prev = nodes[Math.max(0, index)];
          return (
            <line
              key={`line-${index}`}
              x1={prev.x}
              y1={prev.y}
              x2={node.x}
              y2={node.y}
              className={cx('model-line', step > 3 && 'strong')}
            />
          );
        })}

        {nodes.map((node, index) => (
          <g
            key={`node-${index}`}
            className={cx(
              'model-node',
              index === nodes.length - 1 && 'new-node',
              tension && index === nodes.length - 1 && 'tension-node'
            )}
          >
            <circle cx={node.x} cy={node.y} r={index === 0 ? 3.3 : 2.25} className="node-core" />
            <circle cx={node.x} cy={node.y} r={index === 0 ? 10 : 7} fill="url(#nodeGlow)" className="node-halo" />
          </g>
        ))}
      </svg>

      {step > 0 && <div className="score-chip">{score}% legible</div>}
    </div>
  );
}