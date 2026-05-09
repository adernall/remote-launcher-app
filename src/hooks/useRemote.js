import { useState, useRef, useCallback, useEffect } from "react";

const RECONNECT_DELAY_MS = 3000;

/**
 * useRemote — manages the WebSocket connection to the PC agent.
 *
 * Returns:
 *   apps         — live array of window objects from the agent
 *   tabs         — live array of tab objects from the agent
 *   connected    — boolean, is the socket open?
 *   latency      — round-trip latency in ms (from ping/pong)
 *   lastSync     — Date of last state_update received
 *   connect(url, token)
 *   sendCmd(obj)
 *   disconnect()
 */
export function useRemote() {
  const [apps,      setApps]      = useState([]);
  const [tabs,      setTabs]      = useState([]);
  const [connected, setConnected] = useState(false);
  const [latency,   setLatency]   = useState(null);
  const [lastSync,  setLastSync]  = useState(null);

  const wsRef        = useRef(null);
  const retryRef     = useRef(null);
  const pingTimerRef = useRef(null);
  const pingSentRef  = useRef(null);
  const authRef      = useRef({ url: "", token: "" });

  // ── Send raw command ──────────────────────────────────────────────────────
  const sendCmd = useCallback((cmd) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(cmd));
    }
  }, []);

  // ── Ping loop (every 5 s while connected) ─────────────────────────────────
  const startPingLoop = useCallback(() => {
    clearInterval(pingTimerRef.current);
    pingTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        pingSentRef.current = performance.now();
        sendCmd({ action: "ping" });
      }
    }, 5000);
  }, [sendCmd]);

  // ── Connect ───────────────────────────────────────────────────────────────
  const connect = useCallback((agentUrl, token) => {
    // Tear down existing socket
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }
    clearTimeout(retryRef.current);
    clearInterval(pingTimerRef.current);

    authRef.current = { url: agentUrl, token };

    const wsUrl = agentUrl.replace(/^http/, "ws") + `/ws?token=${encodeURIComponent(token)}`;
    const ws    = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      startPingLoop();
    };

    ws.onclose = (e) => {
      setConnected(false);
      clearInterval(pingTimerRef.current);

      // 4001 = auth rejected — don't retry
      if (e.code !== 4001 && e.code !== 1000) {
        retryRef.current = setTimeout(
          () => connect(authRef.current.url, authRef.current.token),
          RECONNECT_DELAY_MS,
        );
      }
    };

    ws.onerror = () => setConnected(false);

    ws.onmessage = ({ data }) => {
      let msg;
      try { msg = JSON.parse(data); } catch { return; }

      switch (msg.type) {
        case "state_update":
          setApps(msg.apps || []);
          setTabs(msg.tabs || []);
          setLastSync(new Date());
          break;

        case "pong":
          if (pingSentRef.current != null) {
            setLatency(Math.round(performance.now() - pingSentRef.current));
            pingSentRef.current = null;
          }
          break;

        case "ack":
          // optional: show toast
          break;

        default:
          break;
      }
    };
  }, [startPingLoop]);

  // ── Disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    clearTimeout(retryRef.current);
    clearInterval(pingTimerRef.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close(1000, "user disconnect");
    }
    setConnected(false);
    setApps([]);
    setTabs([]);
    setLatency(null);
    setLastSync(null);
    authRef.current = { url: "", token: "" };
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    clearTimeout(retryRef.current);
    clearInterval(pingTimerRef.current);
    wsRef.current?.close();
  }, []);

  return { apps, tabs, connected, latency, lastSync, connect, sendCmd, disconnect };
}


/**
 * useLocalStorage — persist a value across page reloads.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored != null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback((v) => {
    setValue(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);

  return [value, set];
}


/**
 * useOrientation — returns "portrait" | "landscape".
 */
export function useOrientation() {
  const get = () =>
    window.innerWidth >= 600 || window.innerHeight < window.innerWidth
      ? "landscape"
      : "portrait";

  const [orientation, setOrientation] = useState(get);

  useEffect(() => {
    const h = () => setOrientation(get());
    window.addEventListener("resize", h);
    window.addEventListener("orientationchange", h);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("orientationchange", h);
    };
  }, []);

  return orientation;
}
