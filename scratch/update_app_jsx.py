import re

def update_app():
    with open('dashboard/src/App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add import for RepositoryIntelligenceVisual
    if 'import RepositoryIntelligenceVisual' not in content:
        content = content.replace(
            'import GitHubAnalysisHero from "./components/GitHubAnalysisHero";',
            'import GitHubAnalysisHero from "./components/GitHubAnalysisHero";\nimport RepositoryIntelligenceVisual from "./components/RepositoryIntelligenceVisual";'
        )

    # 2. Check current standby structure
    old_standby_pattern = re.compile(
        r'\{\/\* 1\. CENTERED HERO HEADING SECTION \(INITIAL STANDBY VIEW\) \*\/\}[\s\S]*?\{\/\* 3\. COMPACT HORIZONTAL 9-STAGE PIPELINE CHANNEL \(BELOW INPUT\) \*\/\}\s*\{!isFullWidthReportMode && \(\s*<div className="standby-pipeline-channel-wrap">[\s\S]*?<\/div>\s*\)\}',
        re.MULTILINE
    )

    new_section = """{/* 1. TWO-COLUMN HERO SECTION (STANDBY VIEW) */}
        {!isFullWidthReportMode ? (
          <section className="landing-hero-two-column" aria-label="AIEE Repository Intelligence Platform">
            {/* LEFT COLUMN: 3D Repository Intelligence Visualization */}
            <div className="hero-col-visual">
              <RepositoryIntelligenceVisual
                analysisStatus={analysisStatus}
                loading={loading}
                authenticated={authenticated}
              />
            </div>

            {/* RIGHT COLUMN: Eyebrow, Typography, Input Card, Actions */}
            <div className="hero-col-content">
              <div className="hero-eyebrow-badge">
                <span className="eyebrow-dot" aria-hidden="true"></span>
                <span className="eyebrow-text">AI-POWERED REPOSITORY INTELLIGENCE</span>
                <span className="eyebrow-sep" aria-hidden="true">·</span>
                <span className="eyebrow-tag">v1.0</span>
              </div>

              <h1 className="landing-hero-headline">
                Understand Your Code.{" "}
                <span className="landing-headline-gradient">
                  See the Impact.
                </span>
              </h1>

              <p className="landing-hero-description">
                Predictive change-impact propagation powered by git commit mining, AST dependency graph topology, and unsupervised ML clustering. Pinpoint risk and blast radiuses before you merge.
              </p>

              {/* Prominent Repository URL Input Card */}
              <div className="landing-input-card">
                <div className="landing-input-header">
                  <label htmlFor="repository-url-input" className="landing-input-label">
                    GitHub Repository URL
                  </label>
                  <span className="landing-input-helper">
                    Public repositories or authorized private repos
                  </span>
                </div>

                <form
                  className="landing-input-form"
                  onSubmit={handleAnalysisSubmit}
                  role="search"
                  aria-label="Repository Analysis Form"
                >
                  <div className="landing-input-field-wrap">
                    <span className="landing-field-icon" aria-hidden="true">
                      <IconGitHub size={18} />
                    </span>

                    <input
                      id="repository-url-input"
                      type="text"
                      placeholder="https://github.com/owner/repository"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAnalysisSubmit(e);
                        }
                      }}
                      disabled={loading}
                      aria-label="GitHub Repository URL"
                      autoComplete="off"
                      spellCheck="false"
                    />

                    {repo && !loading && (
                      <button
                        type="button"
                        className="landing-input-clear-btn"
                        onClick={() => setRepo("")}
                        title="Clear input"
                        aria-label="Clear repository input"
                      >
                        <IconX size={14} />
                      </button>
                    )}
                  </div>

                  <div className="landing-actions-row">
                    <button
                      type="submit"
                      className="landing-analyze-btn"
                      onClick={handleAnalysisSubmit}
                      disabled={loading || !repo.trim()}
                      id="analyze-submit-btn"
                      title={
                        !repo.trim()
                          ? "Enter a GitHub repository URL to analyze"
                          : "Analyze Repository"
                      }
                      aria-label="Analyze Repository"
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze Repository</span>
                          <IconArrowRight size={15} className="btn-arrow" />
                        </>
                      )}
                    </button>

                    <a
                      href={FEEDBACK_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="landing-feedback-btn"
                      id="top-feedback-btn"
                      title="Share your feedback on AIEE via Google Forms"
                      aria-label="Share your feedback on AIEE (opens in new tab)"
                    >
                      <IconMessageSquare size={14} />
                      <span>Feedback</span>
                    </a>
                  </div>
                </form>

                {/* GitHub Authentication connection action when authentication is required */}
                {!authLoading && !authenticated && (
                  <div className="landing-auth-connection-bar" role="status">
                    <div className="auth-bar-left">
                      <span className="auth-bar-icon" aria-hidden="true">
                        <IconLock size={14} />
                      </span>
                      <span className="auth-bar-text">
                        Login to analyze private repos and access higher GitHub API rate limits.
                      </span>
                    </div>
                    <button
                      type="button"
                      className="landing-auth-login-btn"
                      onClick={loginWithGitHub}
                      id="prompt-github-login-btn"
                      aria-label="Connect GitHub account"
                    >
                      <IconGitHub size={13} />
                      <span>Login with GitHub</span>
                    </button>
                  </div>
                )}

                {/* Authenticated session badge */}
                {!authLoading && authenticated && (
                  <div className="landing-auth-confirmed-bar">
                    <span className="auth-confirmed-dot" aria-hidden="true"></span>
                    <span>
                      Connected to GitHub as <strong>@{githubUser}</strong>
                    </span>
                  </div>
                )}

                {/* Example Repository Guidance & Sample Chips */}
                <div className="landing-samples-section">
                  <div className="samples-label-row">
                    <span className="samples-label">Try an example repository:</span>
                    <span className="samples-hint">Auto-fills the URL</span>
                  </div>
                  <div
                    className="samples-chips-wrap"
                    role="group"
                    aria-label="Example repositories"
                  >
                    {SAMPLE_REPOS.map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        className={`sample-pill-btn ${
                          repo.includes(sample) ? "is-active" : ""
                        }`}
                        onClick={() => {
                          setRepo(`https://github.com/${sample}`);
                          setError("");
                        }}
                        disabled={loading}
                        aria-label={`Use example repository ${sample}`}
                      >
                        <IconGitHub size={12} aria-hidden="true" />
                        <span>{sample}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* 2. REPOSITORY ANALYSIS & EXPANDED FULL-WIDTH REPORT AREA */}
        <div
          className={
            isFullWidthReportMode
              ? "full-width-report-container"
              : "standby-content-container"
          }
        >
          {/* STREAMLINED TOP BAR FOR FULL-WIDTH REPORT MODE */}
          {isFullWidthReportMode && (
            <section
              className="analysis-card analysis-card-compact-bar"
              aria-label="Repository Analysis Bar"
            >
              <form
                className="input-row"
                onSubmit={handleAnalysisSubmit}
                role="search"
                aria-label="Repository Analysis Form"
              >
                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <IconGitHub size={18} />
                  </span>

                  <input
                    id="repository-url-input"
                    type="text"
                    placeholder="https://github.com/owner/repository"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAnalysisSubmit(e);
                      }
                    }}
                    disabled={loading}
                    aria-label="GitHub Repository URL"
                    autoComplete="off"
                    spellCheck="false"
                  />

                  {repo && !loading && (
                    <button
                      type="button"
                      className="input-clear-btn"
                      onClick={() => setRepo("")}
                      title="Clear input"
                      aria-label="Clear repository input"
                    >
                      <IconX size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="analyze-button"
                  onClick={handleAnalysisSubmit}
                  disabled={loading || !repo.trim()}
                  id="analyze-submit-btn"
                  title={
                    !repo.trim()
                      ? "Enter a GitHub repository URL to analyze"
                      : "Analyze Repository"
                  }
                  aria-label="Analyze Repository"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Repository</span>
                      <IconArrowRight size={15} className="btn-arrow" />
                    </>
                  )}
                </button>

                <a
                  href={FEEDBACK_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="top-feedback-btn"
                  id="top-feedback-btn"
                  title="Share your feedback on AIEE via Google Forms"
                  aria-label="Share your feedback on AIEE (opens in new tab)"
                >
                  <IconMessageSquare size={15} />
                  <span>Feedback</span>
                </a>

                <button
                  type="button"
                  className="btn-standby-reset"
                  onClick={resetToStandbyOverview}
                  title="Return to initial standby overview"
                  aria-label="Reset to initial standby overview"
                >
                  <IconRefresh size={14} />
                  <span>Overview</span>
                </button>
              </form>
            </section>
          )}

          {/* 3. COMPACT HORIZONTAL 9-STAGE PIPELINE CHANNEL (BELOW HERO) */}
          {!isFullWidthReportMode && (
            <section className="landing-pipeline-section" aria-label="9-Stage Analysis Pipeline">
              <GitHubAnalysisHero
                authenticated={authenticated}
                githubUser={githubUser}
                profile={profile}
                analysisStatus={analysisStatus}
                loading={loading}
                onLogin={loginWithGitHub}
                compact={false}
              />
            </section>
          )}"""

    match = old_standby_pattern.search(content)
    if not match:
        print("ERROR: Regex did not match!")
        return False

    updated_content = content[:match.start()] + new_section + content[match.end():]
    with open('dashboard/src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print("SUCCESS: App.jsx updated!")
    return True

if __name__ == '__main__':
    update_app()
