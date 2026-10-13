import React, { useEffect } from "react";

/**
 * WelcomeToast - Accessible floating notification for authenticated GitHub users
 * Automatically dismisses after 4 seconds.
 */
export default function WelcomeToast({ user, onDismiss }) {
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [user, onDismiss]);

  if (!user) return null;

  const displayName = user.name || user.username || "Developer";
  const avatarUrl = user.avatar || "";

  return (
    <aside
      className="welcome-notification-toast"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="welcome-toast-content">
        <div className="welcome-avatar-container">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="welcome-avatar-img"
              onError={(e) => {
                // If the avatar fails to load, gracefully hide it and show fallback initial
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="welcome-avatar-fallback" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="welcome-avatar-badge" aria-hidden="true">
            ✓
          </span>
        </div>

        <div className="welcome-text-wrap">
          <div className="welcome-headline">
            Welcome back, <strong className="welcome-name">{displayName}</strong>!
          </div>
          <div className="welcome-subline">
            <span className="welcome-user-tag">@{user.username || "github"}</span>
            <span className="welcome-bullet" aria-hidden="true">•</span>
            <span className="welcome-auth-status">GitHub Verified</span>
          </div>
        </div>

        <button
          type="button"
          className="welcome-close-btn"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* 4-second progress indicator bar */}
      <div className="welcome-toast-timer" aria-hidden="true">
        <div className="welcome-timer-progress"></div>
      </div>
    </aside>
  );
}
