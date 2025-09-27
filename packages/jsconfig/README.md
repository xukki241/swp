# @pharmaflow/jsconfig

Shared project configuration for the PharmaFlow monorepo. This package provides consistent
configurations across all projects in the workspace.

## Included Configurations

### ESLint Configuration

- **Base Config**: Common rules for all JavaScript projects with enhanced plugins:
  - `eslint-plugin-import`: Import/export statement validation and organization
  - `eslint-plugin-promise`: Promise best practices and error handling
  - `eslint-plugin-unicorn`: Additional helpful rules for modern JavaScript
  - `eslint-config-prettier`: Disables conflicting Prettier rules
- **Node Config**: Extends base with Node.js specific globals and rules
- **Browser Config**: Extends base with browser globals and rules

### Prettier Configuration

- Consistent code formatting across all projects
- **Enhanced with plugins**:
  - `prettier-plugin-organize-imports`: Automatically organizes import statements
  - `prettier-plugin-tailwindcss`: Sorts Tailwind CSS classes consistently
- Specific overrides for JSON, Markdown, YAML, CSS, and JavaScript files
- Support for Tailwind CSS class sorting

### JSConfig Configuration

- Base JavaScript project configuration
- Module resolution and path mapping
- Editor support and IntelliSense configuration

## Usage

### ESLint

#### For Node.js projects (like API):

```javascript
// eslint.config.js
import { nodeConfig, globalIgnores } from "@pharmaflow/jsconfig";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: globalIgnores },
  {
    files: ["**/*.js"],
    ...nodeConfig,
    // Add project-specific rules here
  },
]);
```

#### For React/Browser projects (like Web):

```javascript
// eslint.config.js
import { browserConfig, globalIgnores } from "@pharmaflow/jsconfig";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: globalIgnores },
  {
    files: ["**/*.{js,jsx}"],
    ...browserConfig,
    extends: [reactHooks.configs["recommended-latest"], reactRefresh.configs.vite],
    // Add React-specific rules here
  },
]);
```

### Prettier

```javascript
// prettier.config.js
import { prettierConfig } from "@pharmaflow/jsconfig";

export default prettierConfig;
```

Or extend it:

```javascript
// prettier.config.js
import { prettierConfig } from "@pharmaflow/jsconfig";

export default {
  ...prettierConfig,
  // Override specific settings
  printWidth: 120,
};
```

### JSConfig

```json
// jsconfig.json
{
  "extends": "@pharmaflow/jsconfig/jsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

## Enhanced Features

### ESLint Enhancements

The ESLint configuration now includes:

- **Import Organization**: Automatically enforces import order and grouping
- **Promise Handling**: Ensures proper promise patterns and error handling
- **Modern JavaScript**: Unicorn plugin provides additional helpful rules
- **Code Quality**: Enhanced rules for better maintainability
- **Prettier Integration**: Seamless integration without rule conflicts

### Prettier Enhancements

The Prettier configuration now includes:

- **Import Sorting**: Automatically organizes imports on save
- **Tailwind Support**: Sorts Tailwind classes for consistency
- **File-specific Rules**: Optimized formatting for different file types
- **Plugin Integration**: Enhanced support for modern development workflows

## Files Included

- `eslint.config.base.js` - Enhanced ESLint configurations with plugins
- `prettier.config.js` - Enhanced Prettier configuration with plugins
- `jsconfig.base.json` - Base JSConfig for JavaScript projects
- `index.js` - Main export file for programmatic access
- `README.md` - Documentation and usage examples

## Development

This package is private and only used within the PharmaFlow monorepo. It provides consistent tooling
configuration across all workspace packages.

### Plugin Benefits

- **Improved Code Quality**: Enhanced linting rules catch more issues
- **Better Developer Experience**: Auto-formatting and import organization
- **Consistency**: Standardized rules across all projects
- **Modern Standards**: Up-to-date best practices for JavaScript development
