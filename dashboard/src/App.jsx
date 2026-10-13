import { useEffect, useState, useRef } from "react";
import "./App.css";
import chandanPhoto from "./assets/Chandan.jpeg";
import AIEELogo from "./components/AIEELogo";
import ProfileMenu from "./components/ProfileMenu";
import ProfileModal from "./components/ProfileModal";
import SettingsModal from "./components/SettingsModal";
import LegalModal from "./components/LegalModal";
import ThemeToggle from "./components/ThemeToggle";
import GitHubAnalysisHero from "./components/GitHubAnalysisHero";
import WelcomeToast from "./components/WelcomeToast";
import CursorWaveEffect from "./components/CursorWaveEffect";
import Tooltip from "./components/Tooltip";
import AnalysisProgress from "./components/AnalysisProgress";
import RecentAnalyses from "./components/RecentAnalyses";
import FirstTimeWelcome from "./components/FirstTimeWelcome";
import ErrorRecoveryBanner from "./components/ErrorRecoveryBanner";
import {
  IconGitHub,
  IconSearch,
  IconFileCode,
  IconFileText,
  IconGitCommit,
  IconHistory,
  IconLayers,
  IconTarget,
  IconShield,
  IconShieldAlert,
  IconShieldCheck,
  IconCheck,
  IconCheckCircle,
  IconX,
  IconCopy,
  IconLock,
  IconExternalLink,
  IconChevronDown,
  IconArrowRight,
  IconCpu,
  IconNetwork,
  IconDatabase,
  IconSliders,
  IconRefresh,
  IconMessageSquare,
  IconMail,
} from "./components/Icons";

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

const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfJc402az371R21FgfLRn397DMXn1hbo4yKmJGrTB1ywGv2OQ/viewform?usp=publish-editor";


function App() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [githubUser, setGithubUser] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // Pipeline animation, state, and drawer controls with preference persistence
  const [analysisStatus, setAnalysisStatus] = useState("idle"); // "idle" | "analyzing" | "completed" | "error"
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [pipelineDrawerOpen, setPipelineDrawerOpen] = useState(() => {
    try {
      return localStorage.getItem("aiee_pipeline_drawer_preference") === "true";
    } catch {
      return false;
    }
  });

  const [welcomeUser, setWelcomeUser] = useState(null);
  const welcomeTriggeredRef = useRef(false);
  const isAnalyzingRef = useRef(false);

  // Table filtering and search with preference persistence
  const [riskFilter, setRiskFilter] = useState(() => {
    try {
      return localStorage.getItem("aiee_risk_filter_preference") || "ALL";
    } catch {
      return "ALL";
    }
  });
  const [tableSearch, setTableSearch] = useState("");
  const [copiedFile, setCopiedFile] = useState(null);
  const [successNotice, setSuccessNotice] = useState("");

  // User-scoped analysis history management
  const getHistoryStorageKey = (user) =>
    `aiee_recent_analyses_${(user || "guest").toLowerCase().trim()}`;

  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Profile information belongs to the currently authenticated account.
  const [profile, setProfile] = useState({
    displayName: "",
    photoUrl: "",
  });

  const getProfileStorageKey = (username) =>
    `aiee_user_profile_${(username || "").toLowerCase()}`;

  // Theme state with localStorage persistence (default dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("aiee_theme") || "dark";
  });

  // Modals and menu visibility
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [legalModalState, setLegalModalState] = useState({
    isOpen: false,
    type: "terms",
  });

  const profileButtonRef = useRef(null);

  // Save drawer open/close preference
  const togglePipelineDrawer = (isOpen) => {
    setPipelineDrawerOpen(isOpen);
    try {
      localStorage.setItem("aiee_pipeline_drawer_preference", String(isOpen));
    } catch (e) {
      console.warn("Failed to save drawer preference:", e);
    }
  };

  // Save risk filter preference
  const handleRiskFilterChange = (level) => {
    setRiskFilter(level);
    try {
      localStorage.setItem("aiee_risk_filter_preference", level);
    } catch (e) {
      console.warn("Failed to save risk filter preference:", e);
    }
  };

  // Load user's recent analyses when authenticated user changes
  useEffect(() => {
    try {
      const key = getHistoryStorageKey(githubUser);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentAnalyses(parsed);
        }
      } else {
        setRecentAnalyses([]);
      }
    } catch (e) {
      console.warn("Failed to load history from localStorage:", e);
      setRecentAnalyses([]);
    }
  }, [githubUser]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("aiee_theme", theme);
  }, [theme]);

  // Handle Escape key to close the pipeline drawer overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && pipelineDrawerOpen) {
        togglePipelineDrawer(false);
      }
    };
    if (pipelineDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pipelineDrawerOpen]);


  const handleSaveProfile = (newProfile) => {
    const updatedProfile = {
      ...profile,
      ...newProfile,
      // Keep the current account's avatar if the modal omits it.
      photoUrl: newProfile?.photoUrl || profile.photoUrl,
    };

    setProfile(updatedProfile);

    try {
      if (githubUser) {
        localStorage.setItem(
          getProfileStorageKey(githubUser),
          JSON.stringify(updatedProfile)
        );
      }
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
        const fragment = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;

        if (fragment) {
          const fragmentParams = new URLSearchParams(fragment);
          const sessionFromCallback = fragmentParams.get("aiee_session");

          if (sessionFromCallback) {
            sessionStorage.setItem(AIEE_SESSION_KEY, sessionFromCallback);

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
          throw new Error(data.detail || "Could not verify authentication.");
        }

        if (data.authenticated) {
          const username = data.github_user || data.login || "";
          const githubName = data.name || username || "GitHub User";

          const githubAvatar =
            data.avatar_url ||
            data.avatar ||
            (username
              ? `https://github.com/${encodeURIComponent(username)}.png`
              : "");

          setAuthenticated(true);
          setGithubUser(username);

          let savedProfile = null;
          try {
            const saved = username
              ? localStorage.getItem(getProfileStorageKey(username))
              : null;

            if (saved) {
              savedProfile = JSON.parse(saved);
            }
          } catch (profileError) {
            console.error("Failed to load saved profile:", profileError);
          }

          const finalDisplayName = savedProfile?.displayName || githubName;
          const finalAvatar = githubAvatar || savedProfile?.photoUrl || "";

          setProfile({
            displayName: finalDisplayName,
            photoUrl: finalAvatar,
          });

          if (!welcomeTriggeredRef.current && (username || githubName)) {
            welcomeTriggeredRef.current = true;
            setWelcomeUser({
              name: finalDisplayName,
              username: username,
              avatar: finalAvatar,
            });
          }
        } else {
          setAuthenticated(false);
          setGithubUser("");
          setProfile({ displayName: "", photoUrl: "" });
        }
      } catch (authError) {
        console.warn("Auth check failed:", authError.message);
        setAuthenticated(false);
        setGithubUser("");
        setProfile({ displayName: "", photoUrl: "" });
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // =========================================================
  // GITHUB LOGIN / LOGOUT
  // =========================================================
  const loginWithGitHub = () => {
    window.location.href = GITHUB_LOGIN_URL;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      sessionStorage.removeItem(AIEE_SESSION_KEY);
      setAuthenticated(false);
      setGithubUser("");
      setProfile({ displayName: "", photoUrl: "" });
      setResult(null);
      setError("");
      setAnalysisStarted(false);
      setPipelineDrawerOpen(false);
      welcomeTriggeredRef.current = false;
      setWelcomeUser(null);
      setAnalysisStatus("idle");
    }
  };

  // =========================================================
  // REPOSITORY VALIDATION & HISTORY HELPERS
  // =========================================================
  const validateRepoInput = (input) => {
    const trimmed = (input || "").trim();
    if (!trimmed) {
      return "Please enter a GitHub repository URL or slug (e.g. owner/repo).";
    }
    const isSlug = /^[\w.-]+\/[\w.-]+$/.test(trimmed);
    const isUrl =
      /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/.*)?$/i.test(
        trimmed
      );

    if (!isSlug && !isUrl) {
      return "Invalid repository format. Please provide a valid GitHub repository URL (e.g., https://github.com/pallets/flask) or slug (e.g., pallets/flask).";
    }
    return null;
  };

  const saveToRecentAnalyses = (analysisResult, targetRepo) => {
    try {
      const key = getHistoryStorageKey(githubUser);
      const raw = localStorage.getItem(key);
      let existing = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(existing)) existing = [];

      const recs = analysisResult?.recommendations || [];
      const highRisks = recs.filter((r) => r.risk_level === "HIGH").length;
      const medRisks = recs.filter((r) => r.risk_level === "MEDIUM").length;
      const calculatedRisk =
        highRisks > 0 ? "HIGH" : medRisks > 0 ? "MEDIUM" : "LOW";

      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        repo: targetRepo || analysisResult?.repository || "Repository",
        timestamp: Date.now(),
        formattedDate: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        commitSha:
          analysisResult?.commit?.sha ||
          analysisResult?.commit?.id ||
          analysisResult?.commit_sha ||
          (analysisResult?.latest_commit
            ? String(analysisResult.latest_commit).substring(0, 7)
            : ""),
        commitMessage:
          analysisResult?.commit?.message ||
          analysisResult?.commit_message ||
          "Latest repository change detection",
        riskLevel: calculatedRisk,
        affectedCount: analysisResult?.total_recommendations || recs.length,
        highRiskCount: highRisks,
        result: analysisResult,
      };

      const filtered = [
        newItem,
        ...existing.filter((item) => item.repo !== newItem.repo),
      ].slice(0, 15);

      localStorage.setItem(key, JSON.stringify(filtered));
      setRecentAnalyses(filtered);
    } catch (e) {
      console.warn("Failed to save recent analysis:", e);
    }
  };

  const deleteHistoryItem = (id) => {
    try {
      const key = getHistoryStorageKey(githubUser);
      const updated = recentAnalyses.filter((item) => item.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
      setRecentAnalyses(updated);
    } catch (e) {
      console.warn("Failed to delete history item:", e);
    }
  };

  const clearAllHistory = () => {
    try {
      const key = getHistoryStorageKey(githubUser);
      localStorage.removeItem(key);
      setRecentAnalyses([]);
    } catch (e) {
      console.warn("Failed to clear history:", e);
    }
  };

  const handleReopenHistory = (item) => {
    if (item?.result) {
      setRepo(item.repo);
      setResult(item.result);
      setAnalysisStarted(true);
      setAnalysisStatus("completed");
      setError("");
      setSuccessNotice(
        `Reopened saved report for ${item.repo} (${item.formattedDate}).`
      );
      setTimeout(() => {
        document.getElementById("analysis-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  };

  const handleRerunHistory = (repoName) => {
    const target = repoName.startsWith("http")
      ? repoName
      : `https://github.com/${repoName}`;
    setRepo(target);
    setError("");
    analyzeRepository(target);
  };

  // =========================================================
  // ANALYZE REPOSITORY
  // =========================================================
  const analyzeRepository = async (targetRepoOverride) => {
    // Prevent duplicate analysis requests if an analysis is already in progress
    if (isAnalyzingRef.current || loading) {
      return;
    }

    // Safely extract target repo string, guarding against React Event objects from mouse clicks
    const effectiveTarget =
      typeof targetRepoOverride === "string" && targetRepoOverride.trim()
        ? targetRepoOverride
        : repo;
    const targetRepo = (effectiveTarget || "").trim();

    setError("");
    setSuccessNotice("");

    if (!authenticated) {
      setError("Please login with GitHub before analyzing a repository.");
      setAnalysisStatus("error");
      return;
    }

    const validationMsg = validateRepoInput(targetRepo);
    if (validationMsg) {
      setError(validationMsg);
      setAnalysisStatus("error");
      return;
    }

    // Immediately trigger full-width report mode and smooth pipeline exit
    isAnalyzingRef.current = true;
    setAnalysisStarted(true);
    togglePipelineDrawer(false);
    setLoading(true);
    setAnalysisStatus("analyzing");
    setResult(null);
    setTableSearch("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/analyze?repo=${encodeURIComponent(targetRepo)}`,
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
      setAnalysisStatus("completed");
      saveToRecentAnalyses(data, targetRepo);
      setSuccessNotice(
        `Analysis completed successfully for ${targetRepo}. Review your change-impact report below.`
      );
    } catch (err) {
      console.error("AIEE analysis error:", err);
      setError(err.message || "Unable to connect to the AIEE backend.");
      setAnalysisStatus("error");
    } finally {
      setLoading(false);
      isAnalyzingRef.current = false;
    }
  };

  const handleAnalysisSubmit = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (loading || !repo.trim()) {
      return;
    }
    analyzeRepository();
  };

  const copyToClipboard = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedFile(text);
      setTimeout(() => setCopiedFile(null), 2000);
    }
  };

  // Return to the initial standby overview layout
  const resetToStandbyOverview = () => {
    setAnalysisStarted(false);
    togglePipelineDrawer(false);
    setResult(null);
    setError("");
    setSuccessNotice("");
    setAnalysisStatus("idle");
  };

  // =========================================================
  // RISK HELPERS AND COUNTS
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

  // Calculated overall risk level directly from backend results
  const overallRiskLevel =
    highRiskCount > 0
      ? "HIGH"
      : mediumRiskCount > 0
        ? "MEDIUM"
        : lowRiskCount > 0
          ? "LOW"
          : recommendations.length > 0
            ? "LOW"
            : "LOW";

  // Commit information safely extracted from backend payload if available
  const commitIdentifier =
    result?.commit?.sha ||
    result?.commit?.id ||
    result?.commit_sha ||
    (result?.latest_commit ? String(result.latest_commit).substring(0, 7) : "") ||
    "HEAD (Latest commit)";

  const commitMessage =
    result?.commit?.message ||
    result?.commit_message ||
    "Latest repository change detection";

  const commitAuthor =
    result?.commit?.author ||
    result?.authenticated_user ||
    (githubUser ? `@${githubUser}` : "Repository Committer");

  const commitTimestamp =
    result?.commit?.timestamp || "Realtime Inference";

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

  // Determines whether the report is taking the full page width
  const isFullWidthReportMode = analysisStarted || loading || Boolean(result);

  return (
    <div className="app">
      {/* INTERACTIVE CURSOR WAVE / LIQUID LIGHT EFFECT */}
      <CursorWaveEffect theme={theme} />

      {/* TOPBAR HEADER */}
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
              <IconGitHub size={16} />
              <span>Login with GitHub</span>
            </button>
          )}

          {!authLoading && authenticated && (
            <div className="user-profile-wrapper" ref={profileButtonRef}>
              <button
                type="button"
                className="profile-trigger-btn"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
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

                <IconChevronDown
                  size={14}
                  className={`profile-trigger-arrow ${profileMenuOpen ? "open" : ""
                    }`}
                />
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

      {/* FLOATING TOGGLE BUTTON TO RESTORE / HIDE PIPELINE (WHEN IN FULL-WIDTH REPORT MODE) */}
      {isFullWidthReportMode && (
        <button
          type="button"
          className={`floating-pipeline-btn ${pipelineDrawerOpen ? "is-active" : ""
            }`}
          onClick={() => togglePipelineDrawer(!pipelineDrawerOpen)}
          title={
            pipelineDrawerOpen
              ? "Hide GitHub analysis pipeline"
              : "Show GitHub analysis pipeline in full size"
          }
          aria-label={
            pipelineDrawerOpen
              ? "Hide GitHub analysis pipeline"
              : "Show GitHub analysis pipeline"
          }
          aria-expanded={pipelineDrawerOpen}
        >
          {pipelineDrawerOpen ? (
            <>
              <IconX size={15} />
              <span>Hide Pipeline</span>
            </>
          ) : (
            <>
              <IconLayers size={16} />
              <span>Show Pipeline</span>
            </>
          )}
        </button>
      )}

      {/* FULL-SIZE SLIDE-IN PIPELINE DRAWER OVERLAY */}
      {pipelineDrawerOpen && (
        <div
          className="pipeline-drawer-overlay"
          onClick={() => togglePipelineDrawer(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pipeline-drawer-title"
        >
          <div
            className="pipeline-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pipeline-drawer-header">
              <div className="drawer-header-left">
                <span className="drawer-circuit-dot" aria-hidden="true"></span>
                <div>
                  <h3 id="pipeline-drawer-title" className="drawer-title">
                    GitHub Analysis Pipeline Architecture
                  </h3>
                  <span className="drawer-subtitle">
                    9-stage orbital repository mining &amp; ML clustering engine
                  </span>
                </div>
              </div>

              <div className="drawer-header-right">
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => togglePipelineDrawer(false)}
                  aria-label="Hide pipeline drawer"
                >
                  <IconX size={15} />
                  <span>Hide Pipeline</span>
                </button>
              </div>
            </div>

            <div className="pipeline-drawer-body">
              <GitHubAnalysisHero
                authenticated={authenticated}
                githubUser={githubUser}
                profile={profile}
                analysisStatus={analysisStatus}
                loading={loading}
                onLogin={loginWithGitHub}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="container" id="main-content">
        {/* WELCOME TOAST NOTIFICATION */}
        <WelcomeToast
          user={welcomeUser}
          onDismiss={() => setWelcomeUser(null)}
        />

        {/* 1. INITIAL STATE BEFORE ANALYSIS: FULL-SIZE IN-FLOW PIPELINE */}
        {!isFullWidthReportMode && (
          <div className="standby-pipeline-container">
            <GitHubAnalysisHero
              authenticated={authenticated}
              githubUser={githubUser}
              profile={profile}
              analysisStatus={analysisStatus}
              loading={loading}
              onLogin={loginWithGitHub}
              compact={false}
            />
          </div>
        )}

        {/* 2. REPOSITORY ANALYSIS & EXPANDED FULL-WIDTH REPORT AREA */}
        <div
          className={
            isFullWidthReportMode
              ? "full-width-report-container"
              : "standby-content-container"
          }
        >
          {/* REPOSITORY INPUT BAR (FULL STANDBY CARD OR STREAMLINED TOP BAR) */}
          <section
            className={`analysis-card ${isFullWidthReportMode ? "analysis-card-compact-bar" : ""
              }`}
            aria-labelledby="analysis-heading"
          >
            {!isFullWidthReportMode && (
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
            )}

            {/* INPUT AND ACTION FORM */}
            <form
              className="input-row"
              onSubmit={handleAnalysisSubmit}
              role="search"
              aria-label="Repository Analysis Form"
            >
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <IconGitHub size={17} />
                </span>

                <input
                  id="repository-url-input"
                  type="text"
                  placeholder="https://github.com/username/repository or username/repository"
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
                  !authenticated
                    ? "Login with GitHub required to run analysis"
                    : !repo.trim()
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
            </form>

            {/* EXAMPLE REPOSITORY GUIDANCE & SAMPLES */}
            <div className="sample-repos-section">
              <div className="sample-repos-header">
                <span className="sample-repos-label">Try an example repository:</span>
                <span className="sample-repos-guidance">
                  Clicking a sample automatically fills the repository URL input for you to review before analyzing.
                </span>
              </div>

              <div
                className="sample-repos-chips"
                role="group"
                aria-label="Example repositories"
              >
                {SAMPLE_REPOS.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    className={`sample-repo-pill ${repo.includes(sample) ? "is-selected" : ""
                      }`}
                    onClick={() => {
                      setRepo(`https://github.com/${sample}`);
                      setError("");
                    }}
                    disabled={loading}
                    aria-label={`Use example repository ${sample}`}
                  >
                    <IconGitHub size={13} aria-hidden="true" />
                    <span>{sample}</span>
                  </button>
                ))}
              </div>

              <span className="sample-repos-perm-note">
                Note: Repositories must be public or accessible under your authorized GitHub permissions.
              </span>
            </div>

            {/* LOGIN REQUIRED BANNER */}
            {!authLoading && !authenticated && (
              <div className="login-required-banner" role="alert">
                <div className="login-required-left">
                  <span className="banner-icon-wrap" aria-hidden="true">
                    <IconLock size={18} />
                  </span>
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
                  <span>Login with GitHub</span>
                  <IconArrowRight size={14} />
                </button>
              </div>
            )}
          </section>

          {/* CLEAR ERROR RECOVERY BANNER */}
          {error && (
            <ErrorRecoveryBanner
              error={error}
              authenticated={authenticated}
              onDismiss={() => {
                setError("");
                setAnalysisStatus("idle");
              }}
              onLogin={loginWithGitHub}
              onEditUrl={() => {
                setError("");
                const input = document.getElementById("repository-url-input");
                if (input) {
                  input.focus();
                  input.select();
                }
              }}
              onRetry={() => {
                analyzeRepository();
              }}
              onTryExample={() => {
                setError("");
                setRepo("https://github.com/Chandanpl/AIEE");
                const input = document.getElementById("repository-url-input");
                if (input) input.focus();
              }}
            />
          )}

          {/* FRIENDLY ANALYSIS PROGRESS PANEL */}
          {loading && (
            <AnalysisProgress
              repo={repo}
              onCancel={() => {
                setLoading(false);
                setAnalysisStatus("idle");
              }}
            />
          )}

          {/* SUCCESS COMPLETION NOTICE */}
          {successNotice && !loading && (
            <div className="analysis-success-banner" role="status" aria-live="polite">
              <div className="success-banner-content">
                <IconCheckCircle size={16} className="success-banner-icon" />
                <span>{successNotice}</span>
              </div>
              <button
                type="button"
                className="btn-dismiss-banner"
                onClick={() => setSuccessNotice("")}
                aria-label="Dismiss completion message"
              >
                <IconX size={13} />
              </button>
            </div>
          )}

          {/* FIRST-TIME WELCOME EXPERIENCE (shown before user has completed analyses) */}
          {!result && !loading && recentAnalyses.length === 0 && (
            <FirstTimeWelcome
              authenticated={authenticated}
              displayName={profile?.displayName}
              onSelectSample={(sample) => {
                setRepo(`https://github.com/${sample}`);
                setError("");
                document.getElementById("repository-url-input")?.focus();
              }}
              onFocusInput={() => {
                document.getElementById("repository-url-input")?.focus();
              }}
              onLogin={loginWithGitHub}
              sampleRepos={SAMPLE_REPOS}
            />
          )}

          {/* RECENT ANALYSES SECTION (IN STANDBY MODE) */}
          {!result && !loading && (
            <RecentAnalyses
              history={recentAnalyses}
              onReopen={handleReopenHistory}
              onRerun={handleRerunHistory}
              onDelete={deleteHistoryItem}
              onClearAll={clearAllHistory}
              currentUser={githubUser || profile?.displayName}
              disabled={loading}
            />
          )}

          {/* AFTER ANALYSIS FINISHES: COMPACT REPORT & ACCORDION DROPDOWNS */}
          {result && !loading && (
            <section
              className="results"
              id="analysis-results"
              aria-label="Repository Analysis Results"
            >
              {/* 1. COMPACT ANALYSIS SUMMARY */}
              <div className="compact-summary-header-card">
                <div className="summary-header-top">
                  <div className="summary-repo-info">
                    <div className="summary-status-badge">
                      <IconCheckCircle size={14} />
                      <span>Analysis Completed</span>
                    </div>

                    <h2 className="summary-repo-title">
                      <IconGitHub size={22} className="summary-repo-gh-icon" />
                      <span className="summary-repo-name">
                        {result.repository}
                      </span>
                      {result.repository?.startsWith("http") && (
                        <a
                          href={result.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="repo-external-link"
                          title="Open repository on GitHub"
                          aria-label="Open repository on GitHub"
                        >
                          <IconExternalLink size={13} />
                        </a>
                      )}
                    </h2>

                    {/* Commit snippet line */}
                    <div className="summary-commit-snippet">
                      <span className="commit-snippet-item">
                        <IconGitCommit size={14} />
                        <code>{commitIdentifier}</code>
                      </span>
                      <span className="commit-snippet-dot" aria-hidden="true">
                        •
                      </span>
                      <span className="commit-snippet-msg" title={commitMessage}>
                        {commitMessage}
                      </span>
                    </div>
                  </div>

                  <div className="summary-header-actions">
                    {/* Overall Risk Level Badge (calculated from actual backend data) */}
                    <div className="summary-risk-badge-wrap">
                      <Tooltip text="A score calculated by AIEE to help prioritize files for review. A higher score indicates higher relative priority within this analysis.">
                        <span className="summary-risk-label">Overall Risk:</span>
                      </Tooltip>
                      <span
                        className={`overall-risk-badge ${getRiskClass(
                          overallRiskLevel
                        )}`}
                      >
                        {overallRiskLevel === "HIGH" && (
                          <IconShieldAlert size={14} />
                        )}
                        {overallRiskLevel === "MEDIUM" && (
                          <IconShield size={14} />
                        )}
                        {overallRiskLevel === "LOW" && (
                          <IconShieldCheck size={14} />
                        )}
                        <strong>{overallRiskLevel} RISK</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-secondary btn-rerun"
                      onClick={() => {
                        const inputEl = document.getElementById(
                          "repository-url-input"
                        );
                        if (inputEl) {
                          inputEl.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                          inputEl.focus();
                        }
                      }}
                    >
                      <IconRefresh size={13} />
                      <span>Analyze Another Repo</span>
                    </button>

                    <button
                      type="button"
                      className="btn-secondary btn-overview"
                      onClick={resetToStandbyOverview}
                      title="Return to initial full pipeline overview"
                    >
                      <IconLayers size={13} />
                      <span>Pipeline Overview</span>
                    </button>
                  </div>
                </div>

                {/* 4 SUMMARY METRIC CARDS */}
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-card-header">
                      <span className="summary-label">Changed Files</span>
                      <span className="summary-icon-chip">
                        <IconFileCode size={16} />
                      </span>
                    </div>
                    <strong className="summary-value">
                      {result.changed_files?.length || 0}
                    </strong>
                    <small className="summary-sub">
                      Detected in analyzed commit
                    </small>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-header">
                      <Tooltip text="Files that may need review because of their relationship to the detected changes.">
                        <span className="summary-label">
                          Potentially Affected
                        </span>
                      </Tooltip>
                      <span className="summary-icon-chip">
                        <IconTarget size={16} />
                      </span>
                    </div>
                    <strong className="summary-value">
                      {result.total_recommendations || recommendations.length}
                    </strong>
                    <small className="summary-sub">
                      Coupled via dependencies &amp; ML
                    </small>
                  </div>

                  <div
                    className={`summary-card ${highRiskCount > 0 ? "highlight-risk" : ""
                      }`}
                  >
                    <div className="summary-card-header">
                      <span className="summary-label">High Risk Files</span>
                      <span className="summary-icon-chip risk-alert">
                        <IconShieldAlert size={16} />
                      </span>
                    </div>
                    <strong
                      className={`summary-value ${highRiskCount > 0 ? "high-number" : ""
                        }`}
                    >
                      {highRiskCount}
                    </strong>
                    <small className="summary-sub">
                      {highRiskCount > 0
                        ? "Prioritized code review required"
                        : "No critical impacts identified"}
                    </small>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-header">
                      <Tooltip text="A score calculated by AIEE to help prioritize files for review. A higher score indicates higher relative priority within this analysis.">
                        <span className="summary-label">Risk Breakdown</span>
                      </Tooltip>
                      <span className="summary-icon-chip">
                        <IconSliders size={16} />
                      </span>
                    </div>
                    <div className="summary-risk-pills-row">
                      <span className="pill-mini high">
                        <strong>{highRiskCount}</strong> High
                      </span>
                      <span className="pill-mini med">
                        <strong>{mediumRiskCount}</strong> Med
                      </span>
                      <span className="pill-mini low">
                        <strong>{lowRiskCount}</strong> Low
                      </span>
                    </div>
                    <small className="summary-sub">
                      Scored across affected candidates
                    </small>
                  </div>
                </div>
              </div>

              {/* 2. EXPANDABLE DROPDOWN SECTIONS (ACCORDIONS COLLAPSED BY DEFAULT) */}
              <div
                className="report-accordions-group"
                role="region"
                aria-label="Detailed Analysis Sections"
              >
                {/* SECTION A: COMMIT DETAILS */}
                <details
                  className="report-accordion"
                  id="accordion-commit-details"
                >
                  <summary className="accordion-summary">
                    <div className="accordion-summary-title">
                      <span className="accordion-icon" aria-hidden="true">
                        <IconGitCommit size={18} />
                      </span>
                      <div className="accordion-title-text">
                        <strong>Commit Details</strong>
                        <span className="accordion-subtitle">
                          Latest analyzed commit hash, message, author &amp; file diffs
                        </span>
                      </div>
                    </div>

                    <div className="accordion-summary-meta">
                      <span className="count-badge">
                        {result.changed_files?.length || 0} Changed Files
                      </span>
                      <IconChevronDown
                        size={16}
                        className="accordion-chevron"
                      />
                    </div>
                  </summary>

                  <div className="accordion-content">
                    <div className="commit-meta-grid">
                      <div className="commit-meta-item">
                        <span className="commit-meta-label">
                          Commit Identifier
                        </span>
                        <span className="commit-meta-val commit-hash-tag">
                          <IconGitCommit size={13} />
                          <code>{commitIdentifier}</code>
                        </span>
                      </div>

                      <div className="commit-meta-item">
                        <span className="commit-meta-label">Author</span>
                        <span className="commit-meta-val">
                          {commitAuthor}
                        </span>
                      </div>

                      <div className="commit-meta-item">
                        <span className="commit-meta-label">Timestamp</span>
                        <span className="commit-meta-val">
                          {commitTimestamp}
                        </span>
                      </div>

                      <div className="commit-meta-item commit-full-width">
                        <span className="commit-meta-label">
                          Commit Message
                        </span>
                        <p className="commit-message-quote">
                          "{commitMessage}"
                        </p>
                      </div>
                    </div>

                    {/* CHANGED FILES LIST */}
                    <div className="data-sub-card">
                      <div className="data-sub-header">
                        <h4 className="sub-title">Changed Files</h4>
                        <span className="sub-count">
                          {result.changed_files?.length || 0} modified
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
                                <IconFileCode size={15} />
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
                                {copiedFile === file ? (
                                  <>
                                    <IconCheck size={12} />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <IconCopy size={12} />
                                    <span>Copy</span>
                                  </>
                                )}
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
                  </div>
                </details>

                {/* SECTION B: AFFECTED FILES AND RISK SCORES */}
                <details
                  className="report-accordion"
                  id="accordion-affected-files"
                >
                  <summary className="accordion-summary">
                    <div className="accordion-summary-title">
                      <span className="accordion-icon" aria-hidden="true">
                        <IconLayers size={18} />
                      </span>
                      <div className="accordion-title-text">
                        <strong>Affected Files and Risk Scores</strong>
                        <span className="accordion-subtitle">
                          Potentially impacted files ranked by AIEE hybrid score
                        </span>
                      </div>
                    </div>

                    <div className="accordion-summary-meta">
                      <span className="count-badge">
                        {recommendations.length} Potentially Affected
                      </span>
                      <IconChevronDown
                        size={16}
                        className="accordion-chevron"
                      />
                    </div>
                  </summary>

                  <div className="accordion-content">
                    <div className="table-card-inner">
                      <div className="table-controls">
                        <div className="table-search-wrap">
                          <span className="table-search-icon" aria-hidden="true">
                            <IconSearch size={15} />
                          </span>
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
                              aria-label="Clear search"
                            >
                              <IconX size={13} />
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
                              className={`filter-btn ${riskFilter === level ? "active" : ""
                                }`}
                              onClick={() => handleRiskFilterChange(level)}
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

                      <div
                        className="table-wrapper"
                        tabIndex={0}
                        aria-label="Affected files table"
                      >
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">
                                <Tooltip text="Files that may need review because of their relationship to the detected changes.">
                                  <span>Affected File</span>
                                </Tooltip>
                              </th>
                              <th scope="col">
                                <span>Risk Level</span>
                              </th>
                              <th scope="col">
                                <Tooltip text="A score calculated by AIEE to help prioritize files for review. A higher score indicates higher relative priority within this analysis.">
                                  <span>Risk Score</span>
                                </Tooltip>
                              </th>
                              <th scope="col">
                                <Tooltip text="Other files or components that may be related to this file.">
                                  <span>Dependencies</span>
                                </Tooltip>
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredRecommendations.length > 0 ? (
                              filteredRecommendations.map((item, index) => (
                                <tr key={`${item.affected_file}-${index}`}>
                                  <td>
                                    <div className="table-file">
                                      <span
                                        className="file-symbol-icon"
                                        aria-hidden="true"
                                      >
                                        <IconFileText size={15} />
                                      </span>
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
                                        {copiedFile === item.affected_file ? (
                                          <IconCheck size={13} />
                                        ) : (
                                          <IconCopy size={13} />
                                        )}
                                      </button>
                                    </div>
                                  </td>

                                  <td>
                                    <span
                                      className={`risk-badge ${getRiskClass(
                                        item.risk_level
                                      )}`}
                                    >
                                      {item.risk_level === "HIGH" && (
                                        <IconShieldAlert size={12} />
                                      )}
                                      {item.risk_level === "MEDIUM" && (
                                        <IconShield size={12} />
                                      )}
                                      {item.risk_level === "LOW" && (
                                        <IconShieldCheck size={12} />
                                      )}
                                      <span>{item.risk_level}</span>
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
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="table-empty-row">
                                  No affected files matching current filter criteria.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </details>

                {/* SECTION C: WHY WERE THESE FILES FLAGGED? */}
                <details
                  className="report-accordion"
                  id="accordion-flagged-reasons"
                >
                  <summary className="accordion-summary">
                    <div className="accordion-summary-title">
                      <span className="accordion-icon" aria-hidden="true">
                        <IconTarget size={18} />
                      </span>
                      <div className="accordion-title-text">
                        <strong>Why Were These Files Flagged?</strong>
                        <span className="accordion-subtitle">
                          Algorithmic rationale and trigger relationships
                        </span>
                      </div>
                    </div>

                    <div className="accordion-summary-meta">
                      <span className="count-badge">
                        {recommendations.length} Explanations
                      </span>
                      <IconChevronDown
                        size={16}
                        className="accordion-chevron"
                      />
                    </div>
                  </summary>

                  <div className="accordion-content">
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
                                {item.risk_level === "HIGH" && (
                                  <IconShieldAlert size={12} />
                                )}
                                {item.risk_level === "MEDIUM" && (
                                  <IconShield size={12} />
                                )}
                                {item.risk_level === "LOW" && (
                                  <IconShieldCheck size={12} />
                                )}
                                <span>{item.risk_level}</span>
                              </span>
                            </div>
                          </div>

                          <p className="reason">{item.reason}</p>

                          {item.changed_files &&
                            item.changed_files.length > 0 && (
                              <div className="affected-by">
                                <Tooltip text="Files that have frequently changed together in previous commits.">
                                  <span className="affected-by-label">
                                    Triggered by changes in:
                                  </span>
                                </Tooltip>
                                <div className="affected-by-chips">
                                  {item.changed_files.map(
                                    (file, fileIndex) => (
                                      <span
                                        className="mini-file"
                                        key={`${file}-${fileIndex}`}
                                        title={file}
                                      >
                                        <IconFileCode size={11} />
                                        <span>{file}</span>
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
                </details>

                {/* SECTION D: ADVANCED ML INSIGHTS */}
                <details
                  className="report-accordion"
                  id="accordion-ml-insights"
                >
                  <summary className="accordion-summary">
                    <div className="accordion-summary-title">
                      <span className="accordion-icon" aria-hidden="true">
                        <IconCpu size={18} />
                      </span>
                      <div className="accordion-title-text">
                        <strong>Advanced ML Insights</strong>
                        <span className="accordion-subtitle">
                          KMeans &amp; DBSCAN clustering, commit history metrics &amp; graph embeddings
                        </span>
                      </div>
                    </div>

                    <div className="accordion-summary-meta">
                      <span className="count-badge">4 Engines</span>
                      <IconChevronDown
                        size={16}
                        className="accordion-chevron"
                      />
                    </div>
                  </summary>

                  <div className="accordion-content">
                    <div className="ml-grid">
                      <div className="ml-card">
                        <div className="ml-card-head">
                          <div className="ml-icon-wrapper" aria-hidden="true">
                            <IconCpu size={18} />
                          </div>
                          <span className="ml-status">
                            {result.ml_pipeline?.kmeans || "Generated"}
                          </span>
                        </div>
                        <h4>
                          <Tooltip text="A method that groups files with similar characteristics.">
                            <span>KMeans Clustering</span>
                          </Tooltip>
                        </h4>
                        <p>
                          Partitions files into behavioral clusters based
                          on commit frequencies and dependency graph
                          centrality metrics.
                        </p>
                      </div>

                      <div className="ml-card">
                        <div className="ml-card-head">
                          <div className="ml-icon-wrapper" aria-hidden="true">
                            <IconNetwork size={18} />
                          </div>
                          <span className="ml-status">
                            {result.ml_pipeline?.dbscan || "Generated"}
                          </span>
                        </div>
                        <h4>
                          <Tooltip text="A method that groups closely related data points and identifies outliers.">
                            <span>DBSCAN Clustering</span>
                          </Tooltip>
                        </h4>
                        <p>
                          Density-based spatial clustering that uncovers
                          dense co-change groups and isolates outlier
                          propagation chains.
                        </p>
                      </div>

                      <div className="ml-card">
                        <div className="ml-card-head">
                          <div className="ml-icon-wrapper" aria-hidden="true">
                            <IconHistory size={18} />
                          </div>
                          <span className="ml-status">Processed</span>
                        </div>
                        <h4>
                          <Tooltip text="Files that have frequently changed together in previous commits.">
                            <span>Repository History Mining</span>
                          </Tooltip>
                        </h4>
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
                          <div className="ml-icon-wrapper" aria-hidden="true">
                            <IconDatabase size={18} />
                          </div>
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
                </details>
              </div>

              {/* RECENT ANALYSES HISTORY IN REPORT VIEW */}
              <div className="report-history-footer-wrap">
                <RecentAnalyses
                  history={recentAnalyses}
                  onReopen={handleReopenHistory}
                  onRerun={handleRerunHistory}
                  onDelete={deleteHistoryItem}
                  onClearAll={clearAllHistory}
                  currentUser={githubUser || profile?.displayName}
                  disabled={loading}
                />
              </div>
            </section>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer role="contentinfo">
        <div className="developer-credit-section">
          <div className="developer-credit">
            <div className="developer-photo-wrap">
              <img
                src={chandanPhoto}
                alt="Chandan P L"
                className="developer-photo"
              />
              <span className="developer-photo-ring" aria-hidden="true"></span>
            </div>
            <div className="developer-text">
              <span className="developer-label">Developed by</span>
              <strong className="developer-name">Chandan P L</strong>
              <span className="developer-role-badge">AI/ML Engineer</span>
            </div>
          </div>

          <a
            href="https://in.linkedin.com/in/chandanpl"
            target="_blank"
            rel="noopener noreferrer"
            className="linkedin-follow-btn"
            aria-label="Follow Chandan P L on LinkedIn"
          >
            <span className="linkedin-icon-wrap" aria-hidden="true">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </span>
            <span className="linkedin-follow-text">Follow me on LinkedIn</span>
            <span className="linkedin-arrow" aria-hidden="true">
              <IconExternalLink size={12} />
            </span>
          </a>

          <a
            href="mailto:chandan2914ac@gmail.com"
            className="footer-contact-btn"
            aria-label="Send email to Chandan P L"
            title="Contact Chandan P L (chandan2914ac@gmail.com)"
          >
            <span className="contact-icon-wrap" aria-hidden="true">
              <IconMail size={15} />
            </span>
            <span className="contact-btn-text">Contact</span>
          </a>
        </div>

        <p className="footer-tagline">
          AI-Evolution-Engine · Modular Change Impact Architecture with Machine
          Learning Pipeline
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
          <span className="footer-dot" aria-hidden="true">
            •
          </span>
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
          <span className="footer-dot" aria-hidden="true">
            •
          </span>
          <a
            href="mailto:chandan2914ac@gmail.com"
            className="footer-link-btn"
            title="Contact Chandan P L (chandan2914ac@gmail.com)"
          >
            Contact
          </a>
          <span className="footer-dot" aria-hidden="true">
            •
          </span>
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
        onOpenProfile={() => {
          setSettingsModalOpen(false);
          setProfileModalOpen(true);
        }}
        onOpenTerms={() => {
          setSettingsModalOpen(false);
          setLegalModalState({
            isOpen: true,
            type: "terms",
          });
        }}
        onOpenPrivacy={() => {
          setSettingsModalOpen(false);
          setLegalModalState({
            isOpen: true,
            type: "privacy",
          });
        }}
        onLogout={() => {
          setSettingsModalOpen(false);
          logout();
        }}
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