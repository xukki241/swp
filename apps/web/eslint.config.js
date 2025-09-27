import eslint from "@pharmaflow/jsconfig/eslint/index.js";

export const eslintConfig = [
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/*.{js,jsx}"],
    ...eslint.reactConfig,
  },
];

export default eslintConfig;
