import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // bind to 0.0.0.0 so phones on same Wi-Fi can connect
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000,
  },
  build: {
    outDir:      "dist",
    sourcemap:   false,
    // single chunk for easy static hosting / CDN
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
