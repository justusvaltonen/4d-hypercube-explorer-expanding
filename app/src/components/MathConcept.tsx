import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Lightbulb, Code, Layers } from 'lucide-react';

interface TabContent {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function MathConcept() {
  const [activeTab, setActiveTab] = useState('formula');

  const tabs: TabContent[] = [
    {
      id: 'formula',
      label: 'The Formula',
      icon: <Code className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">For two points in 4D space:</p>
            <p className="text-lg font-mono text-white mb-1">A = (a₁, a₂, a₃, a₄)</p>
            <p className="text-lg font-mono text-white mb-3">B = (b₁, b₂, b₃, b₄)</p>
            <div className="border-t border-slate-700 pt-3">
              <p className="text-sm text-amber-400 font-semibold mb-1">Manhattan Distance:</p>
              <p className="text-xl font-mono text-white">
                d(A, B) = |a₁−b₁| + |a₂−b₂| + |a₃−b₃| + |a₄−b₄|
              </p>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-300 mb-2">For a 3×3×3×3 hypercube (coordinates 1-3 in each dimension):</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-mono w-24 flex-shrink-0">Max distance:</span>
                <span>2 + 2 + 2 + 2 = <strong className="text-white">8</strong> (opposite corners)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-mono w-24 flex-shrink-0">Min distance:</span>
                <span><strong className="text-white">0</strong> (same point) or <strong className="text-white">1</strong> (adjacent)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-mono w-24 flex-shrink-0">Total points:</span>
                <span>3⁴ = <strong className="text-white">81</strong></span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'comparison',
      label: 'Dimension Comparison',
      icon: <Layers className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Dimension</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Formula</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Max Dist (3³...)</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Total Points</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 px-3 text-slate-300">1D (line)</td>
                  <td className="py-2 px-3 font-mono text-slate-400">|a₁−b₁|</td>
                  <td className="py-2 px-3 font-mono text-green-400">2</td>
                  <td className="py-2 px-3 font-mono text-slate-400">3</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 px-3 text-slate-300">2D (grid)</td>
                  <td className="py-2 px-3 font-mono text-slate-400">|a₁−b₁|+|a₂−b₂|</td>
                  <td className="py-2 px-3 font-mono text-green-400">4</td>
                  <td className="py-2 px-3 font-mono text-slate-400">9</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 px-3 text-slate-300">3D (cube)</td>
                  <td className="py-2 px-3 font-mono text-slate-400">Σ|aᵢ−bᵢ|, i=1..3</td>
                  <td className="py-2 px-3 font-mono text-green-400">6</td>
                  <td className="py-2 px-3 font-mono text-slate-400">27</td>
                </tr>
                <tr className="bg-amber-900/10">
                  <td className="py-2 px-3 text-amber-300 font-semibold">4D (tesseract)</td>
                  <td className="py-2 px-3 font-mono text-amber-400">Σ|aᵢ−bᵢ|, i=1..4</td>
                  <td className="py-2 px-3 font-mono text-amber-400 font-bold">8</td>
                  <td className="py-2 px-3 font-mono text-amber-400 font-bold">81</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 px-3 text-slate-300">nD (general)</td>
                  <td className="py-2 px-3 font-mono text-slate-400">Σ|aᵢ−bᵢ|, i=1..n</td>
                  <td className="py-2 px-3 font-mono text-blue-400">2n</td>
                  <td className="py-2 px-3 font-mono text-slate-400">3ⁿ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-300">
              As dimensions increase, the maximum possible Manhattan distance grows <strong className="text-amber-400">linearly</strong> with the number of dimensions (2n for an n-dimensional 3×...×3 grid), while the number of points grows <strong className="text-amber-400">exponentially</strong> (3ⁿ). This means higher-dimensional spaces are vastly more sparse in terms of relative distances.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'intuition',
      label: 'Building Intuition',
      icon: <Lightbulb className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">1D</p>
              <p className="text-lg font-mono text-white mb-2">[1]—[2]—[3]</p>
              <p className="text-xs text-slate-400">A line. Only forward/backward. Distance = number of steps.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">2D</p>
              <div className="font-mono text-sm text-white mb-2 leading-tight">
                1.3  2.3  3.3<br/>
                1.2  2.2  3.2<br/>
                1.1  2.1  3.1
              </div>
              <p className="text-xs text-slate-400">A grid. Add horizontal + vertical steps.</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">3D</p>
              <p className="text-sm text-white mb-2">Stack 3 grids. Now you can move in X, Y, or Z.</p>
              <p className="text-xs text-slate-400">Think of a Rubik's cube. Distance = X+Y+Z steps.</p>
            </div>
          </div>
          <div className="bg-amber-900/10 rounded-lg p-4 border border-amber-700/30">
            <p className="text-sm text-amber-200 mb-2">
              <strong>4D Intuition:</strong> Stack 3 cubes along a new axis (W).
            </p>
            <p className="text-sm text-slate-300">
              Imagine three separate 3×3×3 cubes, each at a different "W level" (W=1, W=2, W=3). 
              Within each cube you move in X, Y, Z. But now you can also "jump" between cubes by changing W.
              The 4th dimension is like having <strong>layers of 3D spaces</strong> you can move between.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-300 mb-2">
              <strong>Why this matters for a puzzle game:</strong>
            </p>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>• Players must plan paths in 4 dimensions simultaneously</li>
              <li>• The shortest path is not always visually obvious in 3D projection</li>
              <li>• Some points that look close in 3D may be far apart in 4D (and vice versa)</li>
              <li>• The W axis adds a "hidden layer" of strategy</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'game',
      label: 'Game Concept',
      icon: <BookOpen className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-2">Game Mechanics Ideas</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">1</div>
                <div>
                  <p className="text-sm text-white font-medium">Path Finder Challenge</p>
                  <p className="text-xs text-slate-400">Given start and end points, find the shortest path. Score based on efficiency vs optimal.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">2</div>
                <div>
                  <p className="text-sm text-white font-medium">Treasure Hunt</p>
                  <p className="text-xs text-slate-400">Navigate the 4D hypercube to find hidden items. Distance gives hints (warmer/colder).</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">3</div>
                <div>
                  <p className="text-sm text-white font-medium">Portal Navigator</p>
                  <p className="text-xs text-slate-400">Place portals that connect distant points. Optimize travel across the hypercube.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-amber-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">4</div>
                <div>
                  <p className="text-sm text-white font-medium">Distance Detective</p>
                  <p className="text-xs text-slate-400">Deduce hidden coordinates based on distance clues from known points.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-2">Learning Outcomes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Understanding Manhattan distance in n-dimensions
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Spatial reasoning beyond 3D
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Combinatorial thinking (3⁴ possibilities)
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Optimization and path planning
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <div className="flex border-b border-slate-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-700/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/20'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tabs.find(t => t.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
