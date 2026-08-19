import { useEffect, useState } from "react";
import "./App.css";

// ============================================================
// AIEE BACKEND
// ============================================================

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // GITHUB AUTHENTICATION STATE
  // ============================================================

  const [authenticated, setAuthenticated] = useState(false);
  const [githubUser, setGithubUser] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // ============================================================
  // CHECK GITHUB AUTHENTICATION
  // ============================================================

  const checkAuthentication = async () => {
    try {
      console.log("======================================");
      console.log("Checking GitHub authentication...");
      console.log("Auth URL:", `${API_URL}/auth/status`);
      console.log("======================================");

      const response = await fetch(
        `${API_URL}/auth/status`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      console.log(
        "Auth status response:",
        response.status
      );

      if (!response.ok) {
        throw new Error(
          `Authentication request failed: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "GitHub authentication response:",
        data
      );

      if (data.authenticated === true) {
        setAuthenticated(true);

        setGithubUser(
          data.github_user ||
          data.name ||
          "GitHub User"
        );

        console.log(
          "✅ GitHub authentication successful."
        );
      } else {
        setAuthenticated(false);
        setGithubUser("");

        console.log(
          "❌ GitHub authentication not detected."
        );
      }

      return data;

    } catch (err) {
      console.error(
        "Authentication check failed:",
        err
      );

      setAuthenticated(false);
      setGithubUser("");

      return {
        authenticated: false,
      };

    } finally {
      setCheckingAuth(false);
    }
  };

  // ============================================================
  // CHECK AUTH WHEN PAGE LOADS
  // ============================================================

  useEffect(() => {
    checkAuthentication();
  }, []);

  // ============================================================
  // GITHUB LOGIN
  // ============================================================

  const loginWithGitHub = async () => {
    if (loginLoading) {
      return;
    }

    setError("");
    setLoginLoading(true);

    const loginURL =
      `${API_URL}/auth/github/login`;

    console.log("======================================");
    console.log("GITHUB LOGIN BUTTON CLICKED");
    console.log("Login URL:", loginURL);
    console.log("======================================");

    try {
      // --------------------------------------------------------
      // First verify that FastAPI is reachable.
      // --------------------------------------------------------

      const healthResponse = await fetch(
        `${API_URL}/`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      console.log(
        "Backend health status:",
        healthResponse.status
      );

      if (!healthResponse.ok) {
        throw new Error(
          "AIEE backend is not responding correctly."
        );
      }

      console.log(
        "Backend is reachable."
      );

      // --------------------------------------------------------
      // Redirect browser to GitHub OAuth endpoint.
      // --------------------------------------------------------

      console.log(
        "Redirecting to:",
        loginURL
      );

      window.location.assign(
        loginURL
      );

    } catch (err) {
      console.error(
        "GitHub login failed:",
        err
      );

      setLoginLoading(false);

      setError(
        "Cannot connect to AIEE backend. " +
        "Make sure FastAPI is running on port 8000."
      );
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logoutFromGitHub = async () => {
    try {
      console.log(
        "Logging out from GitHub..."
      );

      const response = await fetch(
        `${API_URL}/auth/github/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      console.log(
        "Logout response:",
        response.status
      );

      if (!response.ok) {
        console.error(
          "Logout request failed:",
          response.status
        );
      }

    } catch (err) {
      console.error(
        "Logout failed:",
        err
      );
    }

    setAuthenticated(false);
    setGithubUser("");
    setResult(null);
    setRepo("");
    setError("");
    setLoginLoading(false);

    // ----------------------------------------------------------
    // Verify logout state
    // ----------------------------------------------------------

    setTimeout(() => {
      checkAuthentication();
    }, 100);
  };

  // ============================================================
  // ANALYZE REPOSITORY
  // ============================================================

  const analyzeRepository = async () => {

    // ----------------------------------------------------------
    // Authentication check
    // ----------------------------------------------------------

    if (!authenticated) {

      setError(
        "Please login with GitHub first."
      );

      const authResult =
        await checkAuthentication();

      if (
        authResult &&
        authResult.authenticated === true
      ) {
        setError("");
        setAuthenticated(true);
        return;
      }

      return;
    }

    // ----------------------------------------------------------
    // Repository validation
    // ----------------------------------------------------------

    if (!repo.trim()) {

      setError(
        "Please enter a GitHub repository URL."
      );

      return;
    }

    // ----------------------------------------------------------
    // Basic GitHub URL validation
    // ----------------------------------------------------------

    if (!repo.includes("github.com/")) {

      setError(
        "Please enter a valid GitHub repository URL."
      );

      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {

      const response = await fetch(
        `${API_URL}/analyze?repo=${encodeURIComponent(
          repo.trim()
        )}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "Repository analysis response:",
        data
      );

      if (!response.ok) {

        // ------------------------------------------------------
        // If backend says authentication expired
        // ------------------------------------------------------

        if (
          response.status === 401
        ) {
          setAuthenticated(false);
          setGithubUser("");

          throw new Error(
            "GitHub session expired. Please login again."
          );
        }

        throw new Error(
          data.detail ||
          "Repository analysis failed."
        );
      }

      setResult(data);

    } catch (err) {

      console.error(
        "Repository analysis failed:",
        err
      );

      setError(
        err.message ||
        "Repository analysis failed."
      );

    } finally {

      setLoading(false);
    }
  };

  // ============================================================
  // AUTHENTICATION LOADING
  // ============================================================

  if (checkingAuth) {

    return (
      <div className="app">

        <div className="loading-card">

          <div className="spinner"></div>

          <h3>
            Checking GitHub authentication...
          </h3>

          <p>
            Connecting to AIEE authentication service
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN APPLICATION
  // ============================================================

  return (
    <div className="app">

      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <header className="navbar">

        <div className="logo">

          <div className="logo-icon">
            AI
          </div>

          <div>

            <h2>
              AIEE
            </h2>

            <span>
              AI Evolution Engine
            </span>

          </div>

        </div>

        {/* ====================================================
            GITHUB AUTHENTICATION
        ===================================================== */}

        {!authenticated ? (

          <button
            className="github-login"
            onClick={loginWithGitHub}
            disabled={loginLoading}
          >

            <span>
              ◉
            </span>

            {loginLoading
              ? "Connecting..."
              : "Login with GitHub"}

          </button>

        ) : (

          <div className="github-user">

            <span>
              ✓
            </span>

            <strong>
              {githubUser}
            </strong>

            <button
              className="logout-button"
              onClick={logoutFromGitHub}
            >
              Logout
            </button>

          </div>

        )}

      </header>

      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <main>

        {/* ====================================================
            HERO
        ===================================================== */}

        <section className="hero">

          <div className="badge">
            ⚡ AI-Powered Repository Intelligence
          </div>

          <h1>
            Understand the impact of
            <span>
              {" "}every code change.
            </span>
          </h1>

          <p>
            AIEE analyzes your GitHub repository
            using historical dependencies, machine
            learning clustering and developer activity
            to identify potentially affected files.
          </p>

        </section>

        {/* ====================================================
            REPOSITORY ANALYSIS
        ===================================================== */}

        <section className="analyzer-card">

          <div className="section-title">

            <div>

              <h2>
                Repository Analysis
              </h2>

              <p>
                Enter a GitHub repository to analyze
                its latest changes.
              </p>

            </div>

            <div className="status">

              <span></span>

              {authenticated
                ? "GitHub Connected"
                : "Login Required"}

            </div>

          </div>

          {/* ==================================================
              REPOSITORY INPUT
          =================================================== */}

          <div className="input-area">

            <input
              type="text"
              value={repo}
              onChange={(e) =>
                setRepo(e.target.value)
              }
              placeholder="https://github.com/username/repository"
              disabled={
                !authenticated ||
                loading
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  analyzeRepository();
                }
              }}
            />

            <button
              onClick={analyzeRepository}
              disabled={
                loading ||
                !authenticated
              }
            >

              {loading
                ? "Analyzing..."
                : "Analyze Repository →"}

            </button>

          </div>

          {/* ==================================================
              LOGIN MESSAGE
          =================================================== */}

          {!authenticated && (

            <div className="error">

              🔐 Please login with GitHub before
              analyzing a repository.

            </div>

          )}

          {/* ==================================================
              ERROR MESSAGE
          =================================================== */}

          {error && authenticated && (

            <div className="error">

              ⚠️ {error}

            </div>

          )}

          {/* ==================================================
              BACKEND ERROR
          =================================================== */}

          {error && !authenticated && (

            <div className="error">

              ⚠️ {error}

            </div>

          )}

        </section>

        {/* ====================================================
            ANALYSIS LOADING
        ===================================================== */}

        {loading && (

          <section className="loading-card">

            <div className="spinner"></div>

            <h3>
              Analyzing repository...
            </h3>

            <p>
              Detecting changes → dependencies →
              clusters → risk levels
            </p>

          </section>

        )}

        {/* ====================================================
            RESULTS
        ===================================================== */}

        {result && !loading && (

          <section className="results">

            {/* ==================================================
                RESULT HEADER
            =================================================== */}

            <div className="result-header">

              <div>

                <span className="result-label">
                  ANALYSIS COMPLETED
                </span>

                <h2>
                  {result.repository}
                </h2>

              </div>

              <div className="success">
                ✓ Completed
              </div>

            </div>

            {/* ==================================================
                STATISTICS
            =================================================== */}

            <div className="stats">

              <div className="stat-card">

                <span>
                  Changed Files
                </span>

                <strong>
                  {result.changed_files?.length || 0}
                </strong>

              </div>

              <div className="stat-card">

                <span>
                  Recommendations
                </span>

                <strong>
                  {result.total_recommendations || 0}
                </strong>

              </div>

              <div className="stat-card">

                <span>
                  High Risk
                </span>

                <strong className="high-number">

                  {
                    result.recommendations?.filter(
                      (item) =>
                        item.risk_level === "HIGH"
                    ).length || 0
                  }

                </strong>

              </div>

              <div className="stat-card">

                <span>
                  Medium Risk
                </span>

                <strong className="medium-number">

                  {
                    result.recommendations?.filter(
                      (item) =>
                        item.risk_level === "MEDIUM"
                    ).length || 0
                  }

                </strong>

              </div>

            </div>

            {/* ==================================================
                CHANGED FILES
            =================================================== */}

            <div className="panel">

              <div className="panel-header">

                <h3>
                  Changed Files
                </h3>

                <span>
                  {result.changed_files?.length || 0}
                  {" "}detected
                </span>

              </div>

              <div className="changed-files">

                {result.changed_files?.map(
                  (file, index) => (

                    <div
                      className="changed-file"
                      key={index}
                    >

                      <span className="file-icon">
                        📄
                      </span>

                      <span>
                        {file}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* ==================================================
                RECOMMENDATIONS
            =================================================== */}

            <div className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Potentially Affected Files
                  </h3>

                  <p>
                    Ranked using AIEE hybrid intelligence
                  </p>

                </div>

              </div>

              <div className="recommendations">

                {result.recommendations?.map(
                  (item, index) => (

                    <div
                      className="recommendation"
                      key={index}
                    >

                      <div className="recommendation-main">

                        <div className="risk-dot">

                          {item.risk_level === "HIGH"
                            ? "🔴"
                            : item.risk_level === "MEDIUM"
                              ? "🟠"
                              : "🟢"}

                        </div>

                        <div>

                          <h4>
                            {item.affected_file}
                          </h4>

                          <p>
                            {item.reason}
                          </p>

                        </div>

                      </div>

                      <div className="recommendation-data">

                        <div className="risk-badge">
                          {item.risk_level}
                        </div>

                        <div className="score">

                          <span>
                            Score
                          </span>

                          <strong>
                            {item.final_score}
                          </strong>

                        </div>

                      </div>

                      <div className="technical-data">

                        <span>
                          Dependency:{" "}
                          <strong>
                            {item.dependency_count}
                          </strong>
                        </span>

                        <span>
                          Frequency:{" "}
                          <strong>
                            {item.file_frequency}
                          </strong>
                        </span>

                        <span>
                          KMeans:{" "}
                          <strong>
                            {item.kmeans_cluster ?? "N/A"}
                          </strong>
                        </span>

                        <span>
                          DBSCAN:{" "}
                          <strong>
                            {item.dbscan_cluster ?? "N/A"}
                          </strong>
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </section>

        )}

      </main>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      <footer>

        <span>
          AI-Evolution-Engine    AC2914
        </span>

        <span>
          Dependency Intelligence • ML Clustering •
          Risk Analysis
        </span>

      </footer>

    </div>
  );
}

export default App;