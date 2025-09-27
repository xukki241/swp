import * as organizeImports from "prettier-plugin-organize-imports";
import * as tailwindcss from "prettier-plugin-tailwindcss";

/**
 * Shared Prettier configuration for PharmaFlow projects
 * @type {import('prettier').Config}
 */
export const prettierConfig = {
  // Plugins for enhanced functionality
  plugins: [organizeImports, tailwindcss],
  // Core formatting
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "es5",

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Line formatting
  printWidth: 80,
  endOfLine: "lf",

  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions
  arrowParens: "avoid",

  // JSX specific
  jsxSingleQuote: false,

  // Prose formatting
  proseWrap: "preserve",

  // HTML formatting
  htmlWhitespaceSensitivity: "css",

  // Embedded language formatting
  embeddedLanguageFormatting: "auto",

  // Tailwind CSS class sorting (when plugin is available)
  // Note: This path will be resolved relative to each project's root
  tailwindFunctions: ["clsx", "cn", "cva"],

  // Plugin overrides for specific file types
  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 120,
        parser: "json",
      },
    },
    {
      files: "*.md",
      options: {
        proseWrap: "always",
        printWidth: 100,
        parser: "markdown",
      },
    },
    {
      files: ["*.yml", "*.yaml"],
      options: {
        singleQuote: true,
        parser: "yaml",
      },
    },
    {
      files: "*.css",
      options: {
        singleQuote: false,
        parser: "css",
      },
    },
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      options: {
        parser: "babel",
      },
    },
    {
      files: "package.json",
      options: {
        printWidth: 120,
        tabWidth: 2,
        parser: "json-stringify",
      },
    },
  ],
};

export default prettierConfig;
