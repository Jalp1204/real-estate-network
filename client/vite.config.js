import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal Vite configuration for a React application.
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the Express backend during development.
    // The frontend always calls the relative path `/api/...`, so no API URL
    // is hardcoded in React code and no CORS setup is needed in dev.
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
