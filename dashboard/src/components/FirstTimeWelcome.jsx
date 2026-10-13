import {
  IconGitHub,
  IconArrowRight,
  IconCheck,
  IconFileCode,
  IconCpu,
} from "./Icons";

export default function FirstTimeWelcome({
  authenticated,
  displayName,
  onSelectSample,
  onFocusInput,
  onLogin,
  sampleRepos = ["Chandanpl/AIEE", "pallets/flask", "fastapi/fastapi"],
}) {
  const greeting = displayName
    ? `Welcome, ${displayName} — analyze your first repository in three simple steps.`
    : "Welcome to AIEE — analyze your first repository in three simple steps.";

  return (
    <section
      className="first-time-welcome-card"
      aria-labelledby="welcome-onboarding-title"
    >
      <div className="welcome-card-header">
        <div className="welcome-badge">
          <span className="welcome-badge-dot" aria-hidden="true"></span>
          <span>Quick Onboarding</span>
        </div>
        <h3 id="welcome-onboarding-title" className="welcome-title">
          {greeting}
        </h3>
        <p className="welcome-desc">
          AIEE is an intelligent change-impact engine. It inspects commit history, maps file dependencies, and runs KMeans &amp; DBSCAN machine-learning models to predict which files in your project are affected when code changes.
        </p>
      </div>

      <div className="welcome-steps-grid">
        {/* STEP 1 */}
        <div className={`welcome-step-card ${authenticated ? "completed" : ""}`}>
          <div className="welcome-step-num-wrap">
            {authenticated ? (
              <span className="welcome-step-check" aria-label="Step 1 complete">
                <IconCheck size={14} />
              </span>
            ) : (
              <span className="welcome-step-num">1</span>
            )}
          </div>
          <div className="welcome-step-content">
            <h4 className="welcome-step-heading">Connect your GitHub account</h4>
            <p className="welcome-step-text">
              Authorizes read access to commit diffs and repository metadata.
            </p>
            {authenticated ? (
              <span className="welcome-step-status-tag">Connected</span>
            ) : (
              <button
                type="button"
                className="btn-step-action"
                onClick={onLogin}
                aria-label="Connect GitHub account"
              >
                <IconGitHub size={13} />
                <span>Connect GitHub</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 2 */}
        <div className="welcome-step-card">
          <div className="welcome-step-num-wrap">
            <span className="welcome-step-num">2</span>
          </div>
          <div className="welcome-step-content">
            <h4 className="welcome-step-heading">
              Paste a repository URL or choose an example
            </h4>
            <p className="welcome-step-text">
              Enter any public GitHub URL (e.g., <code>owner/repo</code>) or pick a sample below:
            </p>
            <div className="welcome-sample-links">
              {sampleRepos.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="welcome-sample-pill"
                  onClick={() => onSelectSample(sample)}
                  title={`Try example ${sample}`}
                >
                  <IconFileCode size={11} />
                  <span>{sample}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="welcome-step-card">
          <div className="welcome-step-num-wrap">
            <span className="welcome-step-num">3</span>
          </div>
          <div className="welcome-step-content">
            <h4 className="welcome-step-heading">
              Click Analyze Repository
            </h4>
            <p className="welcome-step-text">
              Generate an interactive risk report with impacted files and ML clusters.
            </p>
            <button
              type="button"
              className="btn-step-action btn-step-primary"
              onClick={onFocusInput}
              aria-label="Start analysis now"
            >
              <IconCpu size={13} />
              <span>Get Started</span>
              <IconArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
