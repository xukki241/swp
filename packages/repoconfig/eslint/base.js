import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import promisePlugin from "eslint-plugin-promise";
import { defineConfig, globalIgnores } from "eslint/config";

export const baseConfig = defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/.next/**",
    "**/.cache/**",
  ]),
  eslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  promisePlugin.configs["flat/recommended"],
  prettierPlugin, // Must be last to override other configs
  {
    rules: {
      // General
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-shadow": "warn",

      // Import rules
      "import/no-duplicates": "error",
      "import/no-unresolved": "off", // Turn off for now, can be enabled with resolver
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Promise rules
      "promise/always-return": "warn",
      "promise/catch-or-return": "warn",
    },
  },
]);
