import { defineConfig } from "eslint/config";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

import { baseConfig } from "./base.js";

export const webConfig = defineConfig([
  ...baseConfig,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  jsxA11yPlugin.flatConfigs.recommended,
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-alert": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React
      "react/prop-types": "off", // Turn off if using TypeScript
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
    },
  },
]);
