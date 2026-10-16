new_css = """
/* =========================================================
   REFERENCE-INSPIRED 3D LANDING HERO (TWO-COLUMN SECTION)
   ========================================================= */
.landing-hero-two-column {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 40px;
  align-items: center;
  margin: 24px 0 36px 0;
  position: relative;
  width: 100%;
}

.hero-col-visual {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.hero-col-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  z-index: 2;
}

/* Eyebrow Label Badge */
.hero-eyebrow-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(69, 184, 160, 0.08);
  border: 1px solid rgba(69, 184, 160, 0.25);
  font-family: var(--font-body);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-teal);
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.eyebrow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-teal);
  box-shadow: 0 0 8px var(--accent-teal);
  animation: pulseTealDot 2.2s infinite ease-in-out;
}

@keyframes pulseTealDot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.25); opacity: 0.65; }
}

.eyebrow-text {
  letter-spacing: 0.08em;
}

.eyebrow-sep {
  color: var(--border-medium);
  font-weight: 400;
}

.eyebrow-tag {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 10.5px;
}

/* Stylish Landing Headline */
.landing-hero-headline {
  font-family: var(--font-display);
  font-size: clamp(2rem, 3.4vw, 3.1rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--text-primary);
  margin: 0;
}

.landing-headline-gradient {
  background: linear-gradient(135deg, #F2F4F5 15%, #45B8A0 65%, #68D8C4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

[data-theme="light"] .landing-headline-gradient {
  background: linear-gradient(135deg, #161B22 15%, #1D7A67 75%, #259D85 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.landing-hero-description {
  font-family: var(--font-body);
  font-size: 1.025rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  max-width: 540px;
}

/* Prominent Repository URL Input Card */
.landing-input-card {
  background: var(--surface-card);
  border: 1px solid var(--border-medium);
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

[data-theme="light"] .landing-input-card {
  box-shadow: 0 14px 30px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.landing-input-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
}

.landing-input-label {
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-primary);
  display: block;
}

.landing-input-helper {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-muted);
}

.landing-input-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.landing-input-field-wrap {
  display: flex;
  align-items: center;
  background: var(--surface-input);
  border: 1px solid var(--border-medium);
  border-radius: 10px;
  padding: 0 14px;
  height: 48px;
  gap: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .landing-input-field-wrap {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}

.landing-input-field-wrap:focus-within {
  border-color: var(--accent-teal);
  box-shadow: 0 0 0 3px rgba(69, 184, 160, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.landing-field-icon {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.landing-input-field-wrap:focus-within .landing-field-icon {
  color: var(--accent-teal);
}

.landing-input-field-wrap input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 13.5px;
}

.landing-input-field-wrap input::placeholder {
  color: var(--text-muted);
  opacity: 0.8;
  font-family: var(--font-mono);
}

.landing-input-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s ease, background 0.15s ease;
}

.landing-input-clear-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
}

/* Actions Row: Analyze Repository + Secondary Feedback */
.landing-actions-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.landing-analyze-btn {
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
}

.landing-analyze-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(69, 184, 160, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.landing-analyze-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(69, 184, 160, 0.3);
}

.landing-analyze-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.landing-feedback-btn {
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
}

.landing-feedback-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

/* Authentication Connection Bar (Inside Input Card) */
.landing-auth-connection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(230, 162, 60, 0.08);
  border: 1px solid rgba(230, 162, 60, 0.24);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.auth-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.auth-bar-icon {
  color: #E5A93C;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.auth-bar-text {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
}

.landing-auth-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background: #20262C;
  border: 1px solid #3A444D;
  color: #F2F4F5;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
}

.landing-auth-login-btn:hover {
  background: #293139;
  border-color: var(--accent-teal);
  color: #FFFFFF;
}

[data-theme="light"] .landing-auth-login-btn {
  background: #FFFFFF;
  border-color: #D0D7DE;
  color: #24292F;
}

[data-theme="light"] .landing-auth-login-btn:hover {
  background: #F3F4F6;
  border-color: #1D7A67;
}

/* Connected Badge */
.landing-auth-confirmed-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(69, 184, 160, 0.08);
  border: 1px solid rgba(69, 184, 160, 0.22);
  font-size: 12px;
  color: var(--text-primary);
}

.auth-confirmed-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-teal);
  box-shadow: 0 0 6px var(--accent-teal);
}

/* Sample Repositories Chips */
.landing-samples-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--border-subtle);
}

.samples-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 11.5px;
}

.samples-label {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--text-muted);
}

.samples-hint {
  color: var(--text-muted);
  font-size: 11px;
}

.samples-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sample-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 6px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.sample-pill-btn:hover:not(:disabled) {
  border-color: var(--accent-teal);
  color: var(--accent-teal);
  background: var(--surface-hover);
  transform: translateY(-1px);
}

.sample-pill-btn.is-active {
  background: rgba(69, 184, 160, 0.12);
  border-color: var(--accent-teal);
  color: var(--accent-teal);
}

/* =========================================================
   3D REPOSITORY INTELLIGENCE VISUALIZATION STYLES
   ========================================================= */
.repo-3d-scene-container {
  position: relative;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  perspective: 1200px;
  transform-style: preserve-3d;
  user-select: none;
}

.repo-3d-viewport {
  position: relative;
  width: 100%;
  height: 360px;
  transform-style: preserve-3d;
  transition: transform 0.15s ease-out;
  will-change: transform;
}

/* SVG Topological Circuit Base */
.scene-base-circuit-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circuit-grid-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.conduit-path {
  stroke: #3A444D;
  stroke-width: 1.5;
  fill: none;
  transition: stroke 0.25s ease, stroke-width 0.25s ease, filter 0.25s ease;
}

.conduit-path.is-highlighted {
  stroke: #45B8A0;
  stroke-width: 2.2;
  filter: drop-shadow(0 0 6px rgba(69, 184, 160, 0.7));
}

[data-theme="light"] .conduit-path {
  stroke: #CBD5E1;
}

[data-theme="light"] .conduit-path.is-highlighted {
  stroke: #1D7A67;
  filter: drop-shadow(0 0 5px rgba(29, 122, 103, 0.45));
}

/* Data Packet Particle Animations */
@keyframes packetMove1 {
  0% { cx: 230px; cy: 180px; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { cx: 125px; cy: 95px; opacity: 0; }
}

@keyframes packetMove2 {
  0% { cx: 230px; cy: 180px; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { cx: 360px; cy: 95px; opacity: 0; }
}

@keyframes packetMove3 {
  0% { cx: 230px; cy: 180px; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { cx: 125px; cy: 275px; opacity: 0; }
}

@keyframes packetMove4 {
  0% { cx: 230px; cy: 180px; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { cx: 355px; cy: 270px; opacity: 0; }
}

.packet-1 {
  animation: packetMove1 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.packet-2 {
  animation: packetMove2 2.8s infinite cubic-bezier(0.4, 0, 0.2, 1) 0.6s;
}

.packet-3 {
  animation: packetMove3 2.6s infinite cubic-bezier(0.4, 0, 0.2, 1) 1.2s;
}

.packet-4 {
  animation: packetMove4 2.9s infinite cubic-bezier(0.4, 0, 0.2, 1) 1.8s;
}

/* Central Repository Core Hub */
.scene-central-hub {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%) translate3d(0, 0, 36px);
  transform-style: preserve-3d;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 5;
}

.hub-pedestal-outer {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #293139, #171B1F);
  border: 2px solid #3A444D;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.08), 0 0 22px rgba(69, 184, 160, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.25s ease;
}

[data-theme="light"] .hub-pedestal-outer {
  background: radial-gradient(circle at 35% 35%, #FFFFFF, #EBF1F5);
  border-color: #CBD5E1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 0 18px rgba(29, 122, 103, 0.15);
}

.scene-central-hub:hover .hub-pedestal-outer {
  border-color: var(--accent-teal);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.7), 0 0 28px rgba(69, 184, 160, 0.4);
  transform: scale(1.05);
}

.hub-pedestal-core {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hub-octocat-wrap {
  color: #F2F4F5;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

[data-theme="light"] .hub-octocat-wrap {
  color: #24292F;
}

.hub-pulse-beacon {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1.5px solid rgba(69, 184, 160, 0.45);
  animation: hubPulse 2.8s infinite ease-out;
  pointer-events: none;
}

@keyframes hubPulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.18); opacity: 0; }
  100% { transform: scale(1.18); opacity: 0; }
}

.hub-branch-tag {
  position: absolute;
  top: -16px;
  background: #20262C;
  border: 1px solid #3A444D;
  border-radius: 999px;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent-teal);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
}

[data-theme="light"] .hub-branch-tag {
  background: #FFFFFF;
  border-color: #CBD5E1;
  color: #1D7A67;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.hub-telemetry-pill {
  position: absolute;
  bottom: -20px;
  background: rgba(23, 27, 31, 0.9);
  border: 1px solid #3A444D;
  border-radius: 999px;
  padding: 3px 9px;
  font-family: var(--font-body);
  font-size: 10.5px;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  backdrop-filter: blur(4px);
}

[data-theme="light"] .hub-telemetry-pill {
  background: rgba(255, 255, 255, 0.95);
  border-color: #CBD5E1;
  color: #57606A;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.hub-dot-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-teal);
  box-shadow: 0 0 6px var(--accent-teal);
}

/* 3D Floating Repository Folder and File Modules */
.floating-repo-module {
  position: absolute;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  outline: none;
  z-index: 6;
}

.module-card-surface {
  background: var(--surface-card);
  border: 1px solid var(--border-medium);
  border-radius: 10px;
  padding: 9px 12px;
  width: 135px;
  box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.25s ease;
  position: relative;
}

[data-theme="light"] .module-card-surface {
  box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.floating-repo-module:hover .module-card-surface,
.floating-repo-module.is-selected .module-card-surface {
  border-color: var(--accent-teal);
  box-shadow: 0 16px 32px -4px rgba(69, 184, 160, 0.35), 0 0 0 1px var(--accent-teal);
  transform: translateY(-2px);
}

.module-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.module-ext-badge {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
}

[data-theme="light"] .module-ext-badge {
  background: rgba(0, 0, 0, 0.06);
}

.module-risk-indicator {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
}

.module-risk-indicator.risk-high {
  background: rgba(224, 108, 117, 0.15);
  color: #E06C75;
}

.module-risk-indicator.risk-medium {
  background: rgba(229, 169, 60, 0.15);
  color: #E5A93C;
}

.module-risk-indicator.risk-low {
  background: rgba(69, 184, 160, 0.15);
  color: #45B8A0;
}

.module-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
}

.module-icon {
  color: var(--accent-teal);
  flex-shrink: 0;
}

.module-name {
  font-family: var(--font-mono);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.module-role {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70px;
}

.module-metric {
  font-family: var(--font-mono);
  color: var(--accent-mint);
  flex-shrink: 0;
}

/* Floating Commit Diff Accent */
.floating-commit-accent {
  position: absolute;
  left: 32%;
  top: 78%;
  transform-style: preserve-3d;
  z-index: 7;
  pointer-events: none;
}

.commit-accent-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(23, 27, 31, 0.95);
  border: 1px solid #3A444D;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  font-size: 10.5px;
}

[data-theme="light"] .commit-accent-pill {
  background: rgba(255, 255, 255, 0.95);
  border-color: #CBD5E1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.commit-hash {
  font-family: var(--font-mono);
  color: var(--text-primary);
  font-weight: 600;
}

.commit-diff-stats {
  display: inline-flex;
  gap: 4px;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 10px;
}

.diff-add {
  color: #45B8A0;
}

.diff-del {
  color: #E06C75;
}

/* Interactive Module Detail HUD Drawer */
.scene-interactive-hud {
  width: 100%;
  background: var(--surface-card);
  border: 1px solid var(--border-medium);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 8;
}

[data-theme="light"] .scene-interactive-hud {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.hud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.hud-badge-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
}

.hud-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-teal);
  box-shadow: 0 0 6px var(--accent-teal);
}

.hud-title {
  color: var(--text-muted);
  letter-spacing: 0.05em;
  font-size: 10.5px;
}

.hud-sep {
  color: var(--border-medium);
}

.hud-filename {
  font-family: var(--font-mono);
  color: var(--accent-teal);
  font-size: 12px;
}

.hud-hint {
  font-size: 10.5px;
  color: var(--text-muted);
  font-style: italic;
}

.hud-desc {
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
}

.hud-footer-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 6px;
  border-top: 1px solid var(--border-subtle);
  margin-top: 2px;
}

.hud-stat-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
}

.hud-stat-label {
  color: var(--text-muted);
}

.hud-stat-val {
  color: var(--text-primary);
  font-weight: 500;
}

.hud-stat-risk {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.hud-stat-risk.risk-high {
  background: rgba(224, 108, 117, 0.15);
  color: #E06C75;
}

.hud-stat-risk.risk-medium {
  background: rgba(229, 169, 60, 0.15);
  color: #E5A93C;
}

.hud-stat-risk.risk-low {
  background: rgba(69, 184, 160, 0.15);
  color: #45B8A0;
}

/* Compact Pipeline Section Below Hero */
.landing-pipeline-section {
  width: 100%;
  margin-top: 12px;
  margin-bottom: 28px;
  position: relative;
  z-index: 1;
}

/* Responsive Breakpoints for 2-Column Hero */
@media (max-width: 1024px) {
  .landing-hero-two-column {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero-col-visual {
    order: 1;
    max-width: 460px;
    margin: 0 auto;
  }

  .hero-col-content {
    order: 2;
  }
}

@media (max-width: 580px) {
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
}
"""

def insert_css():
    with open('dashboard/src/App.css', 'r', encoding='utf-8') as f:
        content = f.read()

    marker = "/* =========================================================\n   ACCESSIBILITY: PREFERS-REDUCED-MOTION"
    if marker not in content:
        # try CRLF
        marker = "/* =========================================================\r\n   ACCESSIBILITY: PREFERS-REDUCED-MOTION"

    if marker not in content:
        print("Marker not found, finding by substring PREFERS-REDUCED-MOTION")
        idx = content.find("PREFERS-REDUCED-MOTION")
        if idx == -1:
            print("ERROR: could not find PREFERS-REDUCED-MOTION")
            return False
        # find comment start before idx
        comment_start = content.rfind("/*", 0, idx)
        updated = content[:comment_start] + new_css + "\n" + content[comment_start:]
    else:
        parts = content.split(marker, 1)
        updated = parts[0] + new_css + "\n" + marker + parts[1]

    # Also add 3D scene reduced motion overrides inside @media (prefers-reduced-motion: reduce)
    reduced_motion_additions = """
  .repo-3d-viewport {
    transform: none !important;
    transition: none !important;
  }

  .floating-repo-module {
    transform: none !important;
    transition: none !important;
  }

  .scene-central-hub {
    transform: none !important;
  }

  .data-packet {
    display: none !important;
  }

  .hub-pulse-beacon {
    animation: none !important;
  }
"""
    # Insert right before the last closing brace of prefers-reduced-motion
    last_brace = updated.rfind("}")
    if last_brace != -1:
        updated = updated[:last_brace] + reduced_motion_additions + updated[last_brace:]

    with open('dashboard/src/App.css', 'w', encoding='utf-8') as f:
        f.write(updated)

    print("SUCCESS: App.css updated with landing hero styles!")
    return True

if __name__ == '__main__':
    insert_css()
