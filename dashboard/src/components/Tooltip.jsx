import { useState, useRef, useEffect, useId, useCallback } from "react";
import { IconInfo } from "./Icons";

/**
 * Accessible Info Tooltip component
 * - Supports mouse hover, keyboard focus, and mobile tap/click
 * - Includes ARIA attributes (role="tooltip", aria-describedby)
 * - Viewport boundary checking to avoid clipping
 * - Dismisses on Escape or click outside
 */
export default function Tooltip({
  text,
  children,
  position = "top",
  ariaLabel = "More information",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [adjustedPos, setAdjustedPos] = useState(position);
  const tooltipId = useId();
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default positioning offsets
    let top = 0;
    let left = triggerRect.left + triggerRect.width / 2;
    let pos = position;

    // Boundary check vertical
    if (position === "top" && triggerRect.top < 80) {
      pos = "bottom";
    } else if (position === "bottom" && triggerRect.bottom > viewportHeight - 80) {
      pos = "top";
    }

    if (pos === "top") {
      top = triggerRect.top - 8;
    } else {
      top = triggerRect.bottom + 8;
    }

    // Horizontal clamping (keep tooltip within viewport bounds with 12px margin)
    const minLeft = 120;
    const maxLeft = viewportWidth - 120;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    setCoords({ top, left });
    setAdjustedPos(pos);
  }, [position]);

  const showTooltip = () => {
    calculatePosition();
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  const toggleTooltip = (e) => {
    e.stopPropagation();
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  // Close on Escape or click outside
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        hideTooltip();
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target)
      ) {
        hideTooltip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isVisible, calculatePosition]);

  return (
    <span className="aiee-tooltip-wrapper">
      {children && <span className="aiee-tooltip-label">{children}</span>}
      <button
        type="button"
        ref={triggerRef}
        className={`aiee-tooltip-trigger ${isVisible ? "active" : ""}`}
        onClick={toggleTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={isVisible ? tooltipId : undefined}
        aria-label={ariaLabel}
        aria-expanded={isVisible}
      >
        <IconInfo size={13} className="aiee-tooltip-icon" />
      </button>

      {isVisible && (
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`aiee-tooltip-bubble aiee-tooltip-${adjustedPos}`}
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform:
              adjustedPos === "top"
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0)",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
