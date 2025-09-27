import { baseConfig } from "./base.js";
import globals from "globals";

/**
 * Node.js specific configuration for API/backend projects
 */
export const nodeConfig = {
  ...baseConfig,
  languageOptions: {
    ...baseConfig.languageOptions,
    globals: {
      ...baseConfig.languageOptions.globals,
      ...globals.node,
    },
  },
  rules: {
    ...baseConfig.rules,

    // === Node.js Specific Rules ===
    // Console is acceptable in Node.js for server logging
    "no-console": "off",

    // Buffer and process usage
    "no-buffer-constructor": "error",
    "no-process-exit": "error",
    "no-process-env": "off", // Allow process.env for configuration

    // Module imports - prefer Node.js protocol imports
    "unicorn/prefer-node-protocol": "error",
    "import/no-nodejs-modules": "off", // Allow Node.js built-in modules

    // Security and best practices for server-side code
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",

    // Async/await patterns common in Node.js
    "require-atomic-updates": "error",
    "no-async-promise-executor": "error",
    "no-await-in-loop": "warn",
    "no-promise-executor-return": "error",
    "prefer-promise-reject-errors": "error",

    // Error handling patterns
    "handle-callback-err": "error",
    "no-sync": "warn", // Prefer async methods when available

    // Express.js specific patterns
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true, // Allow patterns like: req.user && next()
        allowTernary: true,
      },
    ],

    // Database and API security
    "no-mixed-requires": "error",
    "no-new-require": "error",
    "no-path-concat": "error",

    // Performance considerations for server-side
    "no-regex-spaces": "error",
    "no-useless-call": "error",
    "no-useless-concat": "error",

    // Allow certain patterns common in Express apps
    "unicorn/no-array-callback-reference": "off", // Express uses callbacks extensively
    "unicorn/no-array-method-this-argument": "off",

    // Express middleware patterns
    "import/no-anonymous-default-export": [
      "error",
      {
        allowArray: false,
        allowArrowFunction: true, // Allow for middleware functions
        allowAnonymousClass: false,
        allowAnonymousFunction: true, // Allow for middleware functions
        allowCallExpression: true,
        allowNew: false,
        allowObject: false,
        allowLiteral: false,
      },
    ],
  },
};

export default nodeConfig;
