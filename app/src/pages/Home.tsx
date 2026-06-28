import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Route, Grid3x3, BookOpen, ChevronDown,
  Shapes, Sparkles
} from 'lucide-react';
import Hypercube3D from '@/components/Hypercube3D';
import DistanceMatrix from '@/components/DistanceMatrix';
import PathFinder from '@/components/PathFinder';
import MathConcept from '@/components/MathConcept';
import ShapesMetrics from '@/components/ShapesMetrics';

type Section = 'visualize' | 'matrix' | 'path' | 'shapes' | 'learn';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'visualize', label: '3D Explorer', icon: <Box className="w-4 h-4" /> },
  { id: 'matrix', label: 'Matrix', icon: <Grid3x3 className="w-4 h-4" /> },
  { id: 'path', label: 'Path Finder', icon: <Route className="w-4 h-4" /> },
  { id: 'shapes', label: 'Shapes & Metrics', icon: <Shapes className="w-4 h-4" /> },
  { id: 'learn', label: 'Learn', icon: <BookOpen className="w-4 h-4" /> },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('visualize');

  const scrollToSection = (id: Section) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ═══════════════ HERO ═══════════════ */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-slate-900/80 to-slate-950" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">
                4D Hypercube Explorer + Distance Metrics
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Navigate the 4th Dimension
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Explore distances, paths, norms, and shapes in a 3×3×3×3 hypercube. 
              From Manhattan diamonds to hypersphere volume paradoxes — 
              a mathematical sandbox for higher-dimensional space.
            </p>

            <div className="flex justify-center gap-6 md:gap-10 mb-8">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">81</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-amber-400">8</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Max L₁ Dist</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-pink-400">3.46</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Max L₂ Dist</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">∞</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Dimensions</p>
              </div>
            </div>

            <motion.button
              onClick={() => scrollToSection('visualize')}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-5 h-5" />
              <span className="text-sm">Start Exploring</span>
              <ChevronDown className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* ═══════════════ NAV ═══════════════ */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeSection === item.id
                    ? 'text-amber-400 border-amber-400'
                    : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══════════════ MAIN ═══════════════ */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-20">
        {/* 3D Explorer */}
        <section id="visualize" className="scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Box className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Interactive 3D Explorer</h2>
            </div>
            <p className="text-slate-400 mb-4 max-w-3xl">
              All 81 points of the 4D hypercube projected into 3D space. Points are colored by coordinates. 
              Drag to rotate, scroll to zoom. The W-axis auto-rotates to reveal 4D structure. 
              Labels stay at fixed screen size — adjust their opacity with the slider.
            </p>
            <div className="h-[520px] rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
              <Hypercube3D />
            </div>
          </motion.div>
        </section>

        {/* Distance Matrix */}
        <section id="matrix" className="scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Grid3x3 className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Distance Matrix</h2>
            </div>
            <p className="text-slate-400 mb-4 max-w-3xl">
              The full 81×81 Manhattan distance matrix. Click any row to explore distances from that point. 
              Hover for exact values. The distribution histogram shows how many pairs exist at each distance (0–8).
            </p>
            <DistanceMatrix />
          </motion.div>
        </section>

        {/* Path Finder */}
        <section id="path" className="scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Route className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Path Finder</h2>
            </div>
            <p className="text-slate-400 mb-4 max-w-3xl">
              Enter two 4D coordinates and see the shortest Manhattan path. Watch it animate through 
              the hypercube, step through the breakdown, or copy the result. Use presets or randomize 
              for quick exploration.
            </p>
            <PathFinder />
          </motion.div>
        </section>

        {/* Shapes & Metrics (NEW) */}
        <section id="shapes" className="scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Shapes className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Shapes, Norms & Dimensions</h2>
            </div>
            <p className="text-slate-400 mb-4 max-w-3xl">
              Is the distance formula really the same in all dimensions? What shapes do "spheres" become 
              under different distance rules? Can points live in fewer dimensions? Explore L₁, L₂, and L∞ norms, 
              the hypersphere volume paradox, and subspace embeddings.
            </p>
            <ShapesMetrics />
          </motion.div>
        </section>

        {/* Learn / Game Concept */}
        <section id="learn" className="scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Learn & Game Concept</h2>
            </div>
            <p className="text-slate-400 mb-4 max-w-3xl">
              Understand the mathematics behind 4D Manhattan distance and explore how this 
              could become an engaging puzzle game that teaches hard-to-grasp concepts.
            </p>
            <MathConcept />
          </motion.div>
        </section>
      </main>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-slate-800 mt-20 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-slate-500">
            4D Hypercube Explorer — Distance, Shapes, and Higher Dimensions
          </p>
          <p className="text-xs text-slate-600">
            Built with React, Three.js, TypeScript & curiosity about the 4th dimension
          </p>
        </div>
      </footer>
    </div>
  );
}
