import { useEffect, useState, useRef } from "react";
import "./App.css";
import chandanPhoto from "./assets/Chandan.jpeg";
import ProfileMenu from "./components/ProfileMenu";
import ProfileModal from "./components/ProfileModal";
import SettingsModal from "./components/SettingsModal";
import LegalModal from "./components/LegalModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const GITHUB_LOGIN_URL =
  `${API_BASE_URL}/auth/github/login`;

function App() {
  const [repo, setRepo] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const [authenticated, setAuthenticated] =
    useState(false);

  const [githubUser, setGithubUser] =
    useState("");

  const [authLoading, setAuthLoading] =
    useState(true);

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

  // Theme state with localStorage persistence
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

        const response = await fetch(
          `${API_BASE_URL}/auth/status`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.authenticated) {

          setAuthenticated(true);

          setGithubUser(
            data.github_user ||
            data.name ||
            ""
          );

        } else {

          setAuthenticated(false);

          setGithubUser("");

        }

      } catch (error) {

        console.error(
          "Authentication check failed:",
          error
        );

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

    window.location.href =
      GITHUB_LOGIN_URL;

  };


  // =========================================================
  // GITHUB LOGOUT
  // =========================================================

  const logout = async () => {

    try {

      await fetch(
        `${API_BASE_URL}/auth/github/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    }

    setAuthenticated(false);

    setGithubUser("");

    setResult(null);

  };


  // =========================================================
  // ANALYZE REPOSITORY
  // =========================================================

  const analyzeRepository = async () => {

    setError("");

    // -------------------------------------------------------
    // Check authentication
    // -------------------------------------------------------

    if (!authenticated) {

      setError(
        "Please login with GitHub before analyzing a repository."
      );

      return;

    }

    // -------------------------------------------------------
    // Check repository URL
    // -------------------------------------------------------

    if (!repo.trim()) {

      setError(
        "Please enter a GitHub repository URL."
      );

      return;

    }

    setLoading(true);

    setResult(null);

    try {

      const response = await fetch(
        `${API_BASE_URL}/analyze?repo=${encodeURIComponent(
          repo.trim()
        )}`,
        {
          method: "POST",

          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Repository analysis failed."
        );

      }

      setResult(data);

    } catch (err) {

      console.error(
        "AIEE analysis error:",
        err
      );

      setError(
        err.message ||
        "Unable to connect to the AIEE backend."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // RISK CLASS
  // =========================================================

  const getRiskClass = (risk) => {

    if (risk === "HIGH") {
      return "risk-high";
    }

    if (risk === "MEDIUM") {
      return "risk-medium";
    }

    return "risk-low";

  };


  // =========================================================
  // RECOMMENDATIONS
  // =========================================================

  const recommendations =
    result?.recommendations || [];


  const highRiskCount =
    recommendations.filter(
      (item) =>
        item.risk_level === "HIGH"
    ).length;


  const mediumRiskCount =
    recommendations.filter(
      (item) =>
        item.risk_level === "MEDIUM"
    ).length;


  const lowRiskCount =
    recommendations.filter(
      (item) =>
        item.risk_level === "LOW"
    ).length;


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="app">


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            A
          </div>

          <div>

            <h1>
              AI-Evolution-Engine
            </h1>

            <p>
              Intelligent GitHub Change Impact Analysis
            </p>

          </div>

        </div>


        <div className="header-actions">


          {/* ===============================================
              ENGINE STATUS
          =============================================== */}

          <div className="status">

            <span className="status-dot"></span>

            AIEE Engine Online

          </div>


          {/* ===============================================
              AUTH LOADING
          =============================================== */}

          {authLoading && (

            <div className="auth-loading">
              Checking session...
            </div>

          )}


          {/* ===============================================
              LOGIN
          =============================================== */}

          {!authLoading && !authenticated && (
            <button
              className="github-login-button"
              onClick={loginWithGitHub}
            >
              <svg
                className="github-login-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              Login with GitHub
            </button>
          )}

          {/* ===============================================
              LOGGED IN USER / PROFILE DROPDOWN
          =============================================== */}

          {!authLoading && authenticated && (
            <div className="user-profile-wrapper" ref={profileButtonRef}>
              <button
                className="profile-trigger-btn"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
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

                <span className="profile-trigger-name">
                  {profile?.displayName || githubUser || "User"}
                </span>

                <span
                  className={`profile-trigger-arrow ${profileMenuOpen ? "open" : ""
                    }`}
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
                  setLegalModalState({ isOpen: true, type: "terms" });
                }}
                onOpenPrivacy={() => {
                  setProfileMenuOpen(false);
                  setLegalModalState({ isOpen: true, type: "privacy" });
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
          MAIN
      =================================================== */}

      <main className="container">


        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">

          <div className="hero-content">

            <span className="eyebrow">
              AI-POWERED REPOSITORY ANALYSIS
            </span>

            <h2>
              Understand the impact of
              <span>
                every code change.
              </span>
            </h2>

            <p>
              AIEE analyzes GitHub repository history,
              file dependencies, change frequency and
              machine-learning clusters to identify
              potentially affected files.
            </p>

          </div>

        </section>


        {/* =================================================
            REPOSITORY INPUT
        ================================================= */}

        <section className="analysis-card">

          <div className="section-heading">

            <div>

              <h3>
                Analyze Repository
              </h3>

              <p>
                Enter a GitHub repository URL
                to analyze its latest changes.
              </p>

            </div>

          </div>


          <div className="input-row">

            <div className="input-wrapper">

              <span className="input-icon">
                ↗
              </span>

              <input
                type="text"
                placeholder="https://github.com/username/repository"
                value={repo}
                onChange={(e) =>
                  setRepo(e.target.value)
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    analyzeRepository();

                  }

                }}
              />

            </div>


            <button
              className="analyze-button"
              onClick={analyzeRepository}
              disabled={
                loading ||
                !authenticated
              }
            >

              {loading ? (

                <>

                  <span className="spinner"></span>

                  Analyzing...

                </>

              ) : (

                <>

                  Analyze Repository

                  <span>
                    →
                  </span>

                </>

              )}

            </button>

          </div>


          {/* =============================================
              LOGIN MESSAGE
          ============================================= */}

          {!authLoading &&
            !authenticated && (

              <div className="login-required">

                <span>
                  GitHub login required
                </span>

                <button
                  onClick={loginWithGitHub}
                >
                  Login with GitHub →
                </button>

              </div>

            )}


          {/* =============================================
              ERROR
          ============================================= */}

          {error && (

            <div className="error-message">

              <strong>
                Analysis failed:
              </strong>{" "}

              {error}

            </div>

          )}

        </section>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <section className="loading-card">

            <div className="loading-spinner"></div>

            <h3>
              Analyzing repository...
            </h3>

            <p>
              Detecting changes, processing repository
              history and running ML analysis.
            </p>

          </section>

        )}


        {/* =================================================
            RESULTS
        ================================================= */}

        {result && !loading && (

          <section className="results">


            {/* =============================================
                RESULT HEADER
            ============================================= */}

            <div className="result-header">

              <div>

                <span className="eyebrow">
                  ANALYSIS COMPLETED
                </span>

                <h2>
                  Repository Impact Analysis
                </h2>

                <p className="repo-name">
                  {result.repository}
                </p>

              </div>


              <div className="completed-badge">
                Analysis Completed
              </div>

            </div>


            {/* =============================================
                SUMMARY
            ============================================= */}

            <div className="summary-grid">


              <div className="summary-card">

                <span className="summary-label">
                  Changed Files
                </span>

                <strong>
                  {result.changed_files?.length || 0}
                </strong>

                <small>
                  Latest repository changes
                </small>

              </div>


              <div className="summary-card">

                <span className="summary-label">
                  Affected Files
                </span>

                <strong>
                  {result.total_recommendations || 0}
                </strong>

                <small>
                  Potentially impacted files
                </small>

              </div>


              <div className="summary-card">

                <span className="summary-label">
                  High Risk
                </span>

                <strong className="high-number">
                  {highRiskCount}
                </strong>

                <small>
                  Requires closer review
                </small>

              </div>


              <div className="summary-card">

                <span className="summary-label">
                  Historical Commits
                </span>

                <strong>
                  {
                    result.historical_analysis
                      ?.commits_processed || 0
                  }
                </strong>

                <small>
                  Commits analyzed
                </small>

              </div>

            </div>


            {/* =============================================
                RISK OVERVIEW
            ============================================= */}

            <div className="risk-overview">

              <div className="overview-header">

                <div>

                  <h3>
                    Risk Overview
                  </h3>

                  <p>
                    Distribution of potentially affected
                    files identified by AIEE.
                  </p>

                </div>

              </div>


              <div className="risk-grid">


                <div className="risk-box high-box">

                  <div className="risk-title">
                    HIGH
                  </div>

                  <div className="risk-value">
                    {highRiskCount}
                  </div>

                  <span>
                    High-risk files
                  </span>

                </div>


                <div className="risk-box medium-box">

                  <div className="risk-title">
                    MEDIUM
                  </div>

                  <div className="risk-value">
                    {mediumRiskCount}
                  </div>

                  <span>
                    Medium-risk files
                  </span>

                </div>


                <div className="risk-box low-box">

                  <div className="risk-title">
                    LOW
                  </div>

                  <div className="risk-value">
                    {lowRiskCount}
                  </div>

                  <span>
                    Low-risk files
                  </span>

                </div>

              </div>

            </div>


            {/* =============================================
                CHANGED FILES
            ============================================= */}

            <div className="data-card">

              <div className="data-card-header">

                <div>

                  <h3>
                    Latest Changed Files
                  </h3>

                  <p>
                    Files detected from the latest
                    repository commit.
                  </p>

                </div>

                <span className="count-badge">
                  {result.changed_files?.length || 0}
                </span>

              </div>


              <div className="file-list">

                {result.changed_files?.map(
                  (file, index) => (

                    <div
                      className="file-item"
                      key={`${file}-${index}`}
                    >

                      <span className="file-index">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span className="file-name">
                        {file}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* =============================================
                IMPACT TABLE
            ============================================= */}

            <div className="data-card">

              <div className="data-card-header">

                <div>

                  <h3>
                    Potentially Affected Files
                  </h3>

                  <p>
                    Ranked using AIEE's hybrid
                    change-impact scoring.
                  </p>

                </div>

                <span className="count-badge">
                  {recommendations.length}
                </span>

              </div>


              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Affected File
                      </th>

                      <th>
                        Risk
                      </th>

                      <th>
                        Score
                      </th>

                      <th>
                        Dependency
                      </th>

                      <th>
                        Frequency
                      </th>

                      <th>
                        KMeans
                      </th>

                      <th>
                        DBSCAN
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {recommendations.map(
                      (item, index) => (

                        <tr
                          key={
                            `${item.affected_file}-${index}`
                          }
                        >

                          <td>

                            <div className="table-file">

                              <span className="file-symbol">
                                #
                              </span>

                              {item.affected_file}

                            </div>

                          </td>


                          <td>

                            <span
                              className={
                                `risk-badge ${getRiskClass(
                                  item.risk_level
                                )
                                }`
                              }
                            >
                              {item.risk_level}
                            </span>

                          </td>


                          <td>
                            <strong>
                              {item.final_score}
                            </strong>
                          </td>


                          <td>
                            {item.dependency_count}
                          </td>


                          <td>
                            {item.file_frequency}
                          </td>


                          <td>
                            {
                              item.kmeans_cluster ??
                              "—"
                            }
                          </td>


                          <td>
                            {
                              item.dbscan_cluster ??
                              "—"
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* =============================================
                EXPLANATION
            ============================================= */}

            <div className="data-card">

              <div className="data-card-header">

                <div>

                  <h3>
                    Impact Explanation
                  </h3>

                  <p>
                    Why AIEE identified these files
                    as potentially affected.
                  </p>

                </div>

              </div>


              <div className="recommendation-list">

                {recommendations.map(
                  (item, index) => (

                    <div
                      className="recommendation-item"
                      key={
                        `${item.affected_file}-reason-${index}`
                      }
                    >

                      <div className="recommendation-top">

                        <div className="recommendation-file">

                          <span>
                            {index + 1}
                          </span>

                          <strong>
                            {item.affected_file}
                          </strong>

                        </div>


                        <span
                          className={
                            `risk-badge ${getRiskClass(
                              item.risk_level
                            )
                            }`
                          }
                        >
                          {item.risk_level}
                        </span>

                      </div>


                      <p className="reason">
                        {item.reason}
                      </p>


                      <div className="affected-by">

                        <span>
                          Affected by:
                        </span>

                        <div>

                          {item.changed_files?.map(
                            (file, fileIndex) => (

                              <span
                                className="mini-file"
                                key={
                                  `${file}-${fileIndex}`
                                }
                              >
                                {file}
                              </span>

                            )
                          )}

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* =============================================
                ML PIPELINE
            ============================================= */}

            <div className="data-card">

              <div className="data-card-header">

                <div>

                  <h3>
                    Machine Learning Analysis
                  </h3>

                  <p>
                    Repository-specific models and
                    historical analytics used by AIEE.
                  </p>

                </div>

              </div>


              <div className="ml-grid">


                <div className="ml-card">

                  <div className="ml-icon">
                    K
                  </div>

                  <div>

                    <h4>
                      KMeans Clustering
                    </h4>

                    <p>
                      Identifies groups of files with
                      similar repository behavior.
                    </p>

                  </div>

                  <span className="ml-status">
                    Generated
                  </span>

                </div>


                <div className="ml-card">

                  <div className="ml-icon">
                    D
                  </div>

                  <div>

                    <h4>
                      DBSCAN Clustering
                    </h4>

                    <p>
                      Identifies dense file groups and
                      unusual repository patterns.
                    </p>

                  </div>

                  <span className="ml-status">
                    Generated
                  </span>

                </div>


                <div className="ml-card">

                  <div className="ml-icon">
                    P
                  </div>

                  <div>

                    <h4>
                      Repository History
                    </h4>

                    <p>
                      Historical file changes and
                      co-change relationships.
                    </p>

                  </div>

                  <span className="ml-status">
                    Processed
                  </span>

                </div>


              </div>

            </div>

          </section>

        )}

      </main>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer>
        <div className="developer-credit">
          <img
            src={chandanPhoto}
            alt="Chandan P L"
            className="developer-photo"
          />
          <span className="developer-text">
            Developed by <span className="developer-name">Chandan P L</span>
            <span className="developer-divider">|</span>
            <span className="developer-role">AI/ML Engineer</span>
          </span>
        </div>

        <p className="footer-tagline">
          AI-Evolution-Engine · Intelligent GitHub Change Impact Analysis
        </p>
      </footer>

      {/* ===================================================
          MODALS
      =================================================== */}

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
          setLegalModalState({ isOpen: true, type: "terms" })
        }
        onOpenPrivacy={() =>
          setLegalModalState({ isOpen: true, type: "privacy" })
        }
        onLogout={logout}
      />

      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() =>
          setLegalModalState({ isOpen: false, type: "terms" })
        }
        type={legalModalState.type}
      />

    </div>

  );

}

export default App;
