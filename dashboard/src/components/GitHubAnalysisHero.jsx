import React, { useState, useEffect } from "react";

/**
 * Clean monochrome SVG icons for the 9 AIEE pipeline stages
 * Uniform 24x24 viewBox, 2px stroke, monochrome currentColor.
 */
function StageIcon({ id, className = "stage-svg-icon" }) {
  const commonProps = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  switch (id) {
    case "auth":
      // Minimalist auth / key icon
      return (
        <svg {...commonProps}>
          <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1-1-4 4a5 5 0 1 0 7 7l4-4 1 1 1.5-1.5L18 15l3.5-3.5a2.12 2.12 0 0 0 0-3L21 2z" />
          <circle cx="7.5" cy="16.5" r="1.5" />
        </svg>
      );
    case "connection":
      // Minimalist repository connection / git-branch icon
      return (
        <svg {...commonProps}>
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      );
    case "history":
      // Minimalist git commit history icon
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="4" />
          <line x1="1" y1="12" x2="8" y2="12" />
          <line x1="16" y1="12" x2="23" y2="12" />
        </svg>
      );
    case "changes":
      // Minimalist file diff / change detection icon
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      );
    case "deps":
      // Minimalist dependency topology graph icon
      return (
        <svg {...commonProps}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );
    case "kmeans":
      // Minimalist clustering partition icon
      return (
        <svg {...commonProps}>
          <circle cx="7" cy="7" r="3" />
          <circle cx="17" cy="7" r="2.5" />
          <circle cx="12" cy="17" r="3" />
          <path d="M7 10l3 4" strokeDasharray="2 2" />
          <path d="M17 9.5l-3 4.5" strokeDasharray="2 2" />
        </svg>
      );
    case "dbscan":
      // Minimalist spatial density crosshair icon
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="1" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="23" />
        </svg>
      );
    case "risk":
      // Minimalist hybrid risk shield icon
      return (
        <svg {...commonProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "report":
      // Minimalist report / analytics summary icon
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="9 15 11 17 15 13" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * The 9 official AIEE analysis stages
 */
const PIPELINE_STAGES = [
  {
    id: "auth",
    number: "01",
    label: "GitHub Authentication",
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
    desc: "Actionable recommendations & rankings",
    svgX: 237,
    svgY: 134,
    pctX: 24,
    pctY: 22,
  },
];

/**
 * GitHub Octocat Logo SVG (Borderless floating emblem)
 */
export function GitHubIcon({ size = 62, className = "" }) {
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
        {/* DYNAMIC FLOATING AIEE TITLE (WATERMARK AMBIENT ANIMATION) */}
        <div className="floating-aiee-title-wrap" aria-hidden="true">
          <span className="floating-aiee-title">AI-Evolution-Engine</span>
        </div>

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
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.1" />
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
            r="190"
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

        {/* CENTRAL GITHUB ENGINE (BOX & BORDERLESS FLOATING HUB) */}
        <div
          className={`github-central-hub ${
            !authenticated ? "hub-unauthenticated" : ""
          } ${
            loading || analysisStatus === "analyzing"
              ? "hub-analyzing"
              : ""
          } ${analysisStatus === "completed" ? "hub-completed" : ""}`}
        >
          {/* Subtle decorative orbital rings & ambient light behind the logo */}
          <div className="hub-orbital-ring ring-outer" aria-hidden="true"></div>
          <div className="hub-orbital-ring ring-mid" aria-hidden="true"></div>
          <div className="hub-orbital-ring ring-inner" aria-hidden="true"></div>
          <div className="hub-core-ambient-light" aria-hidden="true"></div>

          {/* Floating GitHub Logo directly on the animated background */}
          <div className="hub-floating-logo-wrap">
            <GitHubIcon
              size={62}
              className="hub-github-svg"
            />
          </div>

          {/* Distinct separate engine status label beneath the logo */}
          <div className="hub-status-container">
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

        {/* 9 FLOATING STAGE LABELS (GLASSMORPHISM CARDS WITH ZERO EMOJIS) */}
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
                    <span className="stage-icon-indicator" aria-hidden="true">
                      <StageIcon id={stage.id} />
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
            <span className="engine-chip">Git History</span>
            <span className="engine-chip">Dependency Matrix</span>
            <span className="engine-chip">KMeans &amp; DBSCAN</span>
            <span className="engine-chip">Hybrid Risk Scoring</span>
          </div>
        </div>
      )}
    </section>
  );
}
