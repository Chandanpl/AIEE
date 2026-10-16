import React, { useState, useEffect } from "react";

/**
 * Clean monochrome SVG icons for the 9 AIEE pipeline stages
 * Uniform 24x24 viewBox, 2px stroke, monochrome currentColor.
 */
export function StageIcon({ id, className = "stage-svg-icon" }) {
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
      return (
        <svg {...commonProps}>
          <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1-1-4 4a5 5 0 1 0 7 7l4-4 1 1 1.5-1.5L18 15l3.5-3.5a2.12 2.12 0 0 0 0-3L21 2z" />
          <circle cx="7.5" cy="16.5" r="1.5" />
        </svg>
      );
    case "connection":
      return (
        <svg {...commonProps}>
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      );
    case "history":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="4" />
          <line x1="1" y1="12" x2="8" y2="12" />
          <line x1="16" y1="12" x2="23" y2="12" />
        </svg>
      );
    case "changes":
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      );
    case "deps":
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
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="1" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="23" />
        </svg>
      );
    case "risk":
      return (
        <svg {...commonProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "report":
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
 * GitHub Octocat Logo SVG (monochrome)
 */
export function GitHubIcon({ size = 18, className = "" }) {
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

/**
 * The 9 official AIEE analysis stages organized by architectural tier
 */
const PIPELINE_STAGES = [
  // Tier 1: Ingestion & Extraction
  {
    id: "auth",
    number: "01",
    label: "GitHub Authentication",
    shortLabel: "GitHub Auth",
    desc: "OAuth handshake & token verification for secure repository access and elevated API rate limits.",
    tier: "Ingest",
    tierFull: "Repository Ingestion",
  },
  {
    id: "connection",
    number: "02",
    label: "Repository Connection",
    shortLabel: "Repo Connect",
    desc: "Target repo tree inspection, branch checkout, commit pointer identification, and metadata extraction.",
    tier: "Ingest",
    tierFull: "Repository Ingestion",
  },
  {
    id: "history",
    number: "03",
    label: "Git History Mining",
    shortLabel: "Git Mining",
    desc: "Extract sequential commit diffs, chronological change frequencies, and historical co-change matrices.",
    tier: "Ingest",
    tierFull: "Repository Ingestion",
  },
  // Tier 2: Diff Analysis & Topology
  {
    id: "changes",
    number: "04",
    label: "Changed File Detection",
    shortLabel: "Diff Detection",
    desc: "Identify touched files, modified hunks, addition/deletion ratios, and change classifications.",
    tier: "Analysis",
    tierFull: "Topology Analysis",
  },
  {
    id: "deps",
    number: "05",
    label: "Dependency Graph Analysis",
    shortLabel: "Graph Topology",
    desc: "Build abstract syntax tree import couplings and directional graph dependency hierarchies.",
    tier: "Analysis",
    tierFull: "Topology Analysis",
  },
  {
    id: "kmeans",
    number: "06",
    label: "KMeans Clustering",
    shortLabel: "KMeans ML",
    desc: "Partition code assets into behavioral change frequency clusters via unsupervised vector clustering.",
    tier: "Analysis",
    tierFull: "Topology Analysis",
  },
  // Tier 3: Density Inference & Synthesis
  {
    id: "dbscan",
    number: "07",
    label: "DBSCAN Clustering",
    shortLabel: "DBSCAN Cluster",
    desc: "Density-based spatial clustering to isolate change propagation neighborhoods and identify noise/outliers.",
    tier: "Inference",
    tierFull: "Risk Inference",
  },
  {
    id: "risk",
    number: "08",
    label: "Hybrid Risk Scoring",
    shortLabel: "Risk Scoring",
    desc: "Synthesize graph centrality, cluster density, and historical blast radius into weighted risk scores.",
    tier: "Inference",
    tierFull: "Risk Inference",
  },
  {
    id: "report",
    number: "09",
    label: "Impact Report Generation",
    shortLabel: "Impact Report",
    desc: "Compile actionable mitigation checklists, risk rankings, and exportable change-impact summaries.",
    tier: "Inference",
    tierFull: "Risk Inference",
  },
];

export default function GitHubAnalysisHero({
  authenticated = false,
  _githubUser = "",
  _profile = {},
  analysisStatus = "idle", // "idle" | "analyzing" | "completed" | "error"
  loading = false,
  _onLogin,
  compact = false,
}) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inspectedStage, setInspectedStage] = useState(null);

  // Cycling highlight for pipeline demonstration with hover pause support
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = loading || analysisStatus === "analyzing" ? 500 : 2400;

    const interval = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [loading, analysisStatus, isPaused]);

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
        dotClass: "dot-pulse-teal",
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
      dotClass: "dot-teal",
      labelClass: "hub-status-ready",
    };
  };

  const hubStatus = getHubStatus();
  const currentStage = PIPELINE_STAGES[activeStageIndex];

  const handleStageClick = (stage) => {
    if (inspectedStage?.id === stage.id) {
      setInspectedStage(null);
    } else {
      setInspectedStage(stage);
      setActiveStageIndex(PIPELINE_STAGES.findIndex((s) => s.id === stage.id));
    }
  };

  return (
    <div
      className={`pipeline-channel-section ${compact ? "channel-compact-mode" : ""} ${
        loading || analysisStatus === "analyzing" ? "is-analyzing" : ""
      } ${analysisStatus === "completed" ? "is-completed" : ""}`}
      aria-label="GitHub Repository Analysis Pipeline Channel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. CHANNEL COMPACT STATUS STRIP */}
      <div className="channel-meta-strip">
        <div className="channel-meta-left">
          <span className="channel-pulse-dot" aria-hidden="true"></span>
          <span className="channel-tag">9-STAGE REPOSITORY INTELLIGENCE CHANNEL</span>
          <span className="channel-meta-sep" aria-hidden="true">/</span>
          <span className="channel-active-indicator">
            Active: <strong>{currentStage.number}</strong> {currentStage.shortLabel}
          </span>
        </div>

        <div className="channel-meta-right">
          <span className="channel-hint-text">
            {isPaused ? "Hover paused · Click stage to inspect" : "Live sequence · Hover to pause"}
          </span>
          <div className={`channel-status-pill ${hubStatus.labelClass}`}>
            <span className={`status-indicator-dot ${hubStatus.dotClass}`} aria-hidden="true"></span>
            <span>{hubStatus.tag}</span>
          </div>
        </div>
      </div>

      {/* 2. HORIZONTAL CONNECTED CHANNEL TRACK */}
      <div className="channel-track-wrapper">
        <div className="channel-scroll-track" role="list">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCurrent = idx === activeStageIndex;
            const isCompleted =
              analysisStatus === "completed" ||
              (analysisStatus === "analyzing" && idx < activeStageIndex);
            const isAnalyzing =
              (loading || analysisStatus === "analyzing") && isCurrent;
            const isInspected = inspectedStage?.id === stage.id;

            return (
              <React.Fragment key={stage.id}>
                {/* STAGE CARD */}
                <div
                  className={`channel-stage-card ${isCurrent ? "is-active" : ""} ${
                    isCompleted ? "is-completed" : ""
                  } ${isAnalyzing ? "is-processing" : ""} ${
                    isInspected ? "is-inspected" : ""
                  }`}
                  onClick={() => handleStageClick(stage)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStageClick(stage);
                    }
                  }}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`Stage ${stage.number}: ${stage.label}`}
                  title={`${stage.label} (${stage.tier}): Click to inspect`}
                >
                  <div className="stage-card-top">
                    <span className="stage-card-number">{stage.number}</span>
                    <span className={`stage-card-tier tier-${stage.tier.toLowerCase()}`}>
                      {stage.tier}
                    </span>
                  </div>

                  <div className="stage-card-icon-wrap" aria-hidden="true">
                    <StageIcon id={stage.id} />
                  </div>

                  <div className="stage-card-name" title={stage.label}>
                    {stage.shortLabel}
                  </div>

                  <div className="stage-card-footer">
                    <span className="stage-card-dot" aria-hidden="true"></span>
                    <span className="stage-card-status-text">
                      {isCompleted ? "Done" : isCurrent ? "Active" : "Standby"}
                    </span>
                  </div>

                  {/* Tactile Edge Highlight */}
                  <div className="stage-card-rim-highlight" aria-hidden="true"></div>
                </div>

                {/* HORIZONTAL CONDUIT LINE BETWEEN STAGES */}
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div
                    className={`channel-conduit ${
                      idx < activeStageIndex || isCompleted ? "conduit-passed" : ""
                    } ${idx === activeStageIndex ? "conduit-current" : ""}`}
                    aria-hidden="true"
                  >
                    <div className="channel-conduit-line">
                      <div className="channel-conduit-light-packet"></div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. INSPECTED STAGE DETAILS BAR (EXPANDS ON CLICK) */}
      {inspectedStage && (
        <div className="channel-inspector-bar" role="region" aria-label="Stage Inspection Details">
          <div className="inspector-content">
            <div className="inspector-badge-row">
              <span className="inspector-stage-num">{inspectedStage.number}</span>
              <strong className="inspector-stage-title">{inspectedStage.label}</strong>
              <span className="inspector-tier-tag">{inspectedStage.tierFull}</span>
            </div>
            <p className="inspector-desc">{inspectedStage.desc}</p>
          </div>
          <button
            type="button"
            className="inspector-close-btn"
            onClick={() => setInspectedStage(null)}
            aria-label="Close stage inspection details"
            title="Close details"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Close</span>
          </button>
        </div>
      )}
    </div>
  );
}
