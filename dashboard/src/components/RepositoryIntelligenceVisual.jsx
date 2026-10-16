import React, { useState, useRef } from "react";

/**
 * 3D Repository Intelligence Visualization
 * Artistic, interactive, isometric software system scene representing
 * repository intelligence, AST dependency topology, and ML clustering.
 */
export default function RepositoryIntelligenceVisual({
  analysisStatus = "idle", // "idle" | "analyzing" | "completed" | "error"
  loading = false,
  authenticated = false,
}) {
  const [selectedNode, setSelectedNode] = useState("clustering");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Active module being inspected (either hovered or selected)
  const activeNodeId = hoveredNode || selectedNode;

  // Track mouse coordinates for subtle, realistic 3D perspective tilt
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -y * 8, // max 4 deg rotation X
      y: x * 8,  // max 4 deg rotation Y
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHoveredNode(null);
    setIsPaused(false);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  // 3D Repository Modules Definition
  const MODULES = [
    {
      id: "routes",
      name: "api/routes.py",
      type: "file",
      role: "Inference API",
      ext: "PY",
      metric: "Centrality: 0.94",
      risk: "HIGH",
      color: "amber",
      coords: { x: 40, y: 50, z: 24 },
      connections: ["hub", "topology", "risk"],
      desc: "FastAPI endpoint routing change impact analysis and Git diff mining.",
    },
    {
      id: "clustering",
      name: "clustering/",
      type: "folder",
      role: "KMeans & DBSCAN",
      ext: "ML",
      metric: "k=3 · eps=0.5",
      risk: "LOW",
      color: "teal",
      coords: { x: 300, y: 45, z: 28 },
      connections: ["hub", "risk"],
      desc: "Unsupervised machine learning models partitioning file co-change vectors.",
    },
    {
      id: "topology",
      name: "graph/topology.py",
      type: "file",
      role: "AST Coupling",
      ext: "PY",
      metric: "38 Edges · 14 Nodes",
      risk: "LOW",
      color: "teal",
      coords: { x: 30, y: 255, z: 20 },
      connections: ["hub", "routes"],
      desc: "Extracts abstract syntax tree import couplings and propagation paths.",
    },
    {
      id: "risk",
      name: "engine/risk_scorer.py",
      type: "file",
      role: "Blast Radius",
      ext: "PY",
      metric: "Multi-Heuristic",
      risk: "MEDIUM",
      color: "mint",
      coords: { x: 290, y: 245, z: 26 },
      connections: ["hub", "clustering", "routes"],
      desc: "Synthesizes graph centrality, DBSCAN density, and historic blast radius.",
    },
  ];

  const activeNodeData = MODULES.find((m) => m.id === activeNodeId) || MODULES[0];

  const isAnalyzing = loading || analysisStatus === "analyzing";

  return (
    <div
      className={`repo-3d-scene-container ${isAnalyzing ? "is-analyzing" : ""} ${
        analysisStatus === "completed" ? "is-completed" : ""
      }`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="3D Interactive Repository Intelligence Scene"
    >
      {/* 3D Transform Viewport Canvas */}
      <div
        className="repo-3d-viewport"
        style={{
          transform: `perspective(1200px) rotateX(${8 + tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Layer 0: Ambient Glowing Circuit Plate */}
        <div className="scene-base-circuit-grid" aria-hidden="true">
          <svg className="circuit-grid-svg" viewBox="0 0 460 380" fill="none">
            <defs>
              <radialGradient id="hubRadialGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#45B8A0" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#2E8B75" stopOpacity="0.08" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="conduitTeal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#45B8A0" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#68D8C4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#45B8A0" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Glowing Center Foundation */}
            <circle cx="230" cy="180" r="130" fill="url(#hubRadialGlow)" />

            {/* Outer Topological Grid Rings */}
            <circle cx="230" cy="180" r="150" stroke="#3A444D" strokeWidth="1" strokeDasharray="3 6" opacity="0.45" />
            <circle cx="230" cy="180" r="105" stroke="#3A444D" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <circle cx="230" cy="180" r="62" stroke="#45B8A0" strokeWidth="1" strokeDasharray="6 3" opacity="0.75" />

            {/* Coordinate Axis Crosshairs */}
            <line x1="230" y1="20" x2="230" y2="340" stroke="#3A444D" strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />
            <line x1="30" y1="180" x2="430" y2="180" stroke="#3A444D" strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />

            {/* Dependency Connection Lines Between Modules & Central Hub */}
            {/* Hub (230, 180) to Routes (125, 95) */}
            <path
              d="M 230 180 C 180 180, 140 140, 125 95"
              className={`conduit-path ${activeNodeData.connections.includes("routes") || activeNodeId === "routes" ? "is-highlighted" : ""}`}
            />
            {/* Hub (230, 180) to Clustering (360, 95) */}
            <path
              d="M 230 180 C 280 180, 340 140, 360 95"
              className={`conduit-path ${activeNodeData.connections.includes("clustering") || activeNodeId === "clustering" ? "is-highlighted" : ""}`}
            />
            {/* Hub (230, 180) to Topology (125, 275) */}
            <path
              d="M 230 180 C 180 180, 140 230, 125 275"
              className={`conduit-path ${activeNodeData.connections.includes("topology") || activeNodeId === "topology" ? "is-highlighted" : ""}`}
            />
            {/* Hub (230, 180) to Risk Scorer (355, 270) */}
            <path
              d="M 230 180 C 280 180, 340 230, 355 270"
              className={`conduit-path ${activeNodeData.connections.includes("risk") || activeNodeId === "risk" ? "is-highlighted" : ""}`}
            />
            {/* Lateral Coupling: Routes (125, 95) to Topology (125, 275) */}
            <path
              d="M 125 95 L 125 275"
              className={`conduit-path lateral-path ${activeNodeId === "routes" || activeNodeId === "topology" ? "is-highlighted" : ""}`}
              strokeDasharray="4 4"
            />
            {/* Lateral Coupling: Clustering (360, 95) to Risk Scorer (355, 270) */}
            <path
              d="M 360 95 L 355 270"
              className={`conduit-path lateral-path ${activeNodeId === "clustering" || activeNodeId === "risk" ? "is-highlighted" : ""}`}
              strokeDasharray="4 4"
            />

            {/* Traveling Data Packet Particles along Active Conduits */}
            {!isPaused && (
              <>
                <circle className="data-packet packet-1" r="3" fill="#68D8C4" filter="drop-shadow(0 0 4px #45B8A0)" />
                <circle className="data-packet packet-2" r="3" fill="#68D8C4" filter="drop-shadow(0 0 4px #45B8A0)" />
                <circle className="data-packet packet-3" r="2.5" fill="#5EEAD4" filter="drop-shadow(0 0 4px #45B8A0)" />
                <circle className="data-packet packet-4" r="2.5" fill="#5EEAD4" filter="drop-shadow(0 0 4px #45B8A0)" />
              </>
            )}
          </svg>
        </div>

        {/* Layer 1: Central Repository Core Hub */}
        <div
          className="scene-central-hub"
          style={{ transform: "translate3d(0, 0, 36px)" }}
          onClick={() => setSelectedNode("clustering")}
          role="region"
          aria-label="Repository Analysis Hub"
        >
          <div className="hub-pedestal-outer">
            <div className="hub-pedestal-rim"></div>
            <div className="hub-pedestal-core">
              {/* GitHub Logo Emblem */}
              <div className="hub-octocat-wrap" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 98 96" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                  />
                </svg>
              </div>

              {/* Status Ring Beacon */}
              <div className={`hub-pulse-beacon ${isAnalyzing ? "beacon-active" : ""}`}></div>
            </div>
          </div>

          {/* Floating Branch Tag */}
          <div className="hub-branch-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            <span>main (HEAD)</span>
          </div>

          {/* Central Telemetry Tag */}
          <div className="hub-telemetry-pill">
            <span className="hub-dot-pulse"></span>
            <span>
              {isAnalyzing
                ? "Analyzing AST Nodes..."
                : authenticated
                ? "GitHub Auth Active · Ready"
                : "Repository Model Ready"}
            </span>
          </div>
        </div>

        {/* Layer 2: Floating 3D Repository Folders & File Modules */}
        {MODULES.map((mod) => {
          const isSelected = activeNodeId === mod.id;

          return (
            <div
              key={mod.id}
              className={`floating-repo-module ${isSelected ? "is-selected" : ""} module-${mod.id}`}
              style={{
                left: `${mod.coords.x}px`,
                top: `${mod.coords.y}px`,
                transform: `translate3d(0, 0, ${mod.coords.z}px)`,
              }}
              onClick={() => setSelectedNode(mod.id)}
              onMouseEnter={() => setHoveredNode(mod.id)}
              onMouseLeave={() => setHoveredNode(null)}
              tabIndex={0}
              role="button"
              aria-label={`Inspect ${mod.name}: ${mod.role}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedNode(mod.id);
                }
              }}
            >
              {/* Card Surface */}
              <div className="module-card-surface">
                <div className="module-top-row">
                  <span className={`module-ext-badge ext-${mod.ext.toLowerCase()}`}>
                    {mod.ext}
                  </span>
                  <span className={`module-risk-indicator risk-${mod.risk.toLowerCase()}`}>
                    {mod.risk}
                  </span>
                </div>

                <div className="module-title-row">
                  {mod.type === "folder" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="module-icon">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="module-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  )}
                  <strong className="module-name">{mod.name}</strong>
                </div>

                <div className="module-meta-row">
                  <span className="module-role">{mod.role}</span>
                  <span className="module-metric">{mod.metric}</span>
                </div>

                {/* Tactile Edge Highlight */}
                <div className="module-rim-edge"></div>
              </div>
            </div>
          );
        })}

        {/* Floating Commit Diff Pill (Spatial Accent) */}
        <div
          className="floating-commit-accent"
          style={{ transform: "translate3d(0, 0, 42px)" }}
          aria-hidden="true"
        >
          <div className="commit-accent-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="4" />
              <line x1="1" y1="12" x2="8" y2="12" />
              <line x1="16" y1="12" x2="23" y2="12" />
            </svg>
            <span className="commit-hash">commit 7f4a2c9</span>
            <span className="commit-diff-stats">
              <span className="diff-add">+142</span>
              <span className="diff-del">-38</span>
            </span>
          </div>
        </div>
      </div>

      {/* Layer 3: Interactive Module HUD Detail Drawer */}
      <div className="scene-interactive-hud">
        <div className="hud-header">
          <div className="hud-badge-group">
            <span className="hud-dot"></span>
            <span className="hud-title">ACTIVE REPOSITORY NODE</span>
            <span className="hud-sep">/</span>
            <span className="hud-filename">{activeNodeData.name}</span>
          </div>
          <span className="hud-hint">Click module in 3D scene to inspect</span>
        </div>

        <p className="hud-desc">{activeNodeData.desc}</p>

        <div className="hud-footer-stats">
          <div className="hud-stat-item">
            <span className="hud-stat-label">Role:</span>
            <span className="hud-stat-val">{activeNodeData.role}</span>
          </div>
          <div className="hud-stat-item">
            <span className="hud-stat-label">Metric:</span>
            <span className="hud-stat-val font-mono">{activeNodeData.metric}</span>
          </div>
          <div className="hud-stat-item">
            <span className="hud-stat-label">Risk Evaluation:</span>
            <span className={`hud-stat-risk risk-${activeNodeData.risk.toLowerCase()}`}>
              {activeNodeData.risk} RISK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
