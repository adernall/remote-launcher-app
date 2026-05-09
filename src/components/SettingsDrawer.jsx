import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, WifiOff, Zap, RefreshCw, Activity } from "lucide-react";

export function SettingsDrawer({ open, onClose, onDisconnect, agentUrl, connected, demo, latency, c }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 90,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0,
              width: 290, zIndex: 91,
              background: c.surface,
              borderLeft: `1px solid ${c.border}`,
              display: "flex", flexDirection: "column",
              padding: 22,
              gap: 20,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: c.text, margin: 0 }}>Settings</h2>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.muted, display: "flex", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Connection card */}
            <Section label="Connection" c={c}>
              <InfoCard c={c}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <StatusDot state={demo ? "warn" : connected ? "online" : "offline"} c={c} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>
                    {demo ? "Demo Mode" : connected ? "Live" : "Disconnected"}
                  </span>
                </div>

                {agentUrl && (
                  <div style={{ fontSize: 12, color: c.muted, fontFamily: "JetBrains Mono, monospace", marginBottom: 8, wordBreak: "break-all" }}>
                    {agentUrl}
                  </div>
                )}

                {latency != null && connected && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.muted }}>
                    <Activity size={12} />
                    <span>{latency} ms latency</span>
                  </div>
                )}

                {!connected && !demo && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.muted }}>
                    <RefreshCw size={12} />
                    <span>Auto-reconnecting every 3 s…</span>
                  </div>
                )}
              </InfoCard>
            </Section>

            {/* How-to */}
            <Section label="Quick Guide" c={c}>
              <InfoCard c={c}>
                {[
                  ["1", "Run run.bat on your PC"],
                  ["2", "Copy the token from the console"],
                  ["3", "Paste here with your PC's IP"],
                  ["4", "Tap any app or tab to focus it"],
                ].map(([num, text]) => (
                  <div key={num} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: c.accent, color: "#fff",
                      fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                    }}>{num}</span>
                    <span style={{ fontSize: 13, color: c.textSub, lineHeight: 1.4 }}>{text}</span>
                  </div>
                ))}
              </InfoCard>
            </Section>

            {/* Remote access */}
            <Section label="Remote Access" c={c}>
              <InfoCard c={c}>
                <p style={{ fontSize: 12, color: c.muted, lineHeight: 1.6, margin: 0 }}>
                  For access beyond your home Wi-Fi, install <strong style={{ color: c.text }}>Tailscale</strong> on both your PC and phone, then use the{" "}
                  <code style={{ color: c.accent, fontSize: 11 }}>100.x.x.x</code> IP as the agent URL.
                </p>
              </InfoCard>
            </Section>

            {/* Disconnect */}
            <div style={{ marginTop: "auto" }}>
              <button
                onClick={onDisconnect}
                style={{
                  width: "100%", padding: "12px",
                  background: "transparent", color: c.offline,
                  border: `1px solid ${c.offline}30`, borderRadius: 11,
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                  fontFamily: "Outfit, sans-serif", transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${c.offline}12`}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Disconnect &amp; Go Back
              </button>

              <p style={{ textAlign: "center", fontSize: 11, color: c.muted, marginTop: 14 }}>
                Remote Launcher v1.0 · Made with ⚡
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children, c }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function InfoCard({ children, c }) {
  return (
    <div style={{
      background: c.card, border: `1px solid ${c.border}`,
      borderRadius: 11, padding: "13px 14px",
    }}>
      {children}
    </div>
  );
}

function StatusDot({ state, c }) {
  const bg = state === "online" ? c.online : state === "warn" ? c.warn : c.offline;
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%",
      background: bg, boxShadow: `0 0 6px ${bg}99`,
    }} />
  );
}
