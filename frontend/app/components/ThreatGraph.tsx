"use client";

import { memo } from "react";

interface ThreatGraphProps {
  className?: string;
}

type GraphNode = {
  id: number;
  x: number;
  y: number;
  r: number;
  delay: number;
};

const VIEWBOX = "0 0 360 260";

const NODE_COLOR = "#34D8A6";
const EDGE_STROKE = "rgba(52,216,166,0.24)";
const EDGE_WIDTH = 1.25;
const EDGE_DELAY_STEP = 0.12;

const NODES = [
  { id: 0, x: 40, y: 60, r: 3.4, delay: 0 },
  { id: 1, x: 140, y: 30, r: 2.8, delay: 0.4 },
  { id: 2, x: 230, y: 90, r: 3.6, delay: 0.9 },
  { id: 3, x: 90, y: 150, r: 2.8, delay: 1.3 },
  { id: 4, x: 200, y: 180, r: 3.2, delay: 0.2 },
  { id: 5, x: 310, y: 50, r: 2.8, delay: 1.6 },
  { id: 6, x: 330, y: 160, r: 3.4, delay: 0.7 },
  { id: 7, x: 20, y: 220, r: 2.4, delay: 1.1 },
] as const satisfies readonly GraphNode[];

const EDGES = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [2, 4],
  [2, 5],
  [5, 6],
  [4, 6],
  [3, 7],
] as const;

export default memo(function ThreatGraph({
  className = "",
}: ThreatGraphProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} h-full w-full`}
      shapeRendering="geometricPrecision"
    >
      <g opacity={0.95}>
        {EDGES.map(([a, b], i) => {
          const from = NODES[a];
          const to = NODES[b];

          return (
            <line
              key={`${a}-${b}`}
              className="graph-edge"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={EDGE_STROKE}
              strokeWidth={EDGE_WIDTH}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{
                animationDelay: `${i * EDGE_DELAY_STEP}s`,
              }}
            />
          );
        })}
      </g>

      {NODES.map((node) => (
        <circle
          key={node.id}
          className="graph-node"
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill={NODE_COLOR}
          vectorEffect="non-scaling-stroke"
          style={{
            animationDelay: `${node.delay}s`,
            transformOrigin: `${node.x}px ${node.y}px`,
          }}
        />
      ))}
    </svg>
  );
});