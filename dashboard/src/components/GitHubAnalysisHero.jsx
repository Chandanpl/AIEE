import React, { useState, useEffect } from "react";

/**
 * The 9 official AIEE analysis stages
 */
const PIPELINE_STAGES = [
  {
    id: "auth",
    number: "01",
    label: "GitHub Authentication",
    shortLabel: "OAuth",
    icon: "🔑",
    desc: "OAuth handshake & token verification",
    svgX: 500,
    svgY: 80,
    pctX: 50,
    pctY: 13,
  },
  {
    id: "connection",
    number: "02",
    label: "Repository Connection",
    shortLabel: "Repo Link",
    icon: "🔗",
    desc: "Target repo tree inspection",
    svgX: 763,
    svgY: 134,
    pctX: 76,
    pctY: 22,
  },
  {
    id: "history",
    number: "03",
    label: "Git History Mining",
    shortLabel: "History Mining",
    icon: "⛏️",
    desc: "Extract commit diffs & co-changes",
    svgX: 903,
    svgY: 270,
    pctX: 90,
    pctY: 44,
  },
  {
    id: "changes",
    number: "04",
    label: "Changed File Detection",
    shortLabel: "Changed Files",
    icon: "📁",
    desc: "Latest commit file modifications",
    svgX: 855,
    svgY: 425,
    pctX: 85,
    pctY: 68,
  },
  {
    id: "deps",
    number: "05",
    label: "Dependency Graph Analysis",
    shortLabel: "Dependency Graph",
    icon: "🕸️",
    desc: "Import & coupling topology",
    svgX: 640,
    svgY: 526,
    pctX: 64,
    pctY: 85,
  },
  {
    id: "kmeans",
    number: "06",
    label: "KMeans Clustering",
    shortLabel: "KMeans ML",
    icon: "🧬",
    desc: "Behavioral frequency partitioning",
    svgX: 360,
    svgY: 526,
    pctX: 36,
    pctY: 85,
  },
  {
    id: "dbscan",
    number: "07",
    label: "DBSCAN Clustering",
    shortLabel: "DBSCAN ML",
    icon: "🎯",
    desc: "Density-based propagation groups",
    svgX: 145,
    svgY: 425,
    pctX: 15,
    pctY: 68,
  },
  {
    id: "risk",
    number: "08",
    label: "Hybrid Risk Scoring",
    shortLabel: "Risk Scoring",
    icon: "⚡",
    desc: "Multi-heuristic risk evaluation",
    svgX: 97,
    svgY: 270,
    pctX: 10,
    pctY: 44,
  },
  {
    id: "report",
    number: "09",
    label: "Impact Report Generation",
    shortLabel: "Impact Report",
    icon: "📊",
    desc: "Actionable recommendations & rankings",
    svgX: 237,
    svgY: 134,
    pctX: 24,
    pctY: 22,
  },
];

/**
 * GitHub Octocat Logo SVG
 */
export function GitHubIcon({ size = 52, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 98 96"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
      />
    </svg>
  );
}

export default function GitHubAnalysisHero({
  authenticated = false,
  githubUser = "",
  profile = {},
  analysisStatus = "idle", // "idle" | "analyzing" | "completed" | "error"
  loading = false,
  onLogin,
}) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [hoveredStage, setHoveredStage] = useState(null);

  // Cycling highlight for pipeline representation
  useEffect(() => {
    // When analyzing: rapidly cycle through stages (450ms)
    // When idle: gently step through stages (1400ms)
    // When completed: hold or pause
    const intervalTime = loading || analysisStatus === "analyzing" ? 450 : 1400;

    const interval = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [loading, analysisStatus]);

  // Status badge config
  const getHubStatus = () => {
    if (!authenticated) {
      return {
        tag: "Connect GitHub",
        dotClass: "dot-amber",
        labelClass: "hub-status-connect",
      };
    }
    if (loading || analysisStatus === "analyzing") {
      return {
        tag: "Mining Pipeline Active",
        dotClass: "dot-pulse-blue",
        labelClass: "hub-status-analyzing",
      };
    }
    if (analysisStatus === "completed") {
      return {
        tag: "Analysis Complete",
        dotClass: "dot-green",
        labelClass: "hub-status-completed",
      };
    }
    if (analysisStatus === "error") {
      return {
        tag: "Analysis Paused",
        dotClass: "dot-danger",
        labelClass: "hub-status-error",
      };
    }
    return {
      tag: "Engine Ready · Standby",
      dotClass: "dot-cyan",
      labelClass: "hub-status-ready",
    };
  };

  const hubStatus = getHubStatus();

  return (
    <section
      className={`github-analysis-hero ${
        loading || analysisStatus === "analyzing" ? "is-analyzing" : ""
      } ${analysisStatus === "completed" ? "is-completed" : ""}`}
      aria-labelledby="pipeline-hero-title"
    >
      {/* HEADER BAR */}
      <div className="hero-top-strip">
        <div className="hero-eyebrow-wrap">
          <span className="hero-circuit-dot" aria-hidden="true"></span>
          <span className="hero-eyebrow-text">
            AIEE ARCHITECTURE · 9-STAGE REPOSITORY INTELLIGENCE
          </span>
        </div>

        <div className="hero-top-status">
          <span
            className={`hero-status-pill ${
              authenticated ? "pill-connected" : "pill-pending"
            }`}
          >
            <span
              className={`status-indicator-dot ${hubStatus.dotClass}`}
            ></span>
            <span>{hubStatus.tag}</span>
          </span>
        </div>
      </div>

      <h1 id="pipeline-hero-title" className="sr-only">
        AI-Evolution-Engine GitHub Repository Analysis Pipeline
      </h1>

      {/* ORBITAL CANVAS CONTAINER */}
      <div className="orbital-canvas-wrap">
        {/* SVG DATA FLOW & ORBIT LAYER */}
        <svg
          className="orbital-svg-layer"
          viewBox="0 0 1000 620"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Glow gradient for radial hub */}
            <radialGradient
              id="heroHubGlow"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#22D3EE" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#081423" stopOpacity="0" />
            </radialGradient>

            {/* Radiant ray stroke gradient */}
            <linearGradient
              id="heroRayGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient
              id="activeRayGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
            </linearGradient>

            {/* Filter for particle glow */}
            <filter
              id="particleGlow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Center ambient glow sphere */}
          <circle
            cx="500"
            cy="310"
            r="180"
            fill="url(#heroHubGlow)"
            className="hub-ambient-glow"
          />

          {/* Outer Orbital Ellipse Track */}
          <ellipse
            cx="500"
            cy="310"
            rx="410"
            ry="230"
            className="orbit-ellipse outer-orbit"
          />

          {/* Inner Orbital Ellipse Track */}
          <ellipse
            cx="500"
            cy="310"
            rx="290"
            ry="160"
            className="orbit-ellipse inner-orbit"
          />

          {/* Sequential Perimeter Polygon connecting stages */}
          <polygon
            points={PIPELINE_STAGES.map((s) => `${s.svgX},${s.svgY}`).join(
              " "
            )}
            className="orbit-perimeter-poly"
          />

          {/* Connecting Ray Lines from Center (500, 310) to each Stage Node */}
          {PIPELINE_STAGES.map((stage, idx) => {
            const isActive =
              analysisStatus === "completed" ||
              idx === activeStageIndex ||
              hoveredStage === stage.id;
            const isAnalyzing =
              loading || analysisStatus === "analyzing";

            return (
              <g key={`ray-${stage.id}`} className="stage-ray-group">
                <line
                  x1="500"
                  y1="310"
                  x2={stage.svgX}
                  y2={stage.svgY}
                  className={`stage-ray-line ${
                    isActive ? "ray-active" : ""
                  } ${isAnalyzing ? "ray-pulsing" : ""}`}
                  stroke={
                    isActive ? "url(#activeRayGrad)" : "url(#heroRayGrad)"
                  }
                />

                {/* Data Flow Particle along ray */}
                <circle
                  cx={
                    500 +
                    (stage.svgX - 500) *
                      (isActive
                        ? 0.72
                        : ((idx * 0.11 + activeStageIndex * 0.08) % 1))
                  }
                  cy={
                    310 +
                    (stage.svgY - 310) *
                      (isActive
                        ? 0.72
                        : ((idx * 0.11 + activeStageIndex * 0.08) % 1))
                  }
                  r={isActive ? 3.5 : 2}
                  className={`flow-particle ${
                    isActive ? "particle-active" : ""
                  }`}
                  filter="url(#particleGlow)"
                />
              </g>
            );
          })}
        </svg>

        {/* CENTRAL GITHUB HUB */}
        <div
          className={`github-central-hub ${
            !authenticated ? "hub-unauthenticated" : ""
          } ${
            loading || analysisStatus === "analyzing"
              ? "hub-analyzing"
              : ""
          } ${analysisStatus === "completed" ? "hub-completed" : ""}`}
        >
          {/* Animated concentric decorative rings */}
          <div className="hub-pulse-ring ring-outer" aria-hidden="true"></div>
          <div className="hub-pulse-ring ring-inner" aria-hidden="true"></div>
          <div className="hub-core-backlight" aria-hidden="true"></div>

          {/* Main GitHub Glass Disk */}
          <div className="hub-core-disc">
            <GitHubIcon
              size={52}
              className="hub-github-svg"
            />

            <span className="hub-brand-name">GitHub Engine</span>

            <div className={`hub-state-badge ${hubStatus.labelClass}`}>
              <span
                className={`hub-state-dot ${hubStatus.dotClass}`}
                aria-hidden="true"
              ></span>
              <span className="hub-state-text">{hubStatus.tag}</span>
            </div>
          </div>
        </div>

        {/* 9 FLOATING STAGE LABELS (GLASSMORPHISM CARDS) */}
        <div
          className="pipeline-stages-container"
          role="region"
          aria-label="AIEE 9 Pipeline Stages"
        >
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCurrent = idx === activeStageIndex;
            const isCompleted = analysisStatus === "completed";
            const isAnalyzing =
              loading || analysisStatus === "analyzing";
            const isHighlighted = isCurrent || isCompleted;

            return (
              <div
                key={stage.id}
                className={`pipeline-stage-node stage-node-${stage.id} ${
                  isHighlighted ? "stage-highlighted" : ""
                } ${isAnalyzing ? "stage-analyzing" : ""} ${
                  isCompleted ? "stage-completed" : ""
                }`}
                style={{
                  left: `${stage.pctX}%`,
                  top: `${stage.pctY}%`,
                  animationDelay: `${idx * 0.35}s`,
                }}
                onMouseEnter={() => setHoveredStage(stage.id)}
                onMouseLeave={() => setHoveredStage(null)}
                tabIndex={0}
                role="article"
                aria-label={`Stage ${stage.number}: ${stage.label}`}
              >
                <div className="stage-card-inner">
                  <div className="stage-card-header">
                    <span className="stage-num-badge">
                      {stage.number}
                    </span>
                    <span className="stage-icon-emoji" aria-hidden="true">
                      {stage.icon}
                    </span>
                  </div>

                  <div className="stage-card-body">
                    <strong className="stage-title">
                      {stage.label}
                    </strong>
                    <span className="stage-desc">{stage.desc}</span>
                  </div>

                  {/* Micro indicator glow bar */}
                  <div className="stage-progress-bar" aria-hidden="true">
                    <div className="stage-progress-fill"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BEFORE LOGIN: CALL TO ACTION BANNER */}
      {!authenticated && (
        <div className="hero-unauth-cta" role="region" aria-label="Connect GitHub">
          <div className="hero-unauth-cta-left">
            <span className="cta-icon" aria-hidden="true">
              <GitHubIcon size={26} />
            </span>
            <div>
              <h2 className="cta-title">Connect GitHub to Get Started</h2>
              <p className="cta-desc">
                Authorize AIEE to inspect repository commit diffs, dependency
                trees, and predictive ML cluster propagation.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-hero-login"
            onClick={onLogin}
            id="hero-github-login-btn"
          >
            <GitHubIcon size={18} />
            <span>Login with GitHub</span>
            <span className="cta-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      )}

      {/* AUTHENTICATED: COMPACT PIPELINE SUMMARY STRIP */}
      {authenticated && (
        <div className="hero-auth-summary">
          <div className="auth-user-greeting">
            <span className="auth-greeting-dot" aria-hidden="true"></span>
            <span>
              Pipeline connected for{" "}
              <strong>{profile?.displayName || (githubUser ? `@${githubUser}` : "Developer")}</strong>
            </span>
          </div>

          <div className="pipeline-engines-row">
            <span className="engine-chip">⚡ Git History</span>
            <span className="engine-chip">🕸️ Dependency Matrix</span>
            <span className="engine-chip">🧬 KMeans &amp; DBSCAN</span>
            <span className="engine-chip">🎯 Hybrid Risk Scoring</span>
          </div>
        </div>
      )}
    </section>
  );
}
