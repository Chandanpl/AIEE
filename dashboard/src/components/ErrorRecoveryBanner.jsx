import { useState } from "react";
import {
  IconAlertTriangle,
  IconX,
  IconRefresh,
  IconGitHub,
  IconSearch,
  IconChevronDown,
  IconChevronUp,
} from "./Icons";

/**
 * Categorize error into human-friendly category and determine optimal recovery action
 */
function categorizeError(rawError = "", authenticated = true) {
  const errStr = (rawError || "").toLowerCase();

  // 1. Session or Auth errors
  if (
    !authenticated ||
    errStr.includes("session") ||
    errStr.includes("unauthorized") ||
    errStr.includes("401") ||
    errStr.includes("login") ||
    errStr.includes("auth") ||
    errStr.includes("token")
  ) {
    return {
      type: "auth",
      title: "Authentication Required or Expired",
      message:
        "Your GitHub session may have expired or is not connected. Please sign in again to continue.",
      actionLabel: "Sign In Again",
      actionType: "login",
    };
  }

  // 2. Invalid repository URL or slug
  if (
    errStr.includes("invalid") ||
    errStr.includes("valid github repository") ||
    errStr.includes("enter a github") ||
    errStr.includes("format") ||
    errStr.includes("slug") ||
    errStr.includes("malformed")
  ) {
    return {
      type: "invalid_url",
      title: "Invalid Repository URL",
      message:
        "Enter a valid GitHub repository URL (e.g., https://github.com/pallets/flask) or select an example repository.",
      actionLabel: "Edit Repository URL",
      actionType: "edit_url",
    };
  }

  // 3. Permission or Private Repo
  if (
    errStr.includes("private") ||
    errStr.includes("permission") ||
    errStr.includes("forbidden") ||
    errStr.includes("403") ||
    errStr.includes("not found") ||
    errStr.includes("404") ||
    errStr.includes("access")
  ) {
    return {
      type: "permission",
      title: "Repository Access Restricted",
      message:
        "AIEE could not access this repository. Check your GitHub permissions or ensure the repository exists and is accessible.",
      actionLabel: "Try an Example Repository",
      actionType: "try_example",
    };
  }

  // 4. Temporary server or network errors
  if (
    errStr.includes("500") ||
    errStr.includes("502") ||
    errStr.includes("503") ||
    errStr.includes("504") ||
    errStr.includes("timeout") ||
    errStr.includes("connect") ||
    errStr.includes("network") ||
    errStr.includes("failed to fetch") ||
    errStr.includes("temporarily unavailable")
  ) {
    return {
      type: "server",
      title: "Service Temporarily Unavailable",
      message:
        "The analysis service is temporarily unavailable or experiencing high traffic. Please wait a moment and try again.",
      actionLabel: "Retry Analysis",
      actionType: "retry",
    };
  }

  // 5. General analysis failure
  return {
    type: "general",
    title: "Analysis Could Not Be Completed",
    message:
      rawError ||
      "An unexpected issue occurred while processing the repository. Please verify the URL and try again.",
    actionLabel: "Retry Analysis",
    actionType: "retry",
  };
}

// Clean sanitization to ensure tokens or secrets are never visible
function sanitizeError(errorText = "") {
  return errorText
    .replace(/(ghp_[a-zA-Z0-9]{36})/g, "ghp_***")
    .replace(/(bearer\s+[a-zA-Z0-9_.-]+)/gi, "Bearer ***")
    .replace(/(session_id=[a-zA-Z0-9_-]+)/gi, "session_id=***");
}

export default function ErrorRecoveryBanner({
  error,
  authenticated,
  onDismiss,
  onLogin,
  onEditUrl,
  onRetry,
  onTryExample,
}) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!error) return null;

  const errorInfo = categorizeError(error, authenticated);
  const sanitized = sanitizeError(error);

  const handleAction = () => {
    switch (errorInfo.actionType) {
      case "login":
        onLogin();
        break;
      case "edit_url":
        onEditUrl();
        break;
      case "try_example":
        onTryExample();
        break;
      case "retry":
      default:
        onRetry();
        break;
    }
  };

  return (
    <div
      className={`error-recovery-card error-type-${errorInfo.type}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="error-card-main">
        <div className="error-icon-box" aria-hidden="true">
          <IconAlertTriangle size={20} />
        </div>

        <div className="error-text-content">
          <h4 className="error-heading">{errorInfo.title}</h4>
          <p className="error-explanation">{errorInfo.message}</p>

          <div className="error-actions-cluster">
            <button
              type="button"
              className="btn-recovery-primary"
              onClick={handleAction}
            >
              {errorInfo.actionType === "login" && <IconGitHub size={14} />}
              {errorInfo.actionType === "edit_url" && <IconSearch size={14} />}
              {errorInfo.actionType === "retry" && <IconRefresh size={14} />}
              <span>{errorInfo.actionLabel}</span>
            </button>

            {errorInfo.actionType !== "try_example" && (
              <button
                type="button"
                className="btn-recovery-secondary"
                onClick={onTryExample}
              >
                <span>Try an Example</span>
              </button>
            )}

            <button
              type="button"
              className="btn-technical-toggle"
              onClick={() => setShowTechnicalDetails((prev) => !prev)}
              aria-expanded={showTechnicalDetails}
            >
              <span>{showTechnicalDetails ? "Hide Details" : "Diagnostic Info"}</span>
              {showTechnicalDetails ? (
                <IconChevronUp size={12} />
              ) : (
                <IconChevronDown size={12} />
              )}
            </button>
          </div>

          {showTechnicalDetails && (
            <div className="error-diagnostic-panel">
              <span className="diagnostic-label">Developer diagnostics:</span>
              <pre className="diagnostic-code">{sanitized}</pre>
            </div>
          )}
        </div>

        <button
          type="button"
          className="error-card-close"
          onClick={onDismiss}
          title="Dismiss notification"
          aria-label="Dismiss error notification"
        >
          <IconX size={15} />
        </button>
      </div>
    </div>
  );
}
