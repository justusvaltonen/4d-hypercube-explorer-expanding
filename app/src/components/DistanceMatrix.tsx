import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DISTANCE_MATRIX, ALL_POINTS, DISTANCE_STATS } from '@/lib/hypercubeMath';
import { ZoomIn, ZoomOut, BarChart3 } from 'lucide-react';

const COLORS = [
  '#0f172a', '#1e3a5f', '#1e5a8a', '#2563eb', '#3b82f6',
  '#60a5fa', '#93c5fd', '#dbeafe', '#fef3c7', '#fde68a',
  '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b'
];

function getDistanceColor(d: number): string {
  return COLORS[Math.min(d, COLORS.length - 1)];
}

export default function DistanceMatrix() {
  const [zoom, setZoom] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number; d: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [filterDistance, setFilterDistance] = useState<number | null>(null);

  const stats = DISTANCE_STATS;
  const distribution = useMemo(() => {
    const sorted = [...stats.distanceDistribution.entries()].sort((a, b) => a[0] - b[0]);
    return sorted;
  }, [stats]);

  const maxCount = useMemo(() => {
    return Math.max(...distribution.map(([, count]) => count));
  }, [distribution]);

  const filteredPoints = useMemo(() => {
    if (filterDistance === null || selectedPoint === null) return null;
    return ALL_POINTS.filter((_, i) => DISTANCE_MATRIX[selectedPoint][i] === filterDistance);
  }, [filterDistance, selectedPoint]);

  const cellSize = Math.max(4, 10 * zoom);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Max Distance</p>
          <p className="text-2xl font-bold text-white">{stats.maxDistance}</p>
          <p className="text-xs text-slate-500">Ex: 1.1.1.1 → 3.3.3.3</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Min Distance</p>
          <p className="text-2xl font-bold text-white">{stats.minDistance}</p>
          <p className="text-xs text-slate-500">Adjacent points</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Avg Distance</p>
          <p className="text-2xl font-bold text-white">{stats.avgDistance.toFixed(2)}</p>
          <p className="text-xs text-slate-500">Across all pairs</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Total Pairs</p>
          <p className="text-2xl font-bold text-white">{stats.totalPairs.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Unique combinations</p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div
          className="flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
          onClick={() => setShowChart(!showChart)}
        >
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Distance Distribution</h3>
          <span className="text-xs text-slate-500 ml-auto">{showChart ? 'Collapse' : 'Expand'}</span>
        </div>
        <motion.div
          initial={false}
          animate={{ height: showChart ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="p-4 space-y-2">
            {distribution.map(([dist, count]) => (
              <div key={dist} className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 w-6">{dist}</span>
                <div className="flex-1 h-6 bg-slate-700/50 rounded overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: dist * 0.05 }}
                    className="h-full rounded"
                    style={{ backgroundColor: getDistanceColor(dist) }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium">
                    {count} pairs ({((count / stats.totalPairs) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Interactive Matrix */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-white">Interactive Distance Matrix (81 × 81)</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 w-12 text-center">{zoom.toFixed(1)}x</span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.2))}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-auto p-4" style={{ maxHeight: '500px' }}>
          <div className="inline-block">
            {/* Column headers */}
            <div className="flex">
              <div className="w-12 h-12 flex-shrink-0" />
              {ALL_POINTS.map((p, i) => (
                <div
                  key={`col-${i}`}
                  className="flex items-center justify-center text-[8px] text-slate-500 flex-shrink-0"
                  style={{ width: cellSize, height: 24, writingMode: 'vertical-rl' }}
                >
                  {p.label}
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            <div>
              {ALL_POINTS.map((p, i) => (
                <div key={`row-${i}`} className="flex">
                  <div className="w-12 flex items-center justify-end pr-1 text-[8px] text-slate-500 flex-shrink-0">
                    {p.label}
                  </div>
                  {ALL_POINTS.map((_, j) => {
                    const d = DISTANCE_MATRIX[i][j];
                    const isSelected = selectedPoint === i || selectedPoint === j;
                    return (
                      <motion.div
                        key={`cell-${i}-${j}`}
                        className="flex-shrink-0 cursor-pointer border border-slate-800/30"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: isSelected ? getDistanceColor(d) : d === 0 ? '#1e293b' : getDistanceColor(d),
                          opacity: isSelected ? 1 : 0.4,
                        }}
                        whileHover={{ scale: 1.3, zIndex: 10 }}
                        onMouseEnter={() => setHoveredCell({ i, j, d })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => {
                          if (selectedPoint === i) {
                            setSelectedPoint(null);
                            setFilterDistance(null);
                          } else {
                            setSelectedPoint(i);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hover info */}
        {hoveredCell && (
          <div className="px-4 py-2 border-t border-slate-700 bg-slate-900/80">
            <p className="text-sm text-white font-mono">
              {ALL_POINTS[hoveredCell.i].label} → {ALL_POINTS[hoveredCell.j].label} = <span className="font-bold text-amber-400">{hoveredCell.d}</span>
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="px-4 py-3 border-t border-slate-700 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-slate-400">Distance:</span>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(d => (
            <div key={d} className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getDistanceColor(d) }} />
              <span className="text-xs text-slate-400">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Point explorer */}
      {selectedPoint !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-lg border border-slate-700 p-4"
        >
          <h3 className="text-sm font-semibold text-white mb-3">
            Distances from {ALL_POINTS[selectedPoint].label}
          </h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(d => {
              const count = DISTANCE_MATRIX[selectedPoint].filter(v => v === d).length - (d === 0 ? 1 : 0);
              return (
                <button
                  key={d}
                  onClick={() => setFilterDistance(filterDistance === d ? null : d)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    filterDistance === d
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  d={d}: {count} pts
                </button>
              );
            })}
          </div>
          {filteredPoints && (
            <div className="flex gap-2 flex-wrap">
              {filteredPoints.map(p => (
                <span key={p.label} className="px-2 py-1 bg-slate-700 rounded text-xs font-mono text-slate-300">
                  {p.label}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
