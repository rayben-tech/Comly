"use client";

interface SparklineProps {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = ((prev.x + curr.x) / 2).toFixed(1);
    d += ` C${cpx},${prev.y.toFixed(1)} ${cpx},${curr.y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
  }
  return d;
}

export function Sparkline({ values, color = "#22c55e", width = 80, height = 24 }: SparklineProps) {
  if (!values || values.length < 2) return <div style={{ width, height }} />;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padX = 1;
  const padY = 2;

  const pts = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * (width - padX * 2),
    y: padY + ((max - v) / range) * (height - padY * 2),
  }));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "hidden" }}
    >
      <path
        d={smoothPath(pts)}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function generateTrend(base: number, up: boolean, points = 8): number[] {
  const result: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const noise = (Math.random() - 0.5) * 8;
    const val = up
      ? Math.max(0, base - 18 + t * 20 + noise)
      : Math.max(0, base + 18 - t * 20 + noise);
    result.push(Math.round(val));
  }
  result[result.length - 1] = base;
  return result;
}
