export type Point4D = [number, number, number, number];

export interface HypercubePoint {
  coords: Point4D;
  index: number;
  label: string;
}

export interface PathResult {
  from: Point4D;
  to: Point4D;
  distance: number;
  steps: Point4D[];
  directionLabels: string[];
}

export interface DistanceStats {
  maxDistance: number;
  minDistance: number;
  avgDistance: number;
  totalPairs: number;
  distanceDistribution: Map<number, number>;
}
