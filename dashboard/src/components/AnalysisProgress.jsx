import { useState, useEffect } from "react";
import { AIEEIcon } from "./AIEELogo";
import {
  IconGitHub,
  IconGitCommit,
  IconNetwork,
  IconCpu,
  IconCheckCircle,
} from "./Icons";

const ESTIMATED_STAGES = [
  {
    id: "connect",
    label: "Connecting to GitHub",
    description: "Authenticating session and establishing repository access.",
    Icon: IconGitHub,
    durationMs: 3500,
  },
  {
    id: "changes",
    label: "Inspecting repository changes",
    description: "Retrieving latest commit diffs, modified files, and code changes.",
    Icon: IconGitCommit,
    durationMs: 4500,
  },
  {
    id: "dependencies",
    label: "Analyzing dependencies",
    description: "Mapping import trees, co-change history, and relationship topology.",
    Icon: IconNetwork,
    durationMs: 5000,
  },
  {
    id: "ml",
    label: "Running ML clustering models",
    description: "Executing KMeans and DBSCAN algorithms to calculate propagation impact.",
    Icon: IconCpu,
    durationMs: 4500,
  },
  {
    id: "report",
    label: "Preparing your report",
    description: "Synthesizing hybrid risk scores and generating prioritized review advice.",
    Icon: IconCheckCircle,
    durationMs: 6000,
  },
];

export default function AnalysisProgress({ repo, onCancel }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    let timer;
    const advanceStage = () => {
      setCurrentStageIndex((prev) => {
        if (prev < ESTIMATED_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    };

    const currentDuration =
      ESTIMATED_STAGES[currentStageIndex]?.durationMs || 4000;
    timer = setTimeout(advanceStage, currentDuration);

    return () => clearTimeout(timer);
  }, [currentStageIndex]);

  const currentStage = ESTIMATED_STAGES[currentStageIndex];

  return (
    <section
      className="analysis-progress-panel"
      aria-live="polite"
      aria-busy="true"
      aria-label="Repository analysis progress"
    >
      <div className="progress-header">
        <div className="progress-logo-wrap">
          <AIEEIcon size={40} className="pulsing-circuit-logo" />
        </div>
        <div className="progress-header-info">
          <div className="progress-status-badge">
            <span className="live-status-dot" aria-hidden="true"></span>
            <span>Live Analysis in Progress</span>
          </div>
          <h3 className="progress-current-title">{currentStage.label}</h3>
          <p className="progress-current-desc">{currentStage.description}</p>
        </div>
        {onCancel && (
          <button
            type="button"
            className="btn-cancel-analysis"
            onClick={onCancel}
            aria-label="Cancel analysis"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Indeterminate animated progress indicator */}
      <div className="progress-bar-container" aria-hidden="true">
        <div className="progress-bar-indeterminate"></div>
      </div>

      <div className="progress-meta-info">
        <span className="progress-target-repo">
          Target: <code>{repo}</code>
        </span>
        <span className="progress-disclaimer">
          Estimated stage progression · AIEE engine runs on FastAPI server
        </span>
      </div>

      {/* Visual stage step checklist */}
      <div className="progress-stages-stepper">
        {ESTIMATED_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const StageIcon = stage.Icon;

          return (
            <div
              key={stage.id}
              className={`stage-step-item ${
                isDone ? "is-completed" : isCurrent ? "is-active" : "is-pending"
              }`}
            >
              <div className="stage-step-icon-wrap" aria-hidden="true">
                <StageIcon size={14} />
              </div>
              <div className="stage-step-label-wrap">
                <span className="stage-step-name">{stage.label}</span>
                <span className="stage-step-status">
                  {isDone
                    ? "In progress..."
                    : isCurrent
                    ? "Processing now"
                    : "Queued"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
