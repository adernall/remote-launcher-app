import { useState, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * TileCard — the tap target for each app/tab.
 * Spring-scale press feedback, active highlight border + glow.
 */
export function TileCard({ active, onClick, c, size = "md", children }) {
  const [pressing, setPressing] = useState(false);

  const handlePress = useCallback(() => {
    setPressing(true);
    onClick?.();
    setTimeout(() => setPressing(false), 180);
  }, [onClick]);

  const pad = size === "sm" ? "10px 6px 9px" : "14px 8px 11px";

  return (
    <motion.div
      onClick={handlePress}
      animate={{ scale: pressing ? 0.88 : 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 28, mass: 0.6 }}
      style={{
        background: active ? c.cardActive : c.card,
        border: `1.5px solid ${active ? c.borderActive : c.border}`,
        borderRadius: 16,
        padding: pad,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
        boxShadow: active ? `0 0 0 3px ${c.accentGlow}` : "none",
        transition: "background 0.18s, border-color 0.18s, box-shadow 0.18s",
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ActiveDot — blue indicator below icons of active apps/tabs.
 */
export function ActiveDot({ c }) {
  return (
    <div style={{
      width: 5, height: 5, borderRadius: "50%",
      background: c.dot,
      boxShadow: `0 0 5px ${c.dot}aa`,
      flexShrink: 0,
    }} />
  );
}

/**
 * TileLabel — truncated text label under each card icon.
 */
export function TileLabel({ text, c }) {
  return (
    <span style={{
      fontSize: 10.5,
      fontWeight: 500,
      color: c.label,
      textAlign: "center",
      lineHeight: 1.25,
      maxWidth: "100%",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      wordBreak: "break-word",
    }}>
      {text}
    </span>
  );
}
