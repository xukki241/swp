import { baseConfig } from "./base.js";
import globals from "globals";

/**
 * Browser specific configuration
 */
export const browserConfig = {
  ...baseConfig,
  languageOptions: {
    ...baseConfig.languageOptions,
    globals: {
      ...baseConfig.languageOptions.globals,
      ...globals.browser,
    },
  },
  rules: {
    ...baseConfig.rules,
    "no-console": "off", // Allow console in browser for debugging
  },
};

export default browserConfig;
