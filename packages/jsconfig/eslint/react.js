import { baseConfig } from "./base.js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";

/**
 * React/JSX specific configuration for frontend projects
 */
export const reactConfig = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    react: reactPlugin,
    "react-hooks": reactHooksPlugin,
    "react-refresh": reactRefreshPlugin,
  },
  languageOptions: {
    ...baseConfig.languageOptions,
    ecmaVersion: 2022,
    sourceType: "module",
    globals: {
      ...baseConfig.languageOptions.globals,
      ...globals.browser,
    },
    parserOptions: {
      ecmaVersion: "latest",
      ecmaFeatures: {
        jsx: true,
        modules: true,
      },
      sourceType: "module",
    },
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    ...baseConfig.rules,

    // === Browser Specific Overrides ===
    "no-console": "off", // Allow console in browser for debugging
    "no-alert": "warn", // Allow alerts but warn

    // === React Hooks Rules (Specific) ===
    // These replace react-hooks/recommended
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies

    // === React Refresh Rules ===
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],

    // === JSX and React Best Practices ===
    // Component patterns
    "react/jsx-uses-react": "off", // Not needed with new JSX transform
    "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
    "react/jsx-uses-vars": "error",
    "react/jsx-key": [
      "error",
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      },
    ],
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-pascal-case": "error",
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],

    // Component definition
    "react/prop-types": "off", // We'll use TypeScript for prop validation
    "react/display-name": "warn",
    "react/no-children-prop": "error",
    "react/no-danger": "warn",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-find-dom-node": "error",
    "react/no-is-mounted": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-unescaped-entities": "warn",
    "react/no-unknown-property": "error",
    "react/require-render-return": "error",
    "react/self-closing-comp": "error",
    "react/style-prop-object": "error",
    "react/void-dom-elements-no-children": "error",

    // State and lifecycle
    "react/no-access-state-in-setstate": "error",
    "react/no-did-mount-set-state": "error",
    "react/no-did-update-set-state": "error",
    "react/no-redundant-should-component-update": "error",
    "react/no-this-in-sfc": "error",
    "react/no-typos": "error",
    "react/no-unsafe": "warn",
    "react/no-unused-state": "error",
    "react/no-will-update-set-state": "error",
    "react/prefer-es6-class": "error",
    "react/prefer-stateless-function": "warn",
    "react/state-in-constructor": ["error", "always"],

    // Modern React patterns
    "react/function-component-definition": [
      "error",
      {
        unnamedComponents: "arrow-function",
      },
    ],
    "react/hook-use-state": "error",
    "react/jsx-no-constructed-context-values": "error",
    "react/jsx-no-leaked-render": "error",
    "react/no-array-index-key": "warn",
    "react/no-object-type-as-default-prop": "error",
    "react/no-unstable-nested-components": "error",

    // === JSX Formatting and Style ===
    "react/jsx-boolean-value": ["error", "never"],
    "react/jsx-closing-bracket-location": ["error", "line-aligned"],
    "react/jsx-closing-tag-location": "error",
    "react/jsx-curly-brace-presence": [
      "error",
      { props: "never", children: "never" },
    ],
    "react/jsx-curly-spacing": ["error", "never"],
    "react/jsx-equals-spacing": ["error", "never"],
    "react/jsx-first-prop-new-line": ["error", "multiline-multiprop"],
    "react/jsx-indent": ["error", 2],
    "react/jsx-indent-props": ["error", 2],
    "react/jsx-max-props-per-line": [
      "error",
      { maximum: 1, when: "multiline" },
    ],
    "react/jsx-newline": ["error", { prevent: true }],
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-props-no-multi-spaces": "error",
    "react/jsx-tag-spacing": [
      "error",
      {
        closingSlash: "never",
        beforeSelfClosing: "always",
        afterOpening: "never",
        beforeClosing: "never",
      },
    ],
    "react/jsx-wrap-multilines": [
      "error",
      {
        declaration: "parens-new-line",
        assignment: "parens-new-line",
        return: "parens-new-line",
        arrow: "parens-new-line",
        condition: "parens-new-line",
        logical: "parens-new-line",
        prop: "parens-new-line",
      },
    ],

    // === Import/Export patterns for React ===
    "import/no-default-export": "off", // React components are commonly default exports
    "import/prefer-default-export": "off", // Allow named exports
    "import/no-anonymous-default-export": [
      "error",
      {
        allowArray: false,
        allowArrowFunction: false, // Prefer named components
        allowAnonymousClass: false,
        allowAnonymousFunction: false,
        allowCallExpression: true, // Allow HOCs
        allowNew: false,
        allowObject: false,
        allowLiteral: false,
      },
    ],

    // === Unicorn overrides for React ===
    "unicorn/filename-case": [
      "error",
      {
        cases: {
          camelCase: true,
          pascalCase: true, // Allow PascalCase for React components
          kebabCase: true,
        },
      },
    ],
    "unicorn/prevent-abbreviations": "off", // React uses common abbreviations like props
    "unicorn/no-array-callback-reference": "off", // Common in React event handlers
    "unicorn/no-null": "off", // React uses null for conditional rendering

    // === Performance and Best Practices ===
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_|^React$", // Allow unused React import
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
  },
};

export default reactConfig;
