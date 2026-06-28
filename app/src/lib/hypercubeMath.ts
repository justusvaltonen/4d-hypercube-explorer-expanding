import type { Point4D, HypercubePoint, PathResult, DistanceStats } from '@/types';

export const DIM = 3;

export function generateAllPoints(): HypercubePoint[] {
  const points: HypercubePoint[] = [];
  let index = 0;
  for (let x = 1; x <= DIM; x++) {
    for (let y = 1; y <= DIM; y++) {
      for (let z = 1; z <= DIM; z++) {
        for (let w = 1; w <= DIM; w++) {
          points.push({
            coords: [x, y, z, w],
            index,
            label: `${x}.${y}.${z}.${w}`,
          });
          index++;
        }
      }
    }
  }
  return points;
}

export function manhattanDistance(a: Point4D, b: Point4D): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) + Math.abs(a[3] - b[3]);
}

export function findShortestPath(from: Point4D, to: Point4D): PathResult {
  const distance = manhattanDistance(from, to);
  const steps: Point4D[] = [from];
  const directionLabels: string[] = [];
  const axisNames = ['X', 'Y', 'Z', 'W'];

  let current: Point4D = [...from] as Point4D;

  for (let i = 0; i < 4; i++) {
    while (current[i] !== to[i]) {
      if (current[i] < to[i]) {
        current[i]++;
        directionLabels.push(`${axisNames[i]}+ (to ${current[i]})`);
      } else {
        current[i]--;
        directionLabels.push(`${axisNames[i]}- (to ${current[i]})`);
      }
      steps.push([...current] as Point4D);
    }
  }

  return { from, to, distance, steps, directionLabels };
}

export function generateDistanceMatrix(): number[][] {
  const points = generateAllPoints();
  const n = points.length;
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const d = manhattanDistance(points[i].coords, points[j].coords);
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }

  return matrix;
}

export function computeDistanceStats(): DistanceStats {
  const matrix = generateDistanceMatrix();
  const n = matrix.length;
  const distances: number[] = [];
  const distribution = new Map<number, number>();

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = matrix[i][j];
      distances.push(d);
      distribution.set(d, (distribution.get(d) || 0) + 1);
    }
  }

  const totalPairs = distances.length;
  const maxDistance = Math.max(...distances);
  const minDistance = Math.min(...distances);
  const avgDistance = distances.reduce((a, b) => a + b, 0) / totalPairs;

  return {
    maxDistance,
    minDistance,
    avgDistance,
    totalPairs,
    distanceDistribution: distribution,
  };
}

export function formatPoint(p: Point4D): string {
  return `${p[0]}.${p[1]}.${p[2]}.${p[3]}`;
}

export function parsePoint(s: string): Point4D | null {
  const parts = s.split('.').map(Number);
  if (parts.length === 4 && parts.every(n => n >= 1 && n <= 3 && Number.isInteger(n))) {
    return parts as Point4D;
  }
  return null;
}

export function getNeighbors(point: Point4D): Point4D[] {
  const neighbors: Point4D[] = [];
  for (let i = 0; i < 4; i++) {
    if (point[i] > 1) {
      const n = [...point] as Point4D;
      n[i]--;
      neighbors.push(n);
    }
    if (point[i] < DIM) {
      const n = [...point] as Point4D;
      n[i]++;
      neighbors.push(n);
    }
  }
  return neighbors;
}

export function project4Dto3D(point: Point4D, rotationAngle: number = 0): [number, number, number] {
  const [x, y, z, w] = point;
  const cos = Math.cos(rotationAngle);
  const sin = Math.sin(rotationAngle);
  // Project 4D to 3D by rotating in the Z-W plane
  const z3d = (z - 2) * cos + (w - 2) * sin;
  return [x - 2, y - 2, z3d];
}

export function project4Dto2D(point: Point4D): [number, number] {
  const [x, y, z, w] = point;
  // Double stereographic-like projection
  const x2d = x - 2 + 0.4 * (z - 2);
  const y2d = y - 2 + 0.4 * (w - 2);
  return [x2d, y2d];
}

export const ALL_POINTS = generateAllPoints();
export const DISTANCE_MATRIX = generateDistanceMatrix();
export const DISTANCE_STATS = computeDistanceStats();
