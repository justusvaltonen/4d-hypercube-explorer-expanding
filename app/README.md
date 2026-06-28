# 4D Hypercube Explorer

An interactive web application for exploring Manhattan distances, paths, norms, and shapes in a 3×3×3×3 four-dimensional hypercube. Built as a mathematical sandbox that could evolve into a puzzle game.

**Live Demo:** [https://3tepsahmudc6u.kimi.page](https://3tepsahmudc6u.kimi.page)

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tech Stack](https://img.shields.io/badge/Three.js-r3f-green?logo=threedotjs)
![Tech Stack](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)

## What It Explores

### The Core Problem
In a 3×3×3×3 hypercube (coordinates 1-3 in each of 4 dimensions), what is the distance between any two points? Using **Manhattan distance** (L₁ norm):

```
d(A, B) = |x₁−x₂| + |y₁−y₂| + |z₁−z₂| + |w₁−w₂|
```

| Metric | Value |
|--------|-------|
| Total Points | 3⁴ = **81** |
| Maximum L₁ Distance | **8** (e.g., 1.1.1.1 → 3.3.3.3) |
| Minimum L₁ Distance | **1** (adjacent points) |
| Average L₁ Distance | **4.00** |

This formula works **identically in any number of dimensions** — you simply add more absolute-difference terms.

## Features

### 1. Interactive 3D Explorer
- Real-time 3D visualization of all 81 hypercube points using Three.js
- 4D-to-3D projection with auto-rotating W-axis
- Screen-space labels (fixed size regardless of zoom)
- Adjustable label opacity and edge transparency
- Color-coded nodes: start (green), end (red), path (amber)

### 2. Distance Matrix
- Full 81×81 interactive heatmap
- Click any row to explore distances from that point
- Distance distribution histogram (0–8)
- Filter points by exact distance value

### 3. Path Finder
- Calculate shortest Manhattan path between any two 4D coordinates
- Animated 3D path visualization
- Step-by-step breakdown with per-axis deltas
- Formula breakdown showing the math
- Preset challenges and randomize function

### 4. Shapes, Norms & Dimensions *(NEW)*
- **Norm Shapes**: Interactive canvas comparing L₁ (diamond), L₂ (circle), L∞ (square) unit balls
- **Volume Paradox**: Hypersphere volume peaks at dimension 5, then *decreases* — approaching zero!
- **Norm Calculator**: Live multi-norm distance calculator for 2D–6D points
- **Subspace Embedding**: Visualize how 2D/3D slices live inside 4D space

### 5. Learn & Game Concept
- Mathematical explanations with dimension comparison tables
- 4 puzzle game concepts: Path Finder Challenge, Treasure Hunt, Portal Navigator, Distance Detective
- Educational content on building 4D intuition

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** (3D visualization)
- **Tailwind CSS** + **shadcn/ui** (styling)
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 20+ (LTS recommended)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/4d-hypercube-explorer.git
cd 4d-hypercube-explorer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The static files will be generated in the `dist/` directory.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Hypercube3D.tsx       # 3D Three.js visualization
│   │   ├── DistanceMatrix.tsx    # Interactive heatmap + histogram
│   │   ├── PathFinder.tsx        # Path calculation + animation
│   │   ├── MathConcept.tsx       # Educational content tabs
│   │   └── ShapesMetrics.tsx     # Norms, volumes, calculator
│   ├── lib/
│   │   └── hypercubeMath.ts      # All 4D math: distances, paths, projections
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── pages/
│   │   └── Home.tsx              # Main page with all sections
│   └── App.tsx                   # Root component
├── public/                        # Static assets
├── index.html                     # Entry HTML
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS config
└── package.json                   # Dependencies
```

## Key Mathematical Concepts

### Lₚ Norms
Different ways to measure distance. For a vector **v** = (v₁, v₂, ..., vₙ):

| Norm | Formula | Unit Ball Shape (2D) |
|------|---------|---------------------|
| L₁ (Manhattan) | Σ\|vᵢ\| | Diamond |
| L₂ (Euclidean) | √(Σvᵢ²) | Circle |
| L∞ (Chebyshev) | max(\|vᵢ\|) | Square |

**Always true:** L₁ ≥ L₂ ≥ L∞ for any two points.

### The Hypersphere Volume Paradox
The volume of a unit Euclidean n-ball:
- Increases through dimensions 1–5
- **Peaks at dimension 5** (V₅ ≈ 5.26)
- Then *decreases forever*, approaching zero
- By dimension 20, the ball is essentially an empty shell

This happens because in high dimensions, almost all volume concentrates near the surface.

### Subspace Embedding
A point doesn't need all dimensions. A 2D point `(x, y)` embeds in 4D as `(x, y, 2, 2)` — the z and w coordinates are simply fixed constants. The 3×3×3×3 hypercube contains **three separate 3×3×3 cubes** as W-slices (W=1, W=2, W=3).

## Future Development Ideas

This project is designed as a foundation for a puzzle game. Some directions to explore:

- **Path Finder Challenge**: Race against the optimal path
- **Treasure Hunt**: Navigate with distance-based "warmer/colder" hints
- **Portal Navigator**: Place portals to optimize travel
- **Distance Detective**: Deduce hidden coordinates from distance clues
- **Time-based challenges** with leaderboard
- **Progressive dimension unlocking** (start at 2D, unlock 3D, then 4D)

## Contributing

This is a personal learning/exploration project. Feel free to fork and experiment!

## License

MIT License — use it however you want.


I must add that I've inputted just about 0% of my own install script or code. Maybe that is the reason for works on my computer - result.
