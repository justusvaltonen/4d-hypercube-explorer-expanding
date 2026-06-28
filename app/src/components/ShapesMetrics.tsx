import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Diamond, Box, Layers, Sigma,
  ArrowRightLeft, Maximize2
} from 'lucide-react';

/* ═══════════════════════════════════════════
   Lp NORM SHAPE VISUALIZER (2D canvas)
   ═══════════════════════════════════════════ */

type NormType = 'l1' | 'l2' | 'linf';

interface NormDef {
  id: NormType;
  name: string;
  formula: string;
  desc: string;
  color: string;
  shape2d: string;
  shape3d: string;
  shape4d: string;
}

const NORMS: NormDef[] = [
  {
    id: 'l1',
    name: 'L₁ — Manhattan',
    formula: '|x₁| + |x₂| + ... + |xₙ|',
    desc: 'Sum of absolute coordinate differences. The "taxicab" distance.',
    color: '#22d3ee',
    shape2d: 'Diamond (rotated square)',
    shape3d: 'Octahedron',
    shape4d: '16-cell (hexadecachoron)',
  },
  {
    id: 'l2',
    name: 'L₂ — Euclidean',
    formula: '√(x₁² + x₂² + ... + xₙ²)',
    desc: 'Straight-line distance. Our intuitive notion of "as the crow flies".',
    color: '#f472b6',
    shape2d: 'Circle',
    shape3d: 'Sphere',
    shape4d: 'Hypersphere (3-sphere)',
  },
  {
    id: 'linf',
    name: 'L∞ — Chebyshev',
    formula: 'max(|x₁|, |x₂|, ..., |xₙ|)',
    desc: 'Maximum single-axis difference. King moves in chess.',
    color: '#a78bfa',
    shape2d: 'Square (axis-aligned)',
    shape3d: 'Cube',
    shape4d: 'Tesseract (4-cube)',
  },
];

function drawUnitBall(
  ctx: CanvasRenderingContext2D,
  norm: NormType,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  fillAlpha: number
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.lineWidth = 2.5;

  const steps = 360;
  const pts: [number, number][] = [];

  for (let a = 0; a <= steps; a++) {
    const rad = (a * Math.PI) / 180;
    let x = Math.cos(rad);
    let y = Math.sin(rad);

    // Normalise to unit ball for this norm
    if (norm === 'l1') {
      const scale = Math.abs(x) + Math.abs(y);
      if (scale > 0) { x /= scale; y /= scale; }
    } else if (norm === 'l2') {
      // already on unit circle
    } else if (norm === 'linf') {
      const scale = Math.max(Math.abs(x), Math.abs(y));
      if (scale > 0) { x /= scale; y /= scale; }
    }

    pts.push([cx + x * radius, cy + y * radius]);
  }

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();

  // Axes
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(cx - radius - 10, cy);
  ctx.lineTo(cx + radius + 10, cy);
  ctx.moveTo(cx, cy - radius - 10);
  ctx.lineTo(cx, cy + radius + 10);
  ctx.stroke();

  ctx.restore();
}

function UnitBallCanvas({ norm, activeNorms }: { norm: NormType; activeNorms: Set<NormType> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const def = NORMS.find((n) => n.id === norm)!;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }

    // Draw all active norms
    const cx = size / 2;
    const cy = size / 2;
    const radius = 75;

    // Draw order: linf (largest) first, then l1, then l2
    const order: NormType[] = ['linf', 'l1', 'l2'];
    order.forEach((n) => {
      if (activeNorms.has(n)) {
        const d = NORMS.find((x) => x.id === n)!;
        drawUnitBall(ctx, n, cx, cy, radius, d.color, n === norm ? 0.15 : 0.06);
      }
    });

    // Highlight label
    ctx.fillStyle = def.color;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${def.id.toUpperCase()} unit ball`, cx, size - 10);
  }, [norm, activeNorms, def]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-slate-700"
      style={{ width: 220, height: 220 }}
    />
  );
}

/* ═══════════════════════════════════════════
   HYPERSPHERE VOLUME CHART
   ═══════════════════════════════════════════ */

function hypersphereVolume(n: number): number {
  // Volume of unit n-ball: V_n = π^(n/2) / Γ(n/2 + 1)
  // Using approximation for integer n
  if (n === 0) return 1;
  if (n === 1) return 2;
  let vol = Math.pow(Math.PI, n / 2);
  let gamma = 1;
  for (let k = 1; k <= n; k++) {
    gamma *= k;
  }
  // Γ(n/2 + 1) for even n: (n/2)!
  // for odd n: (n!! / 2^((n+1)/2)) * √π
  if (n % 2 === 0) {
    let fact = 1;
    for (let k = 1; k <= n / 2; k++) fact *= k;
    return vol / fact;
  } else {
    let doubleFact = 1;
    for (let k = 1; k <= n; k += 2) doubleFact *= k;
    return vol / ((doubleFact * Math.sqrt(Math.PI)) / Math.pow(2, (n + 1) / 2));
  }
}

function VolumeChart() {
  const dims = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const volumes = dims.map((d) => hypersphereVolume(d));
  const maxVol = Math.max(...volumes);
  const peakDim = dims[volumes.indexOf(maxVol)];

  return (
    <div className="bg-slate-900/60 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sigma className="w-4 h-4 text-pink-400" />
          Hypersphere Volume vs Dimension
        </h4>
        <span className="text-xs text-pink-400 font-mono bg-pink-500/10 px-2 py-0.5 rounded">
          Peak at dimension {peakDim}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        The volume of a unit Euclidean n-ball peaks at dimension {peakDim} and then <strong>decreases</strong>, 
        approaching zero! A 10D ball has less volume than a 5D one.
      </p>

      <div className="flex items-end gap-2 h-40 px-2">
        {dims.map((d, i) => {
          const h = (volumes[i] / maxVol) * 100;
          const isPeak = d === peakDim;
          return (
            <div key={d} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-500 font-mono">{volumes[i].toFixed(2)}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(h, 2)}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className={`w-full rounded-t ${isPeak ? 'bg-pink-500' : 'bg-slate-600'}`}
                style={{ minHeight: 4 }}
              />
              <span className={`text-[10px] font-mono ${isPeak ? 'text-pink-400 font-bold' : 'text-slate-500'}`}>
                {d}D
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-pink-950/30 border border-pink-800/30 rounded-lg">
        <p className="text-xs text-pink-200">
          <strong>The Paradox:</strong> In high dimensions, almost all the volume of a ball 
          concentrates near its surface. By dimension 20+, a ball is essentially an empty shell. 
          This is why high-dimensional spaces behave so counter-intuitively.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DISTANCE CALCULATOR (compare norms)
   ═══════════════════════════════════════════ */

function distanceL1(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + Math.abs(ai - b[i]), 0);
}

function distanceL2(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0));
}

function distanceLinf(a: number[], b: number[]): number {
  return Math.max(...a.map((ai, i) => Math.abs(ai - b[i])));
}

function NormCalculator() {
  const [dim, setDim] = useState(4);
  const [pointA, setPointA] = useState<number[]>([1, 1, 1, 1]);
  const [pointB, setPointB] = useState<number[]>([3, 3, 3, 3]);
  const [activeNorms, setActiveNorms] = useState<Set<NormType>>(new Set(['l1', 'l2', 'linf']));

  const updatePoint = useCallback(
    (which: 'A' | 'B', idx: number, val: number) => {
      const setter = which === 'A' ? setPointA : setPointB;
      setter((prev) => {
        const next = [...prev];
        next[idx] = Math.max(0, Math.min(5, val));
        return next;
      });
    },
    []
  );

  const adjustDim = useCallback(
    (d: number) => {
      setDim(d);
      setPointA((p) => Array(d).fill(0).map((_, i) => p[i] ?? 2));
      setPointB((p) => Array(d).fill(0).map((_, i) => p[i] ?? 3));
    },
    []
  );

  const d1 = distanceL1(pointA, pointB);
  const d2 = distanceL2(pointA, pointB);
  const dinf = distanceLinf(pointA, pointB);

  const toggleNorm = (n: NormType) => {
    setActiveNorms((s) => {
      const ns = new Set(s);
      if (ns.has(n)) ns.delete(n);
      else ns.add(n);
      return ns;
    });
  };

  return (
    <div className="bg-slate-900/60 rounded-lg border border-slate-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
          Multi-Norm Distance Calculator
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Dimensions:</span>
          {[2, 3, 4, 5, 6].map((d) => (
            <button
              key={d}
              onClick={() => adjustDim(d)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                dim === d
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Points */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-green-400 mb-2 font-medium">Point A</p>
          <div className="flex gap-1">
            {pointA.map((v, i) => (
              <input
                key={`a-${i}`}
                type="number"
                min={0}
                max={5}
                value={v}
                onChange={(e) => updatePoint('A', i, Number(e.target.value))}
                className="w-12 px-1 py-1.5 bg-slate-800 border border-slate-600 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-green-500"
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-red-400 mb-2 font-medium">Point B</p>
          <div className="flex gap-1">
            {pointB.map((v, i) => (
              <input
                key={`b-${i}`}
                type="number"
                min={0}
                max={5}
                value={v}
                onChange={(e) => updatePoint('B', i, Number(e.target.value))}
                className="w-12 px-1 py-1.5 bg-slate-800 border border-slate-600 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-red-500"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Norm toggles & results */}
      <div className="space-y-2">
        {NORMS.map((n) => {
          const active = activeNorms.has(n.id);
          const val = n.id === 'l1' ? d1 : n.id === 'l2' ? d2 : dinf;
          return (
            <button
              key={n.id}
              onClick={() => toggleNorm(n.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                active
                  ? 'bg-slate-800 border-slate-600'
                  : 'bg-slate-800/30 border-slate-800 opacity-50'
              }`}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: n.color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{n.name}</span>
                  <span
                    className="text-lg font-mono font-bold"
                    style={{ color: n.color }}
                  >
                    {val.toFixed(3)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <code className="text-[10px] text-slate-500">{n.formula}</code>
                  <span className="text-[10px] text-slate-500">{n.desc}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Relationship box */}
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-300">
          <strong className="text-amber-400">Always true:</strong> L₁ ≥ L₂ ≥ L∞ for any two points.
          {' '}Check: {d1.toFixed(2)} ≥ {d2.toFixed(2)} ≥ {dinf.toFixed(2)} {' '}
          {d1 >= d2 && d2 >= dinf ? '✓' : '✗'}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          Manhattan gives the largest distance, Euclidean is middle, Chebyshev gives the smallest.
          Equality holds only when all coordinate differences are equal.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUBSPACE EMBEDDING VISUALIZER
   ═══════════════════════════════════════════ */

function SubspaceEmbed() {
  const [subDim, setSubDim] = useState<2 | 3>(2);
  const embedCoords = subDim === 2
    ? ['x', 'y', 'fixed=2', 'fixed=2']
    : ['x', 'y', 'z', 'fixed=2'];

  return (
    <div className="bg-slate-900/60 rounded-lg border border-slate-700 p-4 space-y-4">
      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
        <Layers className="w-4 h-4 text-emerald-400" />
        Subspace Embedding
      </h4>

      <p className="text-xs text-slate-400">
        A point doesn't need all dimensions. A 2D point <code className="text-slate-300">(x, y)</code> can live inside 4D space 
        as <code className="text-slate-300">(x, y, 2, 2)</code> — it's embedded in a 2D "slice" of the 4D hypercube.
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setSubDim(2)}
          className={`px-3 py-1.5 rounded text-xs transition-colors ${
            subDim === 2
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          2D slice in 4D
        </button>
        <button
          onClick={() => setSubDim(3)}
          className={`px-3 py-1.5 rounded text-xs transition-colors ${
            subDim === 3
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          3D slice in 4D
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-2">Embedded in 4D as:</p>
          <div className="font-mono text-sm space-y-1">
            {embedCoords.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-500 w-4">{['x','y','z','w'][i]} =</span>
                <span className={c.startsWith('fixed') ? 'text-amber-400' : 'text-white'}>
                  {c.startsWith('fixed') ? c.split('=')[1] : c}
                </span>
                {c.startsWith('fixed') && (
                  <span className="text-[10px] text-slate-600">(constant)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
          <p className="text-xs text-slate-500">What this means:</p>
          <ul className="text-xs text-slate-300 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>
                The embedded subspace contains <strong className="text-white">{subDim === 2 ? '9' : '27'}</strong> points,
                not 81.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>
                Distances within the slice match the {subDim}D formula exactly.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>
                There are multiple slices: w=1, w=2, w=3 are three separate 3D cubes inside the 4D hypercube.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Visualization of slices */}
      <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
        <p className="text-xs text-slate-400 mb-3">The 3×3×3×3 hypercube contains <strong className="text-white">three</strong> 3×3×3 cubes as W-slices:</p>
        <div className="flex gap-4 justify-center">
          {[1, 2, 3].map((w) => (
            <div key={w} className="text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded border border-slate-600 flex items-center justify-center mb-1">
                <span className="text-2xl text-slate-500">□</span>
              </div>
              <span className="text-xs font-mono text-slate-400">W={w}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          Each cube is a 3D subspace. Points like (2,2,2,1) and (2,2,2,3) are in different slices — 
          distance = 2 (only W differs).
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════ */

type ShapeTab = 'norms' | 'volumes' | 'calculator' | 'embedding';

export default function ShapesMetrics() {
  const [tab, setTab] = useState<ShapeTab>('norms');
  const [activeNorms, setActiveNorms] = useState<Set<NormType>>(new Set(['l1', 'l2', 'linf']));

  const tabs: { id: ShapeTab; label: string; icon: React.ReactNode }[] = [
    { id: 'norms', label: 'Norm Shapes', icon: <Diamond className="w-4 h-4" /> },
    { id: 'volumes', label: 'Volume Paradox', icon: <Maximize2 className="w-4 h-4" /> },
    { id: 'calculator', label: 'Norm Calculator', icon: <Sigma className="w-4 h-4" /> },
    { id: 'embedding', label: 'Subspaces', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Box className="w-5 h-5 text-amber-400" />
          Distance, Shapes & Higher Dimensions
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          The Manhattan formula <code className="text-amber-400">d = Σ|aᵢ − bᵢ|</code> really IS universal — 
          it works identically in any number of dimensions. The "simplicity" is its power: it's an 
          <strong className="text-white"> L₁ norm</strong>, one of infinitely many ways to measure distance. 
          Depending on which "norm" you choose, a "unit ball" becomes a diamond, circle, or square. 
          And in high dimensions, spheres behave in ways that defy intuition.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              tab === t.id
                ? 'text-amber-400 border-amber-400 bg-slate-700/30'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-700/20'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'norms' && (
            <div className="space-y-6">
              {/* Norm toggle */}
              <div className="flex gap-3 flex-wrap">
                {NORMS.map((n) => {
                  const active = activeNorms.has(n.id);
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        setActiveNorms((s) => {
                          const ns = new Set(s);
                          if (ns.has(n.id)) ns.delete(n.id);
                          else ns.add(n.id);
                          return ns;
                        });
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                        active
                          ? 'bg-slate-800 border-slate-600 text-white'
                          : 'bg-slate-800/30 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: n.color }}
                      />
                      {n.name}
                    </button>
                  );
                })}
              </div>

              {/* Shape canvases */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {NORMS.map((n) => (
                  <div key={n.id} className="flex flex-col items-center gap-3">
                    <UnitBallCanvas norm={n.id} activeNorms={activeNorms} />
                    <div className="text-center space-y-1 w-full">
                      <p className="text-sm font-semibold" style={{ color: n.color }}>
                        {n.name}
                      </p>
                      <code className="text-[10px] text-slate-500 block">{n.formula}</code>
                      <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-400 mt-2">
                        <div className="bg-slate-800/50 rounded p-1">
                          <span className="text-slate-500 block">2D</span>
                          <span className="text-slate-300">{n.shape2d}</span>
                        </div>
                        <div className="bg-slate-800/50 rounded p-1">
                          <span className="text-slate-500 block">3D</span>
                          <span className="text-slate-300">{n.shape3d}</span>
                        </div>
                        <div className="bg-slate-800/50 rounded p-1">
                          <span className="text-slate-500 block">4D</span>
                          <span className="text-slate-300">{n.shape4d}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700 space-y-3">
                <p className="text-sm text-slate-300">
                  The canvas above shows the <strong className="text-white">unit ball</strong> — all points at distance ≤ 1 from the origin — under each norm. Toggle the buttons above to overlay them:
                </p>
                <ul className="text-sm text-slate-400 space-y-1.5">
                  <li><span className="text-cyan-400 font-mono">L₁</span> — The diamond is the smallest. Every diagonal step counts as 2 (sum of both axes).</li>
                  <li><span className="text-pink-400 font-mono">L₂</span> — The circle sits in between. Diagonals get the √2 discount.</li>
                  <li><span className="text-violet-400 font-mono">L∞</span> — The square is largest. Only the longest axis matters; diagonals are "free."</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'volumes' && <VolumeChart />}

          {tab === 'calculator' && <NormCalculator />}

          {tab === 'embedding' && <SubspaceEmbed />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
