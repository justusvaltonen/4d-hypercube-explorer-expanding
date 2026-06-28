import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { ALL_POINTS, project4Dto3D, manhattanDistance } from '@/lib/hypercubeMath';
import type { Point4D } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Palette, Crosshair, Move3D } from 'lucide-react';

/* ─── screen-space label: always same CSS px size ─── */
interface LabelProps {
  position: [number, number, number];
  text: string;
  color: string;
  opacity: number;
}

function ScreenLabel({ position, text, color, opacity }: LabelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      // Billboard: always face camera
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  if (opacity <= 0.01) return null;

  return (
    <group ref={groupRef} position={position}>
      <Html
        center
        distanceFactor={undefined}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="font-mono text-[10px] whitespace-nowrap select-none"
          style={{
            color,
            opacity,
            textShadow: '0 0 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
            transform: 'translateY(-16px)',
          }}
        >
          {text}
        </div>
      </Html>
    </group>
  );
}

/* ─── Node sphere ─── */
interface NodeProps {
  position: [number, number, number];
  color: string;
  isStart: boolean;
  isEnd: boolean;
  isOnPath: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

function Node({ position, color, isStart, isEnd, isOnPath, onClick, onHover }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const target = isStart || isEnd ? 1.8 : isOnPath ? 1.3 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(target, target, target),
        0.12
      );
    }
  });

  const displayColor = isStart ? '#22c55e' : isEnd ? '#ef4444' : isOnPath ? '#f59e0b' : color;
  const emissiveIntensity = isStart || isEnd ? 0.5 : isOnPath ? 0.25 : 0.05;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
    >
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color={displayColor}
        emissive={displayColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.3}
        metalness={0.7}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

/* ─── Edge line ─── */
interface EdgeProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  opacity: number;
}

function Edge({ start, end, color, opacity }: EdgeProps) {
  const points = useMemo(
    () => [new THREE.Vector3(...start), new THREE.Vector3(...end)],
    [start, end]
  );
  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
}

/* ─── Path edge (animated) ─── */
interface PathEdgeProps {
  start: [number, number, number];
  end: [number, number, number];
  index: number;
  total: number;
  animationProgress: number;
}

function PathEdge({ start, end, index, total, animationProgress }: PathEdgeProps) {
  const points = useMemo(
    () => [new THREE.Vector3(...start), new THREE.Vector3(...end)],
    [start, end]
  );

  const edgeProgress = total > 0 ? (index + 1) / total : 1;
  const isVisible = animationProgress >= edgeProgress;
  const fadeIn = Math.min(1, Math.max(0, (animationProgress - edgeProgress + 0.15) / 0.15));

  return (
    <Line
      points={points}
      color="#fbbf24"
      lineWidth={3}
      transparent
      opacity={isVisible ? 0.9 * fadeIn : 0.05}
    />
  );
}

/* ─── Scene ─── */
interface SceneProps {
  rotationW: number;
  pathSteps: Point4D[];
  startPoint: Point4D | null;
  endPoint: Point4D | null;
  hoveredPoint: Point4D | null;
  onNodeClick: (point: Point4D) => void;
  onNodeHover: (point: Point4D | null) => void;
  showLabels: boolean;
  labelOpacity: number;
  edgeOpacity: number;
  pathAnimationProgress: number;
}

function Scene({
  rotationW,
  pathSteps,
  startPoint,
  endPoint,
  hoveredPoint,
  onNodeClick,
  onNodeHover,
  showLabels,
  labelOpacity,
  edgeOpacity,
  pathAnimationProgress,
}: SceneProps) {
  const pathSet = useMemo(() => {
    const s = new Set<string>();
    pathSteps.forEach((p) => s.add(`${p[0]}.${p[1]}.${p[2]}.${p[3]}`));
    return s;
  }, [pathSteps]);

  const projected = useMemo(
    () =>
      ALL_POINTS.map((p) => ({
        ...p,
        projected: project4Dto3D(p.coords, rotationW),
      })),
    [rotationW]
  );

  const edges = useMemo(() => {
    const result: Array<{
      start: [number, number, number];
      end: [number, number, number];
    }> = [];
    for (let i = 0; i < ALL_POINTS.length; i++) {
      for (let j = i + 1; j < ALL_POINTS.length; j++) {
        if (manhattanDistance(ALL_POINTS[i].coords, ALL_POINTS[j].coords) === 1) {
          result.push({
            start: project4Dto3D(ALL_POINTS[i].coords, rotationW),
            end: project4Dto3D(ALL_POINTS[j].coords, rotationW),
          });
        }
      }
    }
    return result;
  }, [rotationW]);

  const pathEdges = useMemo(() => {
    if (pathSteps.length < 2) return [];
    const result: Array<{
      start: [number, number, number];
      end: [number, number, number];
      index: number;
    }> = [];
    for (let i = 0; i < pathSteps.length - 1; i++) {
      result.push({
        start: project4Dto3D(pathSteps[i], rotationW),
        end: project4Dto3D(pathSteps[i + 1], rotationW),
        index: i,
      });
    }
    return result;
  }, [pathSteps, rotationW]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    ALL_POINTS.forEach((p) => {
      const [x, y, z, w] = p.coords;
      const r = Math.floor(80 + (x - 1) * 50 + (w - 1) * 25);
      const g = Math.floor(120 + (y - 1) * 40 + (z - 1) * 25);
      const b = Math.floor(180 - (x - 1) * 15 - (y - 1) * 20);
      map.set(`${x}.${y}.${z}.${w}`, `rgb(${r},${g},${b})`);
    });
    return map;
  }, []);

  const formatP = useCallback((p: Point4D) => `${p[0]}.${p[1]}.${p[2]}.${p[3]}`, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -3]} intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#6366f1" />

      {edges.map((edge, i) => (
        <Edge
          key={`e-${i}`}
          start={edge.start}
          end={edge.end}
          color="#475569"
          opacity={edgeOpacity}
        />
      ))}

      {pathEdges.map((edge) => (
        <PathEdge
          key={`pe-${edge.index}`}
          start={edge.start}
          end={edge.end}
          index={edge.index}
          total={pathEdges.length}
          animationProgress={pathAnimationProgress}
        />
      ))}

      {projected.map((p) => {
        const key = formatP(p.coords);
        const isStart =
          startPoint !== null && key === formatP(startPoint);
        const isEnd =
          endPoint !== null && key === formatP(endPoint);
        const isOnPath =
          pathSet.has(key) && !isStart && !isEnd;
        const isHovered =
          hoveredPoint !== null && key === formatP(hoveredPoint);

        return (
          <group key={key}>
            <Node
              position={p.projected}
              color={colorMap.get(key) || '#64748b'}
              isStart={isStart}
              isEnd={isEnd}
              isOnPath={isOnPath}
              onClick={() => onNodeClick(p.coords)}
              onHover={(h) => onNodeHover(h ? p.coords : null)}
            />
            {(showLabels || isHovered || isStart || isEnd) && (
              <ScreenLabel
                position={[p.projected[0], p.projected[1] + 0.2, p.projected[2]]}
                text={p.label}
                color={isStart ? '#86efac' : isEnd ? '#fca5a5' : isOnPath ? '#fcd34d' : '#cbd5e1'}
                opacity={labelOpacity}
              />
            )}
          </group>
        );
      })}

      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  );
}

/* ─── Main exported component ─── */
interface Hypercube3DProps {
  pathSteps?: Point4D[];
  startPoint?: Point4D | null;
  endPoint?: Point4D | null;
  onNodeClick?: (point: Point4D) => void;
}

export default function Hypercube3D({
  pathSteps = [],
  startPoint = null,
  endPoint = null,
  onNodeClick = () => {},
}: Hypercube3DProps) {
  const [rotationW, setRotationW] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [labelOpacity, setLabelOpacity] = useState(0.85);
  const [edgeOpacity, setEdgeOpacity] = useState(0.2);
  const [hoveredPoint, setHoveredPoint] = useState<Point4D | null>(null);
  const [pathAnim, setPathAnim] = useState(1);

  /* W-axis rotation */
  useEffect(() => {
    let id: number;
    const tick = () => {
      if (isAnimating) setRotationW((p) => (p + 0.004) % (Math.PI * 2));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [isAnimating]);

  /* Path build animation */
  useEffect(() => {
    if (pathSteps.length < 2) {
      setPathAnim(1);
      return;
    }
    setPathAnim(0);
    const startTime = performance.now();
    const duration = Math.min(2000, pathSteps.length * 200);
    let id: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      setPathAnim(p);
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [pathSteps]);

  const handleNodeClick = useCallback(
    (point: Point4D) => {
      onNodeClick(point);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [4, 3, 4], fov: 50 }}
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, #1e293b 0%, #0f172a 70%)',
        }}
      >
        <Scene
          rotationW={rotationW}
          pathSteps={pathSteps}
          startPoint={startPoint}
          endPoint={endPoint}
          hoveredPoint={hoveredPoint}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredPoint}
          showLabels={showLabels}
          labelOpacity={labelOpacity}
          edgeOpacity={edgeOpacity}
          pathAnimationProgress={pathAnim}
        />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-2xl max-w-[220px]">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Move3D className="w-4 h-4 text-amber-400" />
          4D Hypercube
        </h3>

        <div className="space-y-3">
          {/* Auto-rotate */}
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer group">
            <div
              className={`w-8 h-4 rounded-full transition-colors relative ${
                isAnimating ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                  isAnimating ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
                style={{ transform: isAnimating ? 'translateX(16px)' : 'translateX(2px)' }}
              />
            </div>
            <input
              type="checkbox"
              checked={isAnimating}
              onChange={(e) => setIsAnimating(e.target.checked)}
              className="sr-only"
            />
            Auto-rotate W axis
          </label>

          {/* Show labels */}
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer group">
            <div
              className={`w-8 h-4 rounded-full transition-colors relative ${
                showLabels ? 'bg-blue-500' : 'bg-slate-600'
              }`}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                style={{ transform: showLabels ? 'translateX(16px)' : 'translateX(2px)' }}
              />
            </div>
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="sr-only"
            />
            {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Show labels
          </label>

          {/* Label opacity */}
          <div className={`transition-opacity ${showLabels ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Palette className="w-3 h-3" /> Label opacity
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{Math.round(labelOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={labelOpacity * 100}
              onChange={(e) => setLabelOpacity(Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>

          {/* Edge opacity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Edge opacity</span>
              <span className="text-[10px] text-slate-500 font-mono">{Math.round(edgeOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={edgeOpacity * 100}
              onChange={(e) => setEdgeOpacity(Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] text-slate-400">Start point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] text-slate-400">End point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
            <span className="text-[10px] text-slate-400">Path</span>
          </div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-[10px] text-slate-500">Click any point to use</span>
          </div>
        </div>
      </div>

      {/* Hovered point indicator */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md rounded-lg px-3 py-2 border border-slate-700/50"
          >
            <p className="text-white font-mono text-sm">
              {hoveredPoint[0]}.{hoveredPoint[1]}.{hoveredPoint[2]}.{hoveredPoint[3]}
            </p>
            <p className="text-slate-500 text-[10px]">Click to use in path finder</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
