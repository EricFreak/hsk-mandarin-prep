import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    passWithNoTests: true,
    exclude: ["**/node_modules/**", "**/e2e/**", "**/e2e-report/**"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
