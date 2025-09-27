import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";
import unicornPlugin from "eslint-plugin-unicorn";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

/**
 * Base ESLint configuration for PharmaFlow projects
 * This provides common rules that apply to all JavaScript projects
 */
export const baseConfig = {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    globals: {
      ...globals.es2022,
    },
  },
  plugins: {
    import: importPlugin,
    promise: promisePlugin,
    unicorn: unicornPlugin,
    prettier: prettierPlugin,
  },
  rules: {
    ...js.configs.recommended.rules,
    ...prettierConfig.rules,

    // === Prettier Plugin Rules ===
    "prettier/prettier": "error",

    // === Core JavaScript Rules ===
    // Variables and declarations
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-console": "off",
    "prefer-const": "warn",
    "no-var": "error",

    // Comparison and logic
    eqeqeq: ["warn", "always", { null: "ignore" }],
    "no-implicit-coercion": "off",
    "no-unneeded-ternary": "off",

    // === Import Plugin Rules (Specific) ===
    "import/no-absolute-path": "error",
    "import/no-dynamic-require": "error",
    "import/no-self-import": "error",
    "import/no-cycle": ["error", { maxDepth: 10 }],
    "import/no-useless-path-segments": "error",
    "import/no-duplicates": "error",
    "import/first": "error",
    "import/exports-last": "error",
    "import/no-namespace": "off", // Allow namespace imports when needed
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/newline-after-import": "error",
    "import/no-anonymous-default-export": "warn",

    // === Promise Plugin Rules (Specific) ===
    "promise/catch-or-return": ["error", { allowFinally: true }],
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/always-return": "error",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
    "promise/no-callback-in-promise": "warn",
    "promise/avoid-new": "off", // Allow new Promise when needed
    "promise/no-new-statics": "error",
    "promise/no-return-in-finally": "warn",
    "promise/valid-params": "warn",

    // === Unicorn Plugin Rules (Selective) ===
    // Only include the most valuable unicorn rules that actually exist
    "unicorn/better-regex": "error",
    "unicorn/catch-error-name": "error",
    "unicorn/consistent-destructuring": "error",
    "unicorn/consistent-function-scoping": "error",
    "unicorn/custom-error-definition": "error",
    "unicorn/error-message": "error",
    "unicorn/escape-case": "error",
    "unicorn/expiring-todo-comments": "warn",
    "unicorn/explicit-length-check": "error",
    "unicorn/filename-case": ["error", { case: "kebabCase" }],
    "unicorn/new-for-builtins": "error",
    "unicorn/no-console-spaces": "error",
    "unicorn/no-hex-escape": "error",
    "unicorn/no-instanceof-builtins": "error", // Corrected rule name
    "unicorn/no-new-buffer": "error",
    "unicorn/number-literal-case": "error",
    "unicorn/prefer-add-event-listener": "error",
    "unicorn/prefer-array-find": "error",
    "unicorn/prefer-array-flat-map": "error",
    "unicorn/prefer-array-index-of": "error",
    "unicorn/prefer-array-some": "error",
    "unicorn/prefer-includes": "error",
    "unicorn/prefer-modern-dom-apis": "error",
    "unicorn/prefer-node-protocol": "error",
    "unicorn/prefer-number-properties": "error",
    "unicorn/prefer-optional-catch-binding": "error",
    "unicorn/prefer-string-starts-ends-with": "error",
    "unicorn/prefer-string-trim-start-end": "error",
    "unicorn/prefer-type-error": "error",
    "unicorn/throw-new-error": "error",

    // Disable overly strict unicorn rules
    "unicorn/prevent-abbreviations": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-module": "off",
    "unicorn/prefer-top-level-await": "off",
    "unicorn/no-array-reduce": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/prefer-ternary": "off",
    "unicorn/no-await-expression-member": "off",
  },
};

export default baseConfig;
