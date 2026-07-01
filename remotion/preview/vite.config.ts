import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// OBS-style preview app. Serves remotion/public at root so staticFile() assets
// (logo-main.svg etc.) resolve inside the <Player>.
export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, "../public"),
  plugins: [react()],
  server: { port: 5178 },
});
