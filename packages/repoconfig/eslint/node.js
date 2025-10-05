import { defineConfig } from "eslint/config";
import globals from "globals";
import nodePlugin from "eslint-plugin-n";

import { baseConfig } from "./base.js";

export const nodeConfig = defineConfig([
  ...baseConfig,
  nodePlugin.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      "n/no-missing-import": "off",
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-unpublished-import": "off",
    },
  },
]);
