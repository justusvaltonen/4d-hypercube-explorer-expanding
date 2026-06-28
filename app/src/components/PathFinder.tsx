import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findShortestPath, parsePoint, formatPoint } from '@/lib/hypercubeMath';
import type { Point4D, PathResult } from '@/types';
import { ArrowRight, Shuffle, Copy, Check } from 'lucide-react';
import Hypercube3D from './Hypercube3D';

const PRESET_PAIRS: Array<{ from: string; to: string; name: string }> = [
  { from: '1.1.1.1', to: '3.3.3.3', name: 'Maximum Distance (Corners)' },
  { from: '3.1.3.1', to: '1.3.1.3', name: 'Diagonal Opposites' },
  { from: '2.2.2.1', to: '2.2.2.3', name: 'Single Axis (W only)' },
  { from: '1.1.1.1', to: '2.2.2.2', name: 'Center Out' },
  { from: '3.1.3.1', to: '3.2.3.2', name: 'Adjacent (2D)' },
  { from: '1.2.3.1', to: '3.1.2.3', name: 'Mixed All Axes' },
];

export default function PathFinder() {
  const [fromStr, setFromStr] = useState('1.1.1.1');
  const [toStr, setToStr] = useState('3.3.3.3');
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const calculatePath = useCallback(() => {
    const from = parsePoint(fromStr);
    const to = parsePoint(toStr);

    if (!from) {
      setError(`Invalid "From" point: "${fromStr}". Use format X.Y.Z.W (1-3 each)`);
      return;
    }
    if (!to) {
      setError(`Invalid "To" point: "${toStr}". Use format X.Y.Z.W (1-3 each)`);
      return;
    }

    if (formatPoint(from) === formatPoint(to)) {
      setError('Start and end points must be different');
      return;
    }

    setError(null);
    const result = findShortestPath(from, to);
    setPathResult(result);
  }, [fromStr, toStr]);

  useEffect(() => {
    calculatePath();
  }, []);

  const handleRandomize = () => {
    let f: Point4D, t: Point4D;
    do {
      f = [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1] as Point4D;
      t = [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1] as Point4D;
    } while (formatPoint(f) === formatPoint(t));
    setFromStr(formatPoint(f));
    setToStr(formatPoint(t));
    setTimeout(() => calculatePath(), 10);
  };

  const handleCopyPath = () => {
    if (!pathResult) return;
    const text = `${formatPoint(pathResult.from)} → ${formatPoint(pathResult.to)}\nDistance: ${pathResult.distance}\n\nSteps:\n${pathResult.steps.map((s, i) => `${i}. ${formatPoint(s)}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fromPoint = parsePoint(fromStr);
  const toPoint = parsePoint(toStr);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Start Point (X.Y.Z.W)</label>
            <input
              type="text"
              value={fromStr}
              onChange={(e) => setFromStr(e.target.value)}
              placeholder="1.1.1.1"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">End Point (X.Y.Z.W)</label>
            <input
              type="text"
              value={toStr}
              onChange={(e) => setToStr(e.target.value)}
              placeholder="3.3.3.3"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={calculatePath}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={handleRandomize}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
              title="Randomize"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap">
        {PRESET_PAIRS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setFromStr(preset.from);
              setToStr(preset.to);
              setTimeout(() => calculatePath(), 10);
            }}
            className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600 border border-slate-600 rounded text-xs text-slate-300 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {pathResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-400 uppercase">From</p>
              <p className="text-lg font-mono font-bold text-green-400">{formatPoint(pathResult.from)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
              <p className="text-xs text-slate-400 uppercase">Distance</p>
              <p className="text-3xl font-bold text-amber-400">{pathResult.distance}</p>
              <p className="text-xs text-slate-500">Manhattan Distance</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-right">
              <p className="text-xs text-slate-400 uppercase">To</p>
              <p className="text-lg font-mono font-bold text-red-400">{formatPoint(pathResult.to)}</p>
            </div>
          </div>

          {/* 3D Visualization */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-700">
              <h3 className="text-sm font-semibold text-white">3D Projection of Path</h3>
              <button
                onClick={handleCopyPath}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Path'}
              </button>
            </div>
            <div className="h-[400px]">
              <Hypercube3D
                pathSteps={pathResult?.steps || []}
                startPoint={fromPoint}
                endPoint={toPoint}
              />
            </div>
          </div>

          {/* Step-by-step breakdown */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-slate-700">
              <h3 className="text-sm font-semibold text-white">Step-by-Step Path</h3>
            </div>
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Step</th>
                    <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Coordinates</th>
                    <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Direction</th>
                    <th className="px-4 py-2 text-left text-xs text-slate-400 font-medium">Δ per axis</th>
                  </tr>
                </thead>
                <tbody>
                  {pathResult.steps.map((step, i) => {
                    const direction = i < pathResult.directionLabels.length ? pathResult.directionLabels[i] : '—';
                    const deltaFrom = i > 0 ? pathResult.steps[i - 1] : null;
                    const deltaDisplay = deltaFrom
                      ? `X:${Math.abs(step[0] - deltaFrom[0])} Y:${Math.abs(step[1] - deltaFrom[1])} Z:${Math.abs(step[2] - deltaFrom[2])} W:${Math.abs(step[3] - deltaFrom[3])}`
                      : '—';

                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-t border-slate-700/50 ${
                          i === 0 ? 'bg-green-900/20' : i === pathResult.steps.length - 1 ? 'bg-red-900/20' : ''
                        }`}
                      >
                        <td className="px-4 py-2 text-slate-400 font-mono">{i}</td>
                        <td className="px-4 py-2 font-mono text-white">{formatPoint(step)}</td>
                        <td className="px-4 py-2 text-blue-300">{direction}</td>
                        <td className="px-4 py-2 text-slate-400 font-mono text-xs">{deltaDisplay}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formula breakdown */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Distance Formula Breakdown</h3>
            <div className="font-mono text-sm space-y-1">
              <p className="text-slate-400">
                d({formatPoint(pathResult.from)}, {formatPoint(pathResult.to)}) =
              </p>
              <p className="text-slate-300 pl-4">
                |{pathResult.from[0]} - {pathResult.to[0]}| + |{pathResult.from[1]} - {pathResult.to[1]}| + |{pathResult.from[2]} - {pathResult.to[2]}| + |{pathResult.from[3]} - {pathResult.to[3]}|
              </p>
              <p className="text-slate-300 pl-4">
                = {Math.abs(pathResult.from[0] - pathResult.to[0])} + {Math.abs(pathResult.from[1] - pathResult.to[1])} + {Math.abs(pathResult.from[2] - pathResult.to[2])} + {Math.abs(pathResult.from[3] - pathResult.to[3])}
              </p>
              <p className="text-amber-400 font-bold pl-4">= {pathResult.distance}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
