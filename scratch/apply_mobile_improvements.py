import re

def update_css():
    with open('dashboard/src/App.css', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add subtitle full/compact rules
    old_sub = """.aiee-brand-subtitle {
  margin: 1px 0 0;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
  line-height: 1.3;
}"""
    new_sub = """.aiee-brand-subtitle {
  margin: 1px 0 0;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
  line-height: 1.3;
}

.subtitle-full {
  display: inline;
}

.subtitle-compact {
  display: none;
}"""
    if old_sub in content:
        content = content.replace(old_sub, new_sub, 1)
        print("Updated subtitle rules")

    # 2. Add github-login-btn text spans rules
    old_login = """  user-select: none;
}"""
    # Replace the one right under .github-login-button
    target_login_block = """.github-login-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 15px;
  border-radius: var(--radius-md);
  background: var(--btn-secondary-bg);
  border: 1px solid var(--btn-secondary-border);
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 650;
  box-shadow: var(--btn-secondary-shadow);
  transition: all var(--transition-fast);
  cursor: pointer;
  user-select: none;
}"""
    new_login_block = """.github-login-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 15px;
  border-radius: var(--radius-md);
  background: var(--btn-secondary-bg);
  border: 1px solid var(--btn-secondary-border);
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 650;
  box-shadow: var(--btn-secondary-shadow);
  transition: all var(--transition-fast);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.github-login-btn-text-full {
  display: inline;
}

.github-login-btn-text-compact {
  display: none;
}"""
    if target_login_block in content:
        content = content.replace(target_login_block, new_login_block, 1)
        print("Updated github-login-button rules")

    # 3. Update .landing-analyze-btn & .landing-feedback-btn base styling
    old_btn_block = """.landing-analyze-btn {
  flex: 1;
  height: 46px;
  border-radius: 10px;
  background: linear-gradient(135deg, #45B8A0 0%, #2E8B75 100%);
  color: #0C1316;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 14px rgba(69, 184, 160, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
}"""
    new_btn_block = """.landing-analyze-btn {
  flex: 1;
  height: 48px;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #45B8A0 0%, #2E8B75 100%);
  color: #0C1316;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 14.5px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 14px rgba(69, 184, 160, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}"""
    if old_btn_block in content:
        content = content.replace(old_btn_block, new_btn_block, 1)
        print("Updated landing-analyze-btn base rules")

    old_feedback_block = """.landing-feedback-btn {
  height: 46px;
  padding: 0 16px;
  border-radius: 10px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  transition: all 0.2s ease;
  flex-shrink: 0;
}"""
    new_feedback_block = """.landing-feedback-btn {
  height: 48px;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 10px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  text-decoration: none;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-sizing: border-box;
}"""
    if old_feedback_block in content:
        content = content.replace(old_feedback_block, new_feedback_block, 1)
        print("Updated landing-feedback-btn base rules")

    # 4. Replace the mobile media queries block for landing hero
    old_mq_block = """@media (max-width: 580px) {
  .landing-hero-two-column {
    margin: 16px 0 24px 0;
    gap: 24px;
  }

  .landing-hero-headline {
    font-size: 1.95rem;
  }

  .landing-actions-row {
    flex-direction: column;
  }

  .landing-analyze-btn,
  .landing-feedback-btn {
    width: 100%;
  }

  .landing-input-card {
    padding: 18px 16px;
  }

  .repo-3d-scene-container {
    transform: scale(0.92);
    transform-origin: top center;
  }
}"""

    new_mq_block = """/* Tablet & Medium Mobile (<= 768px) */
@media (max-width: 768px) {
  .topbar {
    padding: 0 16px;
    height: 62px;
  }

  .aiee-brand-subtitle .subtitle-full {
    display: none;
  }

  .aiee-brand-subtitle .subtitle-compact {
    display: inline;
  }

  .github-login-btn-text-full {
    display: none;
  }

  .github-login-btn-text-compact {
    display: inline;
  }

  .github-login-button {
    height: 36px;
    padding: 0 12px;
    font-size: 12px;
    gap: 6px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

/* Mobile Screens (<= 580px) */
@media (max-width: 580px) {
  .container {
    width: min(100% - 24px, 1240px);
    padding: 14px 0 28px;
    overflow-x: hidden;
  }

  .landing-hero-two-column {
    margin: 12px 0 20px 0;
    gap: 20px;
    width: 100%;
  }

  .hero-eyebrow-badge {
    font-size: 10.5px;
    padding: 5px 11px;
    max-width: 100%;
    box-sizing: border-box;
  }

  .landing-hero-headline {
    font-size: clamp(1.75rem, 6.8vw, 2.15rem);
    line-height: 1.18;
    letter-spacing: -0.02em;
    word-break: break-word;
  }

  .landing-hero-description {
    font-size: 13.5px;
    line-height: 1.55;
  }

  .landing-input-card {
    padding: 16px 14px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    gap: 12px;
    overflow: hidden;
  }

  .landing-input-header {
    gap: 4px;
  }

  .landing-input-label {
    font-size: 12px;
  }

  .landing-input-helper {
    font-size: 11px;
  }

  .landing-input-form {
    width: 100%;
    box-sizing: border-box;
    gap: 10px;
  }

  .landing-input-field-wrap {
    height: 48px;
    min-height: 48px;
    padding: 0 12px;
    width: 100%;
    box-sizing: border-box;
    gap: 8px;
  }

  .landing-input-field-wrap input {
    min-width: 0;
    width: 100%;
    font-size: 12.5px;
  }

  .landing-actions-row {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .landing-analyze-btn {
    width: 100%;
    height: 48px;
    min-height: 48px;
    padding: 0 18px;
    font-size: 14px;
    font-weight: 700;
    flex: none;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    box-sizing: border-box;
  }

  .landing-feedback-btn {
    width: 100%;
    height: 44px;
    min-height: 44px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 600;
    flex: none;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    box-sizing: border-box;
  }

  /* Stack private repository notice and its login button vertically */
  .landing-auth-connection-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px 14px;
    box-sizing: border-box;
  }

  .auth-bar-left {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .auth-bar-text {
    font-size: 12px;
    line-height: 1.45;
  }

  .landing-auth-login-btn {
    width: 100%;
    height: 38px;
    min-height: 38px;
    justify-content: center;
    font-size: 12.5px;
    flex-shrink: 0;
  }

  .repo-3d-scene-container {
    transform: scale(0.85);
    transform-origin: top center;
    margin: 0 auto -45px auto;
    max-width: 100%;
  }

  .landing-pipeline-section {
    margin-top: 8px;
    margin-bottom: 20px;
    width: 100%;
    overflow-x: hidden;
  }
}

/* Compact Mobile (<= 430px) */
@media (max-width: 430px) {
  .topbar {
    padding: 0 12px;
    height: 56px;
  }

  .aiee-brand-logo-container {
    gap: 8px;
  }

  .aiee-circuit-icon {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
  }

  .aiee-brand-title {
    font-size: 13px;
    white-space: nowrap;
  }

  .aiee-brand-pill {
    display: none;
  }

  .aiee-brand-subtitle .subtitle-compact {
    font-size: 10px;
    white-space: nowrap;
  }

  .github-login-button {
    height: 34px;
    padding: 0 10px;
    font-size: 11.5px;
  }

  .landing-hero-headline {
    font-size: 1.7rem;
  }

  .landing-input-card {
    padding: 14px 12px;
  }

  .landing-analyze-btn {
    height: 46px;
    min-height: 46px;
    font-size: 13.5px;
  }

  .landing-feedback-btn {
    height: 42px;
    min-height: 42px;
    font-size: 12.5px;
  }

  .repo-3d-scene-container {
    transform: scale(0.78);
    transform-origin: top center;
    margin: 0 auto -70px auto;
  }
}

/* Ultra-Compact Mobile (<= 360px: e.g. 320px) */
@media (max-width: 360px) {
  .topbar {
    padding: 0 10px;
    height: 54px;
  }

  .aiee-circuit-icon {
    width: 26px;
    height: 26px;
  }

  .aiee-brand-title {
    font-size: 11.5px;
  }

  .aiee-brand-subtitle .subtitle-compact {
    font-size: 9px;
  }

  .github-login-btn-text-compact {
    display: none;
  }

  .github-login-button {
    width: 34px;
    height: 34px;
    padding: 0;
    justify-content: center;
    border-radius: var(--radius-md);
  }

  .landing-input-card {
    padding: 12px 10px;
  }

  .landing-hero-headline {
    font-size: 1.55rem;
  }

  .landing-input-field-wrap {
    height: 44px;
    min-height: 44px;
    padding: 0 10px;
  }

  .landing-input-field-wrap input {
    font-size: 11.5px;
  }

  .landing-analyze-btn {
    height: 44px;
    min-height: 44px;
    font-size: 13px;
  }

  .landing-feedback-btn {
    height: 40px;
    min-height: 40px;
    font-size: 12px;
  }

  .sample-pill-btn {
    font-size: 10px;
    padding: 4px 8px;
  }

  .repo-3d-scene-container {
    transform: scale(0.68);
    transform-origin: top center;
    margin: 0 auto -95px auto;
  }
}"""

    if old_mq_block in content:
        content = content.replace(old_mq_block, new_mq_block, 1)
        print("Updated responsive media queries")
    else:
        print("WARNING: old_mq_block not found exactly!")

    # Write back
    with open('dashboard/src/App.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: App.css updated!")

if __name__ == '__main__':
    update_css()
