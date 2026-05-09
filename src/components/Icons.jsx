import { BRANDS } from "../lib/constants.js";

/**
 * AppIcon — renders a coloured badge for a Windows process.
 * Falls back to a letter avatar if the process isn't in the brand map.
 */
export function AppIcon({ processName = "", size = 44 }) {
  const brand  = BRANDS[processName.toLowerCase()] ?? null;
  const bg     = brand?.bg    ?? deriveColor(processName);
  const fg     = brand?.fg    ?? "#ffffff";
  const letter = brand?.letter ?? processName.replace(/\.exe$/i, "").slice(0, 2).toUpperCase() || "?";
  const fs     = letter.length > 2 ? size * 0.22
               : letter.length > 1 ? size * 0.29
               :                     size * 0.37;
  const radius = Math.round(size * 0.27);

  return (
    <div
      aria-hidden
      style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: radius,
        background: bg, color: fg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: fs, fontWeight: 700, letterSpacing: "-0.02em",
        fontFamily: "Outfit, sans-serif",
        overflow: "hidden", userSelect: "none",
      }}
    >
      {letter}
    </div>
  );
}

/**
 * TabIcon — shows the tab's favIcon, with a letter-avatar fallback.
 */
export function TabIcon({ tab, size = 40 }) {
  const hasIcon = tab.fav_icon && !tab.fav_icon.includes("undefined");
  const radius  = Math.round(size * 0.24);

  if (hasIcon) {
    return (
      <img
        src={tab.fav_icon}
        width={size} height={size}
        alt=""
        loading="lazy"
        style={{ borderRadius: radius, objectFit: "contain", display: "block" }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }

  let letter = "?";
  try { letter = new URL(tab.url).hostname.replace("www.", "")[0]?.toUpperCase() ?? "?"; }
  catch {}

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: "#1e3a5f", color: "#60a5fa",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.37, fontWeight: 700,
    }}>
      {letter}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────── //

const PALETTE = [
  "#1e3a5f", "#2d4a2d", "#4a1d4a", "#1a3a3a", "#3a2d1a",
  "#1a2d4a", "#4a2d1d", "#2d1a4a", "#1d3a2d", "#3a1d2d",
];

function deriveColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
