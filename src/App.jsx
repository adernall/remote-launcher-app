import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { THEMES, DEMO_APPS, DEMO_TABS } from "./lib/constants.js";
import { useRemote, useLocalStorage } from "./hooks/useRemote.js";

import { PairScreen }      from "./components/PairScreen.jsx";
import { Dashboard }       from "./components/Dashboard.jsx";
import { SettingsDrawer }  from "./components/SettingsDrawer.jsx";
import { ToastProvider }   from "./components/Toast.jsx";

export default function App() {
  // ── Persisted state ─────────────────────────────────────────────────────
  const [theme,    setTheme]    = useLocalStorage("rl_theme",    "dark");
  const [agentUrl, setAgentUrl] = useLocalStorage("rl_agent",   "");
  const [savedTok, setSavedTok] = useLocalStorage("rl_token",   "");

  // ── Ephemeral state ──────────────────────────────────────────────────────
  const [screen,      setScreen]      = useState("pair");
  const [demo,        setDemo]        = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ── WS hook ──────────────────────────────────────────────────────────────
  const { apps, tabs, connected, latency, lastSync, connect, sendCmd, disconnect } = useRemote();

  const c = THEMES[theme];

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleConnect = useCallback((url, token) => {
    setAgentUrl(url);
    setSavedTok(token);
    connect(url, token);
    setScreen("dashboard");
    setDemo(false);
  }, [connect, setAgentUrl, setSavedTok]);

  const handleDemo = useCallback(() => {
    setDemo(true);
    setScreen("dashboard");
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setDemo(false);
    setScreen("pair");
    setShowSettings(false);
  }, [disconnect]);

  const handleFocusApp = useCallback((app) => {
    if (!demo) sendCmd({ action: "focus_window", hwnd: app.hwnd });
  }, [demo, sendCmd]);

  const handleFocusTab = useCallback((tab) => {
    if (!demo) sendCmd({ action: "focus_tab", tab_id: tab.id, window_id: tab.window_id });
  }, [demo, sendCmd]);

  const displayApps = demo ? DEMO_APPS : apps;
  const displayTabs = demo ? DEMO_TABS : tabs;

  return (
    <>
      {/* Global font */}
      <style>{`* { font-family: Outfit, ui-sans-serif, system-ui; } body { background: ${c.bg}; }`}</style>

      <AnimatePresence mode="wait">
        {screen === "pair" ? (
          <motion.div
            key="pair"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <PairScreen onConnect={handleConnect} onDemo={handleDemo} c={c} />
          </motion.div>
        ) : (
          <motion.div
            key="dash"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Dashboard
              apps={displayApps}
              tabs={displayTabs}
              onFocusApp={handleFocusApp}
              onFocusTab={handleFocusTab}
              connected={connected}
              latency={latency}
              lastSync={lastSync}
              demo={demo}
              theme={theme}
              onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
              onOpenSettings={() => setShowSettings(true)}
              c={c}
            />

            <SettingsDrawer
              open={showSettings}
              onClose={() => setShowSettings(false)}
              onDisconnect={handleDisconnect}
              agentUrl={agentUrl}
              connected={connected}
              demo={demo}
              latency={latency}
              c={c}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast overlay */}
      <ToastProvider c={c} />
    </>
  );
}
