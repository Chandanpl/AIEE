import { useState, useEffect, useRef } from "react";

function ProfileModal({
  isOpen,
  onClose,
  profile,
  githubUser,
  onSaveProfile,
}) {
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || null);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state whenever modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setDisplayName(profile?.displayName || githubUser || "");
      setPhotoUrl(profile?.photoUrl || null);
      setError("");
      setSaveSuccess(false);
    }
  }, [isOpen, profile, githubUser]);

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

  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    // Validate size (max 2.5MB)
    const maxSize = 2.5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image file size must be less than 2.5MB.");
      return;
    }

    // Read, scale down to optimal avatar size (max 400x400) and preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Get optimized base64 data URL
          const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
          setPhotoUrl(optimizedDataUrl);
          setSaveSuccess(false);
        } catch (canvasErr) {
          console.warn("Canvas compression fallback:", canvasErr);
          setPhotoUrl(event.target.result);
          setSaveSuccess(false);
        }
      };
      img.onerror = () => {
        setPhotoUrl(event.target.result);
        setSaveSuccess(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setError("Failed to read image file. Please try another.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setError("");
    setSaveSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Display name cannot be empty.");
      return;
    }

    onSaveProfile({
      displayName: trimmed,
      photoUrl: photoUrl,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const initials = (displayName || githubUser || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content profile-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="profile-modal-title" className="modal-title">
              User Profile
            </h2>
            <p className="modal-subtitle">
              Manage your personal details and custom display preferences.
            </p>
          </div>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close profile modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="modal-alert modal-alert-error">{error}</div>}
          {saveSuccess && (
            <div className="modal-alert modal-alert-success">
              ✓ Profile saved successfully!
            </div>
          )}

          {/* Profile Photo Area */}
          <div className="profile-photo-section">
            <div className="profile-avatar-large">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={displayName || "User avatar"}
                  className="profile-large-img"
                />
              ) : (
                <div className="profile-large-fallback">{initials}</div>
              )}
            </div>

            <div className="profile-photo-controls">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: "none" }}
              />
              <div className="photo-buttons-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={handleRemovePhoto}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="field-hint">
                PNG, JPG or WEBP under 2.5MB. Stored locally on this device.
              </p>
            </div>
          </div>

          <div className="modal-divider" />

          {/* Inputs */}
          <div className="form-group">
            <label htmlFor="profile-display-name" className="form-label">
              Display Name
            </label>
            <input
              id="profile-display-name"
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError("");
                setSaveSuccess(false);
              }}
              placeholder="e.g. Chandan P L"
              maxLength={50}
            />
            <p className="field-hint">
              This name is shown in the dashboard header, profile menu, and reports.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Username</label>
            <div className="readonly-github-input">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="github-field-icon"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="github-name-value">
                {githubUser ? `@${githubUser}` : "Not connected"}
              </span>
              <span className="oauth-badge">OAuth Verified</span>
            </div>
            <p className="field-hint">
              Managed through your GitHub OAuth authentication session.
            </p>
          </div>

          {/* Modal Footer Buttons */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
