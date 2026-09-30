import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  profile,
  githubUser,
  onOpenProfile,
  onOpenTerms,
  onOpenPrivacy,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("appearance");

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initials = (profile?.displayName || githubUser || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content settings-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="settings-modal-title" className="modal-title">
              Settings
            </h2>
            <p className="modal-subtitle">
              Configure dashboard appearance, account preferences, and legal information.
            </p>
          </div>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close settings modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="settings-tabs-nav">
          <button
            className={`settings-tab-btn ${
              activeTab === "appearance" ? "active" : ""
            }`}
            onClick={() => setActiveTab("appearance")}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span>Appearance</span>
          </button>

          <button
            className={`settings-tab-btn ${
              activeTab === "account" ? "active" : ""
            }`}
            onClick={() => setActiveTab("account")}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Account</span>
          </button>

          <button
            className={`settings-tab-btn ${
              activeTab === "legal" ? "active" : ""
            }`}
            onClick={() => setActiveTab("legal")}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Legal</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-tab-content">
          {/* ===================================================
              APPEARANCE TAB
          =================================================== */}
          {activeTab === "appearance" && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h3 className="settings-section-title">Theme Preference</h3>
                <p className="settings-section-desc">
                  Choose your preferred color theme. Dark theme is the default for AIEE.
                </p>
              </div>

              <div className="theme-toggle-quick-row">
                <div className="theme-toggle-quick-info">
                  <span className="theme-toggle-quick-title">
                    Active Mode: <strong>{theme === "dark" ? "Dark Theme" : "Light Theme"}</strong>
                  </span>
                  <span className="theme-toggle-quick-desc">
                    Switch between dark obsidian and professional light interface
                  </span>
                </div>
                <ThemeToggle
                  theme={theme}
                  onThemeChange={onThemeChange}
                  showLabel={false}
                />
              </div>

              <div className="theme-selector-grid">
                {/* Dark Theme Option */}
                <div
                  className={`theme-card ${theme === "dark" ? "selected" : ""}`}
                  onClick={() => onThemeChange("dark")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onThemeChange("dark");
                  }}
                >
                  <div className="theme-preview dark-preview">
                    <div className="theme-preview-topbar" />
                    <div className="theme-preview-body">
                      <div className="theme-preview-card" />
                      <div className="theme-preview-card short" />
                    </div>
                  </div>
                  <div className="theme-card-info">
                    <div className="theme-title-row">
                      <span className="theme-title">Dark Theme (Default)</span>
                      {theme === "dark" && (
                        <span className="theme-badge">Active</span>
                      )}
                    </div>
                    <p className="theme-desc">
                      Deep obsidian background with crisp cyan and blue accents.
                    </p>
                  </div>
                </div>

                {/* Light Theme Option */}
                <div
                  className={`theme-card ${theme === "light" ? "selected" : ""}`}
                  onClick={() => onThemeChange("light")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onThemeChange("light");
                  }}
                >
                  <div className="theme-preview light-preview">
                    <div className="theme-preview-topbar" />
                    <div className="theme-preview-body">
                      <div className="theme-preview-card" />
                      <div className="theme-preview-card short" />
                    </div>
                  </div>
                  <div className="theme-card-info">
                    <div className="theme-title-row">
                      <span className="theme-title">Light Theme</span>
                      {theme === "light" && (
                        <span className="theme-badge">Active</span>
                      )}
                    </div>
                    <p className="theme-desc">
                      Clean white and soft-gray interface with high readability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="theme-hint-box">
                <span className="hint-icon">💡</span>
                <span>
                  Your theme preference is automatically persisted across page reloads in your browser.
                </span>
              </div>
            </div>
          )}

          {/* ===================================================
              ACCOUNT TAB
          =================================================== */}
          {activeTab === "account" && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h3 className="settings-section-title">Account Information</h3>
                <p className="settings-section-desc">
                  View and manage your authenticated GitHub identity and custom profile.
                </p>
              </div>

              <div className="account-card">
                <div className="account-card-left">
                  <div className="account-avatar">
                    {profile?.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.displayName || "Avatar"}
                        className="account-avatar-img"
                      />
                    ) : (
                      <div className="account-avatar-fallback">{initials}</div>
                    )}
                  </div>
                  <div className="account-meta">
                    <div className="account-name">
                      {profile?.displayName || githubUser || "User"}
                    </div>
                    {githubUser && (
                      <div className="account-github">
                        GitHub: <strong>@{githubUser}</strong>
                      </div>
                    )}
                    <span className="session-status-badge">
                      <span className="status-dot-mini" />
                      Active OAuth Session
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    onClose();
                    onOpenProfile();
                  }}
                >
                  Edit Profile
                </button>
              </div>

              <div className="account-details-grid">
                <div className="account-detail-item">
                  <span className="detail-label">Display Username</span>
                  <span className="detail-value">
                    {profile?.displayName || "Not specified"}
                  </span>
                </div>
                <div className="account-detail-item">
                  <span className="detail-label">GitHub Username</span>
                  <span className="detail-value">
                    {githubUser ? `@${githubUser}` : "Not connected"}
                  </span>
                </div>
                <div className="account-detail-item">
                  <span className="detail-label">Auth Provider</span>
                  <span className="detail-value">GitHub OAuth 2.0</span>
                </div>
                <div className="account-detail-item">
                  <span className="detail-label">Database Session</span>
                  <span className="detail-value">PostgreSQL / Secure HTTP Cookie</span>
                </div>
              </div>

              <div className="danger-zone">
                <div className="danger-zone-header">
                  <div>
                    <h4 className="danger-title">Session Management</h4>
                    <p className="danger-desc">
                      Logging out will terminate your current session on this device.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              LEGAL TAB
          =================================================== */}
          {activeTab === "legal" && (
            <div className="settings-section">
              <div className="section-title-wrap">
                <h3 className="settings-section-title">Legal & Compliance</h3>
                <p className="settings-section-desc">
                  Review terms of service, repository scanning policies, and data privacy safeguards.
                </p>
              </div>

              <div className="legal-links-list">
                <div
                  className="legal-link-card"
                  onClick={() => {
                    onClose();
                    onOpenTerms();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onClose();
                      onOpenTerms();
                    }
                  }}
                >
                  <div className="legal-link-left">
                    <div className="legal-icon">📄</div>
                    <div>
                      <h4 className="legal-link-title">Terms & Conditions</h4>
                      <p className="legal-link-desc">
                        Policies regarding automated Git analysis, ML heuristics, and system usage.
                      </p>
                    </div>
                  </div>
                  <span className="legal-link-arrow">→</span>
                </div>

                <div
                  className="legal-link-card"
                  onClick={() => {
                    onClose();
                    onOpenPrivacy();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onClose();
                      onOpenPrivacy();
                    }
                  }}
                >
                  <div className="legal-link-left">
                    <div className="legal-icon">🔒</div>
                    <div>
                      <h4 className="legal-link-title">Privacy Policy</h4>
                      <p className="legal-link-desc">
                        How your GitHub username, repository URLs, and change statistics are safeguarded.
                      </p>
                    </div>
                  </div>
                  <span className="legal-link-arrow">→</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
