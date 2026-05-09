import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff } from "lucide-react";

export function PairScreen({ onConnect, onDemo, c }) {
  const [url,      setUrl]      = useState("http://");
  const [token,    setToken]    = useState("");
  const [showTok,  setShowTok]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleConnect = async () => {
    const cleanUrl = url.trim().replace(/\/$/, "");
    const cleanTok = token.trim();
    if (!cleanUrl || cleanUrl === "http://" || !cleanTok) {
      setError("Please enter both the Agent URL and your pairing token.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Quick reachability check before handing off to the WS hook
      const res = await fetch(`${cleanUrl}/`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error(`Agent returned ${res.status}`);
      onConnect(cleanUrl, cleanTok);
    } catch (e) {
      setError("Could not reach the PC agent. Check the URL and ensure run.bat is running.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: c.card,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    color: c.text,
    fontSize: 15,
    fontFamily: "Outfit, sans-serif",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      background: c.bg,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Topographic background */}
      <TopoBg c={c} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1 }}
      >
        {/* Logo + wordmark */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
            style={{
              width: 68, height: 68, borderRadius: 20,
              background: c.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: `0 16px 48px ${c.accentGlow}`,
            }}
          >
            <Zap size={34} color="#fff" fill="#fff" />
          </motion.div>

          <h1 style={{
            fontSize: 26, fontWeight: 700, color: c.text,
            letterSpacing: "-0.04em", margin: 0,
          }}>
            Remote Launcher
          </h1>
          <p style={{ fontSize: 14, color: c.muted, marginTop: 7, lineHeight: 1.5 }}>
            Open apps and switch tabs on your PC<br />from your phone — in real time.
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* URL */}
          <div>
            <Label text="PC Agent URL" c={c} />
            <input
              style={inputStyle}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="http://192.168.1.42:8765"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="url"
            />
          </div>

          {/* Token */}
          <div>
            <Label text="Pairing Token" c={c} />
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 44 }}
                type={showTok ? "text" : "password"}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Paste token from agent…"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onKeyDown={e => e.key === "Enter" && handleConnect()}
              />
              <button
                onClick={() => setShowTok(v => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: c.muted, display: "flex", padding: 4,
                }}
              >
                {showTok ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{ color: c.offline, fontSize: 13, marginTop: 12, lineHeight: 1.5 }}
          >
            {error}
          </motion.p>
        )}

        {/* Connect button */}
        <motion.button
          onClick={handleConnect}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "block", width: "100%",
            marginTop: 20, padding: "14px",
            background: c.accent, color: "#fff",
            border: "none", borderRadius: 13,
            fontSize: 16, fontWeight: 600, cursor: loading ? "default" : "pointer",
            fontFamily: "Outfit, sans-serif",
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.15s",
            letterSpacing: "-0.01em",
          }}
        >
          {loading ? "Connecting…" : "Connect to PC"}
        </motion.button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
          <div style={{ flex: 1, height: 1, background: c.border }} />
          <span style={{ fontSize: 12, color: c.muted }}>or</span>
          <div style={{ flex: 1, height: 1, background: c.border }} />
        </div>

        {/* Demo mode */}
        <button
          onClick={onDemo}
          style={{
            display: "block", width: "100%", padding: "13px",
            background: "transparent", color: c.textSub,
            border: `1px solid ${c.border}`, borderRadius: 13,
            fontSize: 15, fontWeight: 500, cursor: "pointer",
            fontFamily: "Outfit, sans-serif", transition: "border-color 0.15s, color 0.15s",
          }}
        >
          Try Demo Mode
        </button>

        {/* Footer hint */}
        <p style={{ textAlign: "center", fontSize: 11, color: c.muted, marginTop: 28, lineHeight: 1.8 }}>
          Run <code style={{ color: c.text, background: c.card, padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>run.bat</code> on your PC,
          then visit <code style={{ color: c.accent, fontSize: 11 }}>http://&lt;pc-ip&gt;:8765/pair</code> to get your token.
          For remote access, use Tailscale.
        </p>
      </motion.div>
    </div>
  );
}

function Label({ text, c }) {
  return (
    <label style={{
      display: "block", fontSize: 11, fontWeight: 600,
      color: c.muted, textTransform: "uppercase",
      letterSpacing: "0.07em", marginBottom: 7,
    }}>
      {text}
    </label>
  );
}

function TopoBg({ c }) {
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: c.topoOpacity }}
      viewBox="0 0 400 750" preserveAspectRatio="xMidYMid slice"
    >
      {[...Array(16)].map((_, i) => (
        <ellipse
          key={i}
          cx={200 + Math.sin(i * 1.2) * 130}
          cy={46 * i}
          rx={175 + i * 10}
          ry={55 + i * 7}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
