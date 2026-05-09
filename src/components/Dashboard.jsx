import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, FolderOpen, Settings, Sun, Moon, ChevronRight, WifiOff } from "lucide-react";
import { TileCard, ActiveDot, TileLabel } from "./TileCard.jsx";
import { AppIcon, TabIcon } from "./Icons.jsx";
import { useOrientation } from "../hooks/useRemote.js";
import { toast } from "./Toast.jsx";

const CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
};
const ITEM = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 500, damping: 28 } },
};

/** Strip common clutter from tab titles */
function cleanTitle(title = "") {
  return title
    .replace(/ - YouTube$/, "")
    .replace(/ - Google Docs$/, "")
    .replace(/ - Google Drive$/, "")
    .replace(/ - Gmail$/, "")
    .replace(/ \| LinkedIn$/, "")
    .replace(/ on Twitter$/, "")
    .replace(/ — Notion$/, "")
    .trim();
}

export function Dashboard({
  apps, tabs,
  onFocusApp, onFocusTab,
  connected, latency, lastSync, demo,
  theme, onToggleTheme, onOpenSettings,
  c,
}) {
  const orientation = useOrientation();
  const isLand  = orientation === "landscape";
  const appCols = isLand ? 6 : 3;
  const tabCols = isLand ? 7 : 3;
  const [showAllTabs, setShowAllTabs] = useState(false);
  const visibleTabs = isLand || showAllTabs ? tabs : tabs.slice(0, 9);

  const handleFocusApp = useCallback((app) => {
    onFocusApp(app);
    toast.show(`Focusing ${app.display_name}…`, "info");
  }, [onFocusApp]);

  const handleFocusTab = useCallback((tab) => {
    onFocusTab(tab);
    toast.show(`Switching to "${cleanTitle(tab.title)}"…`, "info");
  }, [onFocusTab]);

  return (
    <div style={{ minHeight: "100dvh", background: c.bg, fontFamily: "Outfit, sans-serif", position: "relative" }}>

      {/* Topographic bg */}
      <TopoBg c={c} />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: `${c.bg}ee`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        padding: isLand ? "12px 28px" : "12px 18px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${c.border}`,
      }}>
        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: demo ? c.warn : connected ? c.online : c.offline,
            boxShadow: `0 0 6px ${demo ? c.warn : connected ? c.online : c.offline}88`,
            transition: "background 0.3s",
          }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: c.muted }}>
            {demo ? "Demo" : connected ? "Live" : "Offline"}
            {connected && latency != null && <span style={{ marginLeft: 5, opacity: 0.6 }}>{latency}ms</span>}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Last sync time */}
        {lastSync && !demo && (
          <span style={{ fontSize: 11, color: c.muted, fontVariantNumeric: "tabular-nums" }}>
            {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}

        {/* Theme toggle */}
        <IconBtn onClick={onToggleTheme} c={c}>
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </IconBtn>

        {/* Settings */}
        <IconBtn onClick={onOpenSettings} c={c}>
          <Settings size={15} />
        </IconBtn>
      </header>

      {/* Main */}
      <main style={{ padding: isLand ? "22px 28px 32px" : "18px 16px 32px", position: "relative", zIndex: 1 }}>

        {/* Apps section */}
        <AnimatePresence mode="wait">
          {apps.length > 0 && (
            <motion.section
              key="apps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginBottom: 26 }}
            >
              <SectionHeader icon={Monitor} title="Apps" count={apps.length} c={c} />
              <motion.div
                variants={CONTAINER}
                initial="hidden"
                animate="show"
                style={{ display: "grid", gridTemplateColumns: `repeat(${appCols}, minmax(0,1fr))`, gap: 9 }}
              >
                {apps.map(app => (
                  <motion.div key={app.hwnd} variants={ITEM}>
                    <TileCard active={app.is_active} onClick={() => handleFocusApp(app)} c={c}>
                      <AppIcon processName={app.process_name} size={isLand ? 46 : 40} />
                      <TileLabel text={app.display_name} c={c} />
                      {app.is_active && <ActiveDot c={c} />}
                    </TileCard>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Tabs section */}
        <AnimatePresence mode="wait">
          {tabs.length > 0 && (
            <motion.section key="tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionHeader
                icon={FolderOpen}
                title="Tabs"
                count={tabs.length}
                showSeeAll={!isLand && !showAllTabs && tabs.length > 9}
                onSeeAll={() => setShowAllTabs(true)}
                showLess={!isLand && showAllTabs && tabs.length > 9}
                onLess={() => setShowAllTabs(false)}
                c={c}
              />
              <motion.div
                variants={CONTAINER}
                initial="hidden"
                animate="show"
                style={{ display: "grid", gridTemplateColumns: `repeat(${tabCols}, minmax(0,1fr))`, gap: 9 }}
              >
                {visibleTabs.map(tab => (
                  <motion.div key={tab.id} variants={ITEM}>
                    <TileCard active={tab.is_active} onClick={() => handleFocusTab(tab)} c={c}>
                      <TabIcon tab={tab} size={isLand ? 38 : 34} />
                      <TileLabel text={cleanTitle(tab.title)} c={c} />
                      {tab.is_active && <ActiveDot c={c} />}
                    </TileCard>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {apps.length === 0 && tabs.length === 0 && (
          <div style={{ textAlign: "center", padding: "72px 0", color: c.muted }}>
            <WifiOff size={42} style={{ margin: "0 auto 18px", display: "block", opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 500, color: c.label, margin: "0 0 7px" }}>
              No windows detected
            </p>
            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              Make sure the PC agent is running<br />and the browser extension is installed.
            </p>
          </div>
        )}

        {/* Legend */}
        {(apps.length > 0 || tabs.length > 0) && (
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />
            <span style={{ fontSize: 11, color: c.muted }}>Blue = In Use / Active</span>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────── //

function SectionHeader({ icon: Icon, title, count, showSeeAll, onSeeAll, showLess, onLess, c }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
      <Icon size={15} color={c.accent} strokeWidth={2.2} />
      <span style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{title}</span>
      <span style={{
        fontSize: 10, fontWeight: 600, color: c.muted,
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: 6, padding: "1px 6px",
      }}>
        {count}
      </span>
      <div style={{ flex: 1 }} />
      {showSeeAll && (
        <button onClick={onSeeAll} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: c.accent, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 2, padding: 0,
          fontFamily: "Outfit, sans-serif",
        }}>
          See all <ChevronRight size={13} />
        </button>
      )}
      {showLess && (
        <button onClick={onLess} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: c.accent, fontWeight: 500,
          padding: 0, fontFamily: "Outfit, sans-serif",
        }}>
          Show less
        </button>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, c }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 34, height: 34,
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: 9, cursor: "pointer", color: c.muted,
        transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function TopoBg({ c }) {
  return (
    <svg
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: c.topoOpacity, zIndex: 0 }}
      viewBox="0 0 400 900" preserveAspectRatio="xMidYMid slice"
    >
      {[...Array(20)].map((_, i) => (
        <ellipse key={i}
          cx={200 + Math.sin(i * 1.3) * 120} cy={45 * i}
          rx={180 + i * 12} ry={60 + i * 8}
          fill="none" stroke="currentColor" strokeWidth="1"
        />
      ))}
    </svg>
  );
}
