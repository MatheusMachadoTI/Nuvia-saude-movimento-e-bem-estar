import { formatDate } from '../utils/date.js';

export function BarChart({ values, labels, color, max }) {
  const scale = max || Math.max(...values, 1);

  return (
    <svg viewBox={`0 0 ${values.length * 44} 110`} width="100%" role="img">
      {values.map((value, index) => {
        const height = (value / scale) * 72;
        return (
          <g key={`${labels[index]}-${index}`}>
            <rect
              x={index * 44 + 8}
              y={80 - height}
              width="28"
              height={Math.max(height, value ? 3 : 0)}
              rx="8"
              fill={color}
            />
            <text
              x={index * 44 + 22}
              y="100"
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              opacity=".7"
            >
              {labels[index]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function WeightChart({ points }) {
  if (points.length < 2) return null;

  const values = points.map(point => point.v);
  const minimum = Math.min(...values) - 0.5;
  const maximum = Math.max(...values) + 0.5;
  const width = 320;
  const coordinates = points.map((point, index) => [
    10 + (index * (width - 20)) / (points.length - 1),
    90 - ((point.v - minimum) / (maximum - minimum)) * 70,
  ]);

  return (
    <svg viewBox={`0 0 ${width} 110`} width="100%" role="img" aria-label="Gráfico de peso">
      <polyline
        points={coordinates.map(point => point.join(',')).join(' ')}
        fill="none"
        stroke="#FE492A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coordinates.map(([x, y], index) => (
        <g key={`${points[index].d}-${index}`}>
          <circle cx={x} cy={y} r="5" fill="#16336F" />
          <text
            x={x}
            y="106"
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            opacity=".7"
          >
            {formatDate(points[index].d)}
          </text>
        </g>
      ))}
    </svg>
  );
}
