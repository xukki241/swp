import { eslint } from "@pharmaflow/jsconfig";

export const eslintConfig = [
  {
    ignores: eslint.globalIgnores,
  },
  {
    files: ["**/*.js"],
    ...eslint.nodeConfig,
  },
];

export default eslintConfig;
