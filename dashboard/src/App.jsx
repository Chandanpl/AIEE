import { useEffect, useState, useRef } from "react";
import "./App.css";
import chandanPhoto from "./assets/Chandan.jpeg";
import AIEELogo, { AIEEIcon } from "./components/AIEELogo";
import ProfileMenu from "./components/ProfileMenu";
import ProfileModal from "./components/ProfileModal";
import SettingsModal from "./components/SettingsModal";
import LegalModal from "./components/LegalModal";
import ThemeToggle from "./components/ThemeToggle";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://aiee-89gj.onrender.com"
    : "http://127.0.0.1:8000");

const GITHUB_LOGIN_URL = `${API_BASE_URL}/auth/github/login`;

const AIEE_SESSION_KEY = "aiee_session_id";

function getAuthHeaders() {
  const sessionId = sessionStorage.getItem(AIEE_SESSION_KEY);
  return sessionId ? { Authorization: `Bearer ${sessionId}` } : {};
}

const SAMPLE_REPOS = [
  "Chandanpl/AIEE",
  "pallets/flask",
  "fastapi/fastapi",
];

function App() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [githubUser, setGithubUser] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // Table filtering and search
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [tableSearch, setTableSearch] = useState("");
  const [copiedFile, setCopiedFile] = useState(null);

  // Profile state with localStorage persistence
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("aiee_user_profile");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage:", e);
    }

    return {
      displayName: "Chandan P L",
      photoUrl: chandanPhoto,
    };
  });

  // Theme state with localStorage persistence (default dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("aiee_theme") || "dark";
  });

  // Modals & Menu visibility
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [legalModalState, setLegalModalState] = useState({
    isOpen: false,
    type: "terms",
  });

  const profileButtonRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("aiee_theme", theme);
  }, [theme]);

  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);

    try {
      localStorage.setItem("aiee_user_profile", JSON.stringify(newProfile));
    } catch (e) {
      console.error("Failed to save profile to localStorage:", e);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  // =========================================================
  // CHECK GITHUB AUTHENTICATION
  // =========================================================
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Capture the AIEE session ID returned by the OAuth callback.
        const fragment = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;

        if (fragment) {
          const fragmentParams = new URLSearchParams(fragment);
          const sessionFromCallback =
            fragmentParams.get("aiee_session");

          if (sessionFromCallback) {
            sessionStorage.setItem(
              AIEE_SESSION_KEY,
              sessionFromCallback
            );

            // Remove the session ID from the address bar.
            window.history.replaceState(
              null,
              document.title,
              `${window.location.pathname}${window.location.search}`
            );
          }
        }

        const response = await fetch(`${API_BASE_URL}/auth/status`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not verify authentication."
          );
        }

        if (data.authenticated) {
          setAuthenticated(true);
          setGithubUser(data.github_user || data.name || "");
        } else {
          setAuthenticated(false);
          setGithubUser("");
          sessionStorage.removeItem(AIEE_SESSION_KEY);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthenticated(false);
        setGithubUser("");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // =========================================================
  // GITHUB LOGIN
  // =========================================================
  const loginWithGitHub = () => {
    window.location.href = GITHUB_LOGIN_URL;
  };

  // =========================================================
  // GITHUB LOGOUT
  // =========================================================
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/github/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      sessionStorage.removeItem(AIEE_SESSION_KEY);
      setAuthenticated(false);
      setGithubUser("");
      setResult(null);
    }
  };

  // =========================================================
  // ANALYZE REPOSITORY
  // =========================================================
  const analyzeRepository = async () => {
    setError("");

    if (!authenticated) {
      setError("Please login with GitHub before analyzing a repository.");
      return;
    }

    if (!repo.trim()) {
      setError(
        "Please enter a GitHub repository URL or repository slug (e.g. owner/repo)."
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setRiskFilter("ALL");
    setTableSearch("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/analyze?repo=${encodeURIComponent(repo.trim())}`,
        {
          method: "POST",
          credentials: "include",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Repository analysis failed.");
      }

      setResult(data);
    } catch (err) {
      console.error("AIEE analysis error:", err);
      setError(err.message || "Unable to connect to the AIEE backend.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedFile(text);
      setTimeout(() => setCopiedFile(null), 2000);
    }
  };

  // =========================================================
  // RISK HELPERS & COUNTS
  // =========================================================
  const getRiskClass = (risk) => {
    if (risk === "HIGH") return "risk-high";
    if (risk === "MEDIUM") return "risk-medium";
    return "risk-low";
  };

  const recommendations = result?.recommendations || [];
  const highRiskCount = recommendations.filter(
    (r) => r.risk_level === "HIGH"
  ).length;
  const mediumRiskCount = recommendations.filter(
    (r) => r.risk_level === "MEDIUM"
  ).length;
  const lowRiskCount = recommendations.filter(
    (r) => r.risk_level === "LOW"
  ).length;

  const filteredRecommendations = recommendations.filter((item) => {
    const matchesRisk =
      riskFilter === "ALL" || item.risk_level === riskFilter;

    const searchTerm = tableSearch.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      (item.affected_file || "").toLowerCase().includes(searchTerm) ||
      (item.reason || "").toLowerCase().includes(searchTerm);

    return matchesRisk && matchesSearch;
  });

  return (
    <div className="app">
      {/* ===================================================
          TOPBAR HEADER
      =================================================== */}
      <header className="topbar" role="banner">
        <div className="topbar-left">
          <AIEELogo
            iconSize={38}
            showText={true}
            subtitle="Intelligent GitHub Change Impact Analysis"
          />
        </div>

        <div className="header-actions">
          <div
            className="status"
            title="FastAPI Engine connection status"
          >
            <span className="status-dot" aria-hidden="true"></span>
            <span className="status-text">Engine Online</span>
            <span className="status-meta">Render v1.0</span>
          </div>

          <ThemeToggle
            theme={theme}
            onThemeChange={handleThemeChange}
            showLabel={false}
          />

          {authLoading && (
            <div className="auth-loading" aria-live="polite">
              <span className="spinner-mini"></span>
              <span>Checking session...</span>
            </div>
          )}

          {!authLoading && !authenticated && (
            <button
              type="button"
              className="github-login-button"
              onClick={loginWithGitHub}
              id="github-login-btn"
              aria-label="Login with GitHub"
            >
              <svg
                className="github-login-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Login with GitHub</span>
            </button>
          )}

          {!authLoading && authenticated && (
            <div className="user-profile-wrapper" ref={profileButtonRef}>
              <button
                type="button"
                className="profile-trigger-btn"
                onClick={() =>
                  setProfileMenuOpen((prev) => !prev)
                }
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                id="user-profile-trigger"
              >
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile?.displayName || githubUser}
                    className="profile-trigger-avatar"
                  />
                ) : (
                  <div className="profile-trigger-initials">
                    {(profile?.displayName || githubUser || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="profile-trigger-meta">
                  <span className="profile-trigger-name">
                    {profile?.displayName || githubUser || "User"}
                  </span>
                  {githubUser && (
                    <span className="profile-trigger-tag">
                      @{githubUser}
                    </span>
                  )}
                </div>

                <span
                  className={`profile-trigger-arrow ${
                    profileMenuOpen ? "open" : ""
                  }`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>

              <ProfileMenu
                isOpen={profileMenuOpen}
                onClose={() => setProfileMenuOpen(false)}
                displayName={profile?.displayName}
                githubUser={githubUser}
                profilePhoto={profile?.photoUrl}
                onOpenProfile={() => {
                  setProfileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                onOpenSettings={() => {
                  setProfileMenuOpen(false);
                  setSettingsModalOpen(true);
                }}
                onOpenTerms={() => {
                  setProfileMenuOpen(false);
                  setLegalModalState({
                    isOpen: true,
                    type: "terms",
                  });
                }}
                onOpenPrivacy={() => {
                  setProfileMenuOpen(false);
                  setLegalModalState({
                    isOpen: true,
                    type: "privacy",
                  });
                }}
                onLogout={() => {
                  setProfileMenuOpen(false);
                  logout();
                }}
                anchorRef={profileButtonRef}
              />
            </div>
          )}
        </div>
      </header>
	      {/* ===================================================
          MAIN CONTENT
      =================================================== */}
      <main className="container" id="main-content">
        {/* HERO SECTION */}
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-content">
            <div className="eyebrow-pill">
              <span className="eyebrow-circuit-node"></span>
              <span className="eyebrow">
                AI-POWERED REPOSITORY INTELLIGENCE
              </span>
            </div>

            <h1 id="hero-heading" className="hero-title">
              Understand the impact of{" "}
              <span className="hero-gradient-text">
                every code change.
              </span>
            </h1>

            <p className="hero-description">
              AIEE analyzes repository history, file dependencies,
              change frequency, and machine-learning clusters to
              identify potentially affected files before bugs reach
              production.
            </p>

            <div
              className="feature-pills-row"
              aria-label="Engine Capabilities"
            >
              <div className="feature-pill">
                <span className="feature-pill-icon">⚡</span>
                <span>Git History Mining</span>
              </div>
              <div className="feature-pill">
                <span className="feature-pill-icon">🕸️</span>
                <span>Dependency Graphs</span>
              </div>
              <div className="feature-pill">
                <span className="feature-pill-icon">🧬</span>
                <span>KMeans &amp; DBSCAN ML</span>
              </div>
              <div className="feature-pill">
                <span className="feature-pill-icon">🎯</span>
                <span>Hybrid Risk Scoring</span>
              </div>
            </div>
          </div>
        </section>

        {/* REPOSITORY ANALYSIS CARD */}
        <section
          className="analysis-card"
          aria-labelledby="analysis-heading"
        >
          <div className="analysis-card-top">
            <div>
              <div className="analysis-label-row">
                <h2
                  id="analysis-heading"
                  className="analysis-card-title"
                >
                  Repository Analysis
                </h2>
                <span className="analysis-tag">Core Engine</span>
              </div>

              <p className="analysis-card-desc">
                Enter a GitHub repository URL to mine commit diffs
                and compute predictive change-impact propagation.
              </p>
            </div>

            <div className="analysis-auth-badge-wrap">
              {authenticated ? (
                <div
                  className="auth-status-pill auth-connected"
                  title="Verified GitHub Session"
                >
                  <span className="auth-status-dot"></span>
                  <span>
                    Authenticated as <strong>@{githubUser}</strong>
                  </span>
                </div>
              ) : (
                <div
                  className="auth-status-pill auth-required"
                  title="Login Required"
                >
                  <span className="auth-status-dot-amber"></span>
                  <span>Authentication Required</span>
                </div>
              )}
            </div>
          </div>

          {/* INPUT AND ACTION ROW */}
          <div className="input-row">
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </span>

              <input
                id="repository-url-input"
                type="text"
                placeholder="https://github.com/username/repository or username/repository"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && authenticated) {
                    analyzeRepository();
                  }
                }}
                disabled={loading}
                aria-label="GitHub Repository URL"
              />

              {repo && !loading && (
                <button
                  type="button"
                  className="input-clear-btn"
                  onClick={() => setRepo("")}
                  title="Clear input"
                  aria-label="Clear repository input"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              className="analyze-button"
              onClick={analyzeRepository}
              disabled={loading || !authenticated || !repo.trim()}
              id="analyze-submit-btn"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Analyzing Repository...</span>
                </>
              ) : (
                <>
                  <span>Analyze Repository</span>
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </>
              )}
            </button>
          </div>

          {/* QUICK SAMPLE REPOSITORIES */}
          <div className="sample-repos-row">
            <span className="sample-repos-label">Quick samples:</span>
            <div className="sample-repos-chips">
              {SAMPLE_REPOS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="sample-repo-pill"
                  onClick={() =>
                    setRepo(`https://github.com/${sample}`)
                  }
                  disabled={loading}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* LOGIN REQUIRED BANNER */}
          {!authLoading && !authenticated && (
            <div className="login-required-banner" role="alert">
              <div className="login-required-left">
                <span className="banner-icon">🔒</span>
                <div>
                  <strong>GitHub Authentication Required</strong>
                  <p>
                    Please connect your GitHub account to authorize
                    repository inspection, commit history mining,
                    and ML cluster generation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn-login-inline"
                onClick={loginWithGitHub}
              >
                Login with GitHub →
              </button>
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div className="error-message-banner" role="alert">
              <span className="error-icon">⚠️</span>
              <div className="error-content">
                <strong>Analysis Failed:</strong>
                <span>{error}</span>
              </div>
              <button
                type="button"
                className="error-dismiss-btn"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}
        </section>

        {/* LOADING STATE */}
        {loading && (
          <section className="loading-card" aria-live="polite">
            <div className="loading-circuit-wrap">
              <AIEEIcon
                size={52}
                className="pulsing-circuit-logo"
              />
            </div>

            <h3 className="loading-title">
              Analyzing repository architecture...
            </h3>

            <p className="loading-subtitle">
              Mining repository commit history, building file
              dependency matrix, and running KMeans &amp; DBSCAN
              machine-learning models.
            </p>

            <div className="loading-steps-list">
              <div className="loading-step active">
                <span className="step-dot pulse"></span>
                <span>
                  Inspecting recent commits and file change diffs
                </span>
              </div>
              <div className="loading-step active">
                <span className="step-dot pulse"></span>
                <span>
                  Calculating dependency graph and co-change frequency
                </span>
              </div>
              <div className="loading-step active">
                <span className="step-dot pulse"></span>
                <span>
                  Executing KMeans &amp; DBSCAN clustering algorithms
                </span>
              </div>
              <div className="loading-step active">
                <span className="step-dot pulse"></span>
                <span>
                  Ranking potentially affected files by hybrid risk score
                </span>
              </div>
            </div>

            <span className="loading-hint">
              This process typically takes 10–25 seconds for
              repositories with rich history.
            </span>
          </section>
        )}
	        {/* RESULTS SECTION */}
        {result && !loading && (
          <section
            className="results"
            id="analysis-results"
            aria-label="Analysis Results"
          >
            {/* RESULTS HEADER */}
            <div className="result-header-bar">
              <div className="result-header-info">
                <div className="result-badge-row">
                  <span className="completed-badge">
                    <span className="badge-dot-green"></span>
                    Analysis Completed
                  </span>
                  <span className="timestamp-badge">
                    Realtime Inference
                  </span>
                </div>

                <h2 className="result-main-title">
                  Repository Impact Analysis
                </h2>

                <div className="repo-address-row">
                  <svg
                    className="repo-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>

                  <span className="repo-name">
                    {result.repository}
                  </span>

                  {result.repository?.startsWith("http") && (
                    <a
                      href={result.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-external-link"
                      title="Open repository in GitHub"
                    >
                      ↗
                    </a>
                  )}
                </div>
              </div>

              <div className="result-actions">
                <button
                  type="button"
                  className="btn-secondary btn-rerun"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    document
                      .getElementById("repository-url-input")
                      ?.focus();
                  }}
                >
                  Analyze Another Repo
                </button>
              </div>
            </div>

            {/* SUMMARY METRICS */}
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-card-header">
                  <span className="summary-label">Changed Files</span>
                  <span className="summary-icon-chip">📝</span>
                </div>
                <strong className="summary-value">
                  {result.changed_files?.length || 0}
                </strong>
                <small className="summary-sub">
                  Detected in latest commit
                </small>
              </div>

              <div className="summary-card">
                <div className="summary-card-header">
                  <span className="summary-label">
                    Affected Recommendations
                  </span>
                  <span className="summary-icon-chip">🎯</span>
                </div>
                <strong className="summary-value">
                  {result.total_recommendations ||
                    recommendations.length}
                </strong>
                <small className="summary-sub">
                  Potentially impacted files
                </small>
              </div>

              <div className="summary-card highlight-risk">
                <div className="summary-card-header">
                  <span className="summary-label">High Risk Files</span>
                  <span className="summary-icon-chip risk-alert">
                    ⚠️
                  </span>
                </div>
                <strong className="summary-value high-number">
                  {highRiskCount}
                </strong>
                <small className="summary-sub">
                  Requires prioritized code review
                </small>
              </div>

              <div className="summary-card">
                <div className="summary-card-header">
                  <span className="summary-label">
                    Historical Commits
                  </span>
                  <span className="summary-icon-chip">📜</span>
                </div>
                <strong className="summary-value">
                  {result.historical_analysis?.commits_processed || 0}
                </strong>
                <small className="summary-sub">
                  Mined for co-change relationships
                </small>
              </div>
            </div>

            {/* RISK OVERVIEW */}
            <div className="risk-overview">
              <div className="overview-header">
                <div>
                  <h3 className="section-title">
                    Risk Distribution
                  </h3>
                  <p className="section-subtitle">
                    Distribution of potentially affected files
                    prioritized by AIEE risk scores.
                  </p>
                </div>

                {recommendations.length > 0 && (
                  <div
                    className="risk-ratio-bar-wrap"
                    aria-label="Risk proportions"
                  >
                    <div
                      className="risk-bar-segment segment-high"
                      style={{
                        width: `${
                          (highRiskCount / recommendations.length) * 100
                        }%`,
                      }}
                      title={`High Risk: ${highRiskCount}`}
                    />
                    <div
                      className="risk-bar-segment segment-medium"
                      style={{
                        width: `${
                          (mediumRiskCount / recommendations.length) * 100
                        }%`,
                      }}
                      title={`Medium Risk: ${mediumRiskCount}`}
                    />
                    <div
                      className="risk-bar-segment segment-low"
                      style={{
                        width: `${
                          (lowRiskCount / recommendations.length) * 100
                        }%`,
                      }}
                      title={`Low Risk: ${lowRiskCount}`}
                    />
                  </div>
                )}
              </div>

              <div className="risk-grid">
                <div
                  className={`risk-box high-box ${
                    riskFilter === "HIGH" ? "active-filter" : ""
                  }`}
                  onClick={() =>
                    setRiskFilter(
                      riskFilter === "HIGH" ? "ALL" : "HIGH"
                    )
                  }
                  role="button"
                  tabIndex={0}
                  title="Click to filter table by HIGH risk"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setRiskFilter(
                        riskFilter === "HIGH" ? "ALL" : "HIGH"
                      );
                    }
                  }}
                >
                  <div className="risk-box-top">
                    <div className="risk-title">HIGH RISK</div>
                    <span className="risk-filter-hint">
                      {riskFilter === "HIGH" ? "Filtered" : "Filter"}
                    </span>
                  </div>
                  <div className="risk-value">{highRiskCount}</div>
                  <span className="risk-desc">
                    Immediate testing advised
                  </span>
                </div>

                <div
                  className={`risk-box medium-box ${
                    riskFilter === "MEDIUM" ? "active-filter" : ""
                  }`}
                  onClick={() =>
                    setRiskFilter(
                      riskFilter === "MEDIUM" ? "ALL" : "MEDIUM"
                    )
                  }
                  role="button"
                  tabIndex={0}
                  title="Click to filter table by MEDIUM risk"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setRiskFilter(
                        riskFilter === "MEDIUM" ? "ALL" : "MEDIUM"
                      );
                    }
                  }}
                >
                  <div className="risk-box-top">
                    <div className="risk-title">MEDIUM RISK</div>
                    <span className="risk-filter-hint">
                      {riskFilter === "MEDIUM" ? "Filtered" : "Filter"}
                    </span>
                  </div>
                  <div className="risk-value">{mediumRiskCount}</div>
                  <span className="risk-desc">
                    Recommended validation
                  </span>
                </div>

                <div
                  className={`risk-box low-box ${
                    riskFilter === "LOW" ? "active-filter" : ""
                  }`}
                  onClick={() =>
                    setRiskFilter(
                      riskFilter === "LOW" ? "ALL" : "LOW"
                    )
                  }
                  role="button"
                  tabIndex={0}
                  title="Click to filter table by LOW risk"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setRiskFilter(
                        riskFilter === "LOW" ? "ALL" : "LOW"
                      );
                    }
                  }}
                >
                  <div className="risk-box-top">
                    <div className="risk-title">LOW RISK</div>
                    <span className="risk-filter-hint">
                      {riskFilter === "LOW" ? "Filtered" : "Filter"}
                    </span>
                  </div>
                  <div className="risk-value">{lowRiskCount}</div>
                  <span className="risk-desc">
                    Indirect co-change pattern
                  </span>
                </div>
              </div>
            </div>

            {/* LATEST CHANGED FILES */}
            <div className="data-card">
              <div className="data-card-header">
                <div>
                  <h3 className="section-title">
                    Latest Changed Files
                  </h3>
                  <p className="section-subtitle">
                    Files identified in the latest repository commit
                    that triggered this analysis.
                  </p>
                </div>
                <span className="count-badge">
                  {result.changed_files?.length || 0}
                </span>
              </div>

              <div className="file-list">
                {result.changed_files &&
                result.changed_files.length > 0 ? (
                  result.changed_files.map((file, index) => (
                    <div
                      className="file-item"
                      key={`${file}-${index}`}
                    >
                      <span className="file-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="file-icon" aria-hidden="true">
                        📄
                      </span>
                      <span className="file-name" title={file}>
                        {file}
                      </span>
                      <button
                        type="button"
                        className="file-copy-btn"
                        onClick={() => copyToClipboard(file)}
                        title="Copy file path"
                      >
                        {copiedFile === file ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state-text">
                    No changed files detected in latest commit.
                  </div>
                )}
              </div>
            </div>
	            {/* POTENTIALLY AFFECTED FILES TABLE */}
            <div className="data-card">
              <div className="data-card-header table-card-header">
                <div>
                  <h3 className="section-title">
                    Potentially Affected Files
                  </h3>
                  <p className="section-subtitle">
                    Ranked using AIEE's hybrid change-impact scoring
                    and historical dependency heuristics.
                  </p>
                </div>

                <div className="table-controls">
                  <div className="table-search-wrap">
                    <input
                      type="text"
                      className="table-search-input"
                      placeholder="Search affected files..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      aria-label="Search affected files"
                    />

                    {tableSearch && (
                      <button
                        type="button"
                        className="table-search-clear"
                        onClick={() => setTableSearch("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div
                    className="filter-button-group"
                    role="group"
                    aria-label="Filter by risk"
                  >
                    {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`filter-btn ${
                          riskFilter === level ? "active" : ""
                        }`}
                        onClick={() => setRiskFilter(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>

                  <span
                    className="count-badge"
                    title="Showing matching files"
                  >
                    {filteredRecommendations.length} /{" "}
                    {recommendations.length}
                  </span>
                </div>
              </div>

              <div
                className="table-wrapper"
                tabIndex={0}
                aria-label="Affected files table"
              >
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Affected File</th>
                      <th scope="col">Risk Level</th>
                      <th scope="col">Score</th>
                      <th scope="col">Dependency</th>
                      <th scope="col">Frequency</th>
                      <th scope="col">KMeans</th>
                      <th scope="col">DBSCAN</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecommendations.length > 0 ? (
                      filteredRecommendations.map((item, index) => (
                        <tr key={`${item.affected_file}-${index}`}>
                          <td>
                            <div className="table-file">
                              <span className="file-symbol">#</span>
                              <span
                                className="table-file-path"
                                title={item.affected_file}
                              >
                                {item.affected_file}
                              </span>
                              <button
                                type="button"
                                className="cell-copy-btn"
                                onClick={() =>
                                  copyToClipboard(item.affected_file)
                                }
                                title="Copy path"
                              >
                                {copiedFile === item.affected_file
                                  ? "✓"
                                  : "📋"}
                              </button>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`risk-badge ${getRiskClass(
                                item.risk_level
                              )}`}
                            >
                              {item.risk_level}
                            </span>
                          </td>

                          <td>
                            <div className="score-cell">
                              <strong className="score-number">
                                {item.final_score}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span className="metric-cell-value">
                              {item.dependency_count ?? 0}
                            </span>
                          </td>

                          <td>
                            <span className="metric-cell-value">
                              {item.file_frequency ?? 0}
                            </span>
                          </td>

                          <td>
                            <span className="cluster-tag">
                              {item.kmeans_cluster !== undefined &&
                              item.kmeans_cluster !== null
                                ? `C${item.kmeans_cluster}`
                                : "—"}
                            </span>
                          </td>

                          <td>
                            <span className="cluster-tag">
                              {item.dbscan_cluster !== undefined &&
                              item.dbscan_cluster !== null
                                ? `G${item.dbscan_cluster}`
                                : "—"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-empty-row">
                          No affected files matching current filter
                          criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IMPACT EXPLANATIONS */}
            <div className="data-card">
              <div className="data-card-header">
                <div>
                  <h3 className="section-title">
                    Impact Explanations
                  </h3>
                  <p className="section-subtitle">
                    Algorithmic rationale explaining why AIEE
                    identified these files as potentially affected.
                  </p>
                </div>
                <span className="count-badge">
                  {recommendations.length}
                </span>
              </div>

              <div className="recommendation-list">
                {recommendations.map((item, index) => (
                  <div
                    className="recommendation-item"
                    key={`${item.affected_file}-reason-${index}`}
                  >
                    <div className="recommendation-top">
                      <div className="recommendation-file">
                        <span className="rec-index-badge">
                          {index + 1}
                        </span>
                        <strong className="rec-file-name">
                          {item.affected_file}
                        </strong>
                      </div>

                      <div className="rec-badges-right">
                        <span className="rec-score-pill">
                          Score: {item.final_score}
                        </span>
                        <span
                          className={`risk-badge ${getRiskClass(
                            item.risk_level
                          )}`}
                        >
                          {item.risk_level}
                        </span>
                      </div>
                    </div>

                    <p className="reason">{item.reason}</p>

                    {item.changed_files &&
                      item.changed_files.length > 0 && (
                        <div className="affected-by">
                          <span className="affected-by-label">
                            Triggered by changes in:
                          </span>
                          <div className="affected-by-chips">
                            {item.changed_files.map(
                              (file, fileIndex) => (
                                <span
                                  className="mini-file"
                                  key={`${file}-${fileIndex}`}
                                  title={file}
                                >
                                  {file}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* MACHINE LEARNING PIPELINE */}
            <div className="data-card">
              <div className="data-card-header">
                <div>
                  <h3 className="section-title">
                    Machine Learning Intelligence
                  </h3>
                  <p className="section-subtitle">
                    Repository-specific models and historical
                    co-change mining used by AIEE.
                  </p>
                </div>
                <span className="count-badge">4 Engines</span>
              </div>

              <div className="ml-grid">
                <div className="ml-card">
                  <div className="ml-card-head">
                    <div className="ml-icon">K</div>
                    <span className="ml-status">
                      {result.ml_pipeline?.kmeans || "Generated"}
                    </span>
                  </div>
                  <h4>KMeans Clustering</h4>
                  <p>
                    Partitions files into behavioral clusters based
                    on commit frequencies and dependency graph
                    centrality.
                  </p>
                </div>

                <div className="ml-card">
                  <div className="ml-card-head">
                    <div className="ml-icon">D</div>
                    <span className="ml-status">
                      {result.ml_pipeline?.dbscan || "Generated"}
                    </span>
                  </div>
                  <h4>DBSCAN Clustering</h4>
                  <p>
                    Density-based spatial clustering that uncovers
                    dense co-change groups and isolates outlier
                    propagation chains.
                  </p>
                </div>

                <div className="ml-card">
                  <div className="ml-card-head">
                    <div className="ml-icon">H</div>
                    <span className="ml-status">Processed</span>
                  </div>
                  <h4>Repository History Mining</h4>
                  <p>
                    Analyzed{" "}
                    {result.historical_analysis?.commits_processed || 0}{" "}
                    commits, indexing{" "}
                    {result.historical_analysis?.unique_files || 0}{" "}
                    unique files and{" "}
                    {result.historical_analysis?.co_change_relationships ||
                      0}{" "}
                    co-change associations.
                  </p>
                </div>

                <div className="ml-card">
                  <div className="ml-card-head">
                    <div className="ml-icon">F</div>
                    <span className="ml-status">
                      {result.ml_pipeline?.feature_dataset ||
                        "Generated"}
                    </span>
                  </div>
                  <h4>Feature Engineering</h4>
                  <p>
                    Extracted multi-dimensional structural features
                    combining dependency degrees, file recency, and
                    historical commit velocity.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer role="contentinfo">
        <div className="developer-credit">
          <img
            src={chandanPhoto}
            alt="Chandan P L"
            className="developer-photo"
          />
          <span className="developer-text">
            <span>Developed by</span>
            <strong className="developer-name">Chandan P L</strong>
            <span className="developer-divider" aria-hidden="true">
              |
            </span>
            <span className="developer-role">AI/ML Engineer</span>
          </span>
        </div>

        <p className="footer-tagline">
          AI-Evolution-Engine · Intelligent GitHub Change Impact
          Analysis · Enterprise Edition
        </p>

        <div className="footer-links">
          <button
            type="button"
            className="footer-link-btn"
            onClick={() =>
              setLegalModalState({
                isOpen: true,
                type: "terms",
              })
            }
          >
            Terms &amp; Conditions
          </button>

          <span className="footer-dot">•</span>

          <button
            type="button"
            className="footer-link-btn"
            onClick={() =>
              setLegalModalState({
                isOpen: true,
                type: "privacy",
              })
            }
          >
            Privacy Policy
          </button>

          <span className="footer-dot">•</span>

          <button
            type="button"
            className="footer-link-btn"
            onClick={() => setSettingsModalOpen(true)}
          >
            Settings
          </button>
        </div>
      </footer>

      {/* MODALS */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profile}
        githubUser={githubUser}
        onSaveProfile={handleSaveProfile}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
        profile={profile}
        githubUser={githubUser}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenTerms={() =>
          setLegalModalState({
            isOpen: true,
            type: "terms",
          })
        }
        onOpenPrivacy={() =>
          setLegalModalState({
            isOpen: true,
            type: "privacy",
          })
        }
        onLogout={logout}
      />

      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() =>
          setLegalModalState({
            isOpen: false,
            type: "terms",
          })
        }
        type={legalModalState.type}
      />
    </div>
  );
}

export default App;