import path from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Test environment
    environment: "node",

    // Test file patterns
    include: [
      "**/tests/**/*.test.js",
      "**/tests/**/*.spec.js",
      "**/__tests__/**/*.js",
    ],

    // Setup files
    setupFiles: ["./tests/setup.js"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.js"],
      exclude: [
        "src/db/migrations/**",
        "src/db/seed.js",
        "src/server.js",
        "src/config/**",
        "src/utils/logger.js",
      ],
    },
    testTimeout: 30000,
    globals: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
