import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

let _addToast = null;

/** Call from anywhere: toast.show("message", "success" | "error" | "info") */
export const toast = {
  show: (msg, kind = "info") => _addToast?.(msg, kind),
  success: (msg) => _addToast?.(msg, "success"),
  error:   (msg) => _addToast?.(msg, "error"),
};

export function ToastProvider({ c }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  _addToast = useCallback((msg, kind) => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  }, []);

  const colors = {
    success: { bg: "#052e16", border: "#166534", text: "#86efac" },
    error:   { bg: "#2d0a0a", border: "#7f1d1d", text: "#fca5a5" },
    info:    { bg: c.surface, border: c.border,  text: c.textSub },
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 999, display: "flex", flexDirection: "column", gap: 8,
      alignItems: "center", pointerEvents: "none", width: "calc(100% - 40px)", maxWidth: 340,
    }}>
      <AnimatePresence>
        {toasts.map(({ id, msg, kind }) => {
          const col = colors[kind] || colors.info;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0,  scale: 1   }}
              exit={{    opacity: 0, y: 8,  scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{
                background: col.bg, border: `1px solid ${col.border}`,
                borderRadius: 10, padding: "10px 16px",
                fontSize: 13, fontWeight: 500, color: col.text,
                width: "100%", textAlign: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              {msg}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
