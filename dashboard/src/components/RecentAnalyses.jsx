import { useState } from "react";
import {
  IconHistory,
  IconGitHub,
  IconGitCommit,
  IconClock,
  IconTrash,
  IconRefresh,
  IconExternalLink,
  IconShieldAlert,
  IconShield,
  IconShieldCheck,
  IconChevronDown,
  IconChevronUp,
} from "./Icons";

export default function RecentAnalyses({
  history = [],
  onReopen,
  onRerun,
  onDelete,
  onClearAll,
  currentUser = "",
  disabled = false,
}) {
  const [showAll, setShowAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const displayedItems = showAll ? history : history.slice(0, 3);
  const hasMore = history.length > 3;

  return (
    <section
      className="recent-analyses-section"
      aria-labelledby="recent-analyses-heading"
    >
      <div className="recent-analyses-header">
        <div className="recent-header-left">
          <span className="recent-header-icon" aria-hidden="true">
            <IconHistory size={18} />
          </span>
          <div>
            <h3 id="recent-analyses-heading" className="recent-header-title">
              Recent Analyses
            </h3>
            <span className="recent-header-sub">
              {currentUser
                ? `Saved on this device for @${currentUser}`
                : "Saved locally on this device"}
            </span>
          </div>
        </div>

        <div className="recent-header-actions">
          {history.length > 0 && (
            <>
              {confirmClear ? (
                <div className="confirm-clear-row">
                  <span className="confirm-clear-text">Clear all history?</span>
                  <button
                    type="button"
                    className="btn-danger-mini"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                    }}
                    disabled={disabled}
                    aria-label="Confirm clear all recent analyses"
                  >
                    Yes, clear
                  </button>
                  <button
                    type="button"
                    className="btn-ghost-mini"
                    onClick={() => setConfirmClear(false)}
                    aria-label="Cancel clear history"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-text-subtle"
                  onClick={() => setConfirmClear(true)}
                  disabled={disabled}
                  title="Remove all recent analyses for this user"
                  aria-label="Clear all recent analyses"
                >
                  <IconTrash size={13} />
                  <span>Clear History</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* STORAGE PERSISTENCE NOTICE */}
      <div className="recent-storage-notice">
        <span>
          Reports are cached locally in your browser so you can reopen them instantly without re-running. Durable cross-device sync requires backend database integration.
        </span>
      </div>

      {/* EMPTY STATE */}
      {history.length === 0 ? (
        <div className="recent-empty-state">
          <div className="recent-empty-icon" aria-hidden="true">
            <IconHistory size={28} />
          </div>
          <h4 className="recent-empty-title">No Recent Analyses Yet</h4>
          <p className="recent-empty-desc">
            Repositories you analyze will appear here with saved risk scores and commit details, allowing you to quickly revisit or re-analyze them anytime.
          </p>
        </div>
      ) : (
        <>
          <div className="recent-cards-list">
            {displayedItems.map((item) => {
              const riskClass =
                item.riskLevel === "HIGH"
                  ? "risk-high"
                  : item.riskLevel === "MEDIUM"
                  ? "risk-medium"
                  : "risk-low";

              return (
                <article
                  key={item.id}
                  className="recent-analysis-card"
                  aria-label={`Analysis for ${item.repo}`}
                >
                  <div className="recent-card-main">
                    <div className="recent-repo-row">
                      <IconGitHub
                        size={16}
                        className="recent-gh-icon"
                        aria-hidden="true"
                      />
                      <strong className="recent-repo-name" title={item.repo}>
                        {item.repo}
                      </strong>

                      {item.repo && (
                        <a
                          href={
                            item.repo.startsWith("http")
                              ? item.repo
                              : `https://github.com/${item.repo}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="recent-external-link"
                          title="View repository on GitHub"
                          aria-label={`View ${item.repo} on GitHub`}
                        >
                          <IconExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="recent-meta-row">
                      {item.commitSha && (
                        <span className="recent-meta-item">
                          <IconGitCommit size={13} />
                          <code>{item.commitSha.substring(0, 7)}</code>
                        </span>
                      )}

                      <span className="recent-meta-item">
                        <IconClock size={13} />
                        <span>{item.formattedDate || "Recent"}</span>
                      </span>

                      {typeof item.affectedCount === "number" && (
                        <span className="recent-meta-item">
                          <span>{item.affectedCount} affected files</span>
                        </span>
                      )}
                    </div>

                    {item.commitMessage && (
                      <p className="recent-commit-desc" title={item.commitMessage}>
                        "{item.commitMessage}"
                      </p>
                    )}
                  </div>

                  <div className="recent-card-side">
                    {/* RISK BADGE */}
                    <div className="recent-risk-wrap">
                      <span className={`risk-badge ${riskClass}`}>
                        {item.riskLevel === "HIGH" && (
                          <IconShieldAlert size={12} />
                        )}
                        {item.riskLevel === "MEDIUM" && (
                          <IconShield size={12} />
                        )}
                        {item.riskLevel === "LOW" && (
                          <IconShieldCheck size={12} />
                        )}
                        <span>{item.riskLevel || "LOW"} RISK</span>
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="recent-actions-row">
                      {item.result && (
                        <button
                          type="button"
                          className="btn-recent-action btn-reopen"
                          onClick={() => onReopen(item)}
                          disabled={disabled}
                          title="Open saved analysis report without re-fetching"
                          aria-label={`Open saved report for ${item.repo}`}
                        >
                          <span>Reopen Report</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-recent-action btn-rerun-mini"
                        onClick={() => onRerun(item.repo)}
                        disabled={disabled}
                        title="Re-run live analysis with latest GitHub changes"
                        aria-label={`Re-run live analysis for ${item.repo}`}
                      >
                        <IconRefresh size={12} />
                        <span>Re-analyze</span>
                      </button>

                      <button
                        type="button"
                        className="btn-recent-remove"
                        onClick={() => onDelete(item.id)}
                        disabled={disabled}
                        title="Remove from history"
                        aria-label={`Remove ${item.repo} from history`}
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {hasMore && (
            <div className="recent-view-all-wrap">
              <button
                type="button"
                className="btn-view-all"
                onClick={() => setShowAll((prev) => !prev)}
                aria-expanded={showAll}
              >
                <span>
                  {showAll
                    ? "Show fewer analyses"
                    : `View all ${history.length} analyses`}
                </span>
                {showAll ? (
                  <IconChevronUp size={14} />
                ) : (
                  <IconChevronDown size={14} />
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
