# @pharmaflow/repoconfig

Shared configuration package for the PharmaFlow monorepo. This package provides standardized ESLint, Prettier, and JSConfig configurations for consistent code quality and formatting across all packages.

## Usage

### ESLint Configuration

#### For Node.js packages:

Create an `eslint.config.js` file:

```js
import { nodeConfig } from "@pharmaflow/repoconfig/eslint/node";

export default nodeConfig;
```

#### For Web/Browser packages:

```js
import { webConfig } from "@pharmaflow/repoconfig/eslint/web";

export default webConfig;
```

#### For custom configurations:

```js
import { baseConfig } from "@pharmaflow/repoconfig/eslint/base";

export default [
  ...baseConfig,
  {
    // Your custom rules
  },
];
```

### Prettier Configuration

Create a `prettier.config.js` file:

```js
import { prettierConfig } from "@pharmaflow/repoconfig/prettier";

export default prettierConfig;
```

Or extend it:

```js
import { prettierConfig } from "@pharmaflow/repoconfig/prettier";

export default {
  ...prettierConfig,
  // Your overrides
  printWidth: 100,
};
```

**Note:** Since Prettier is integrated with ESLint via `eslint-plugin-prettier`, the ignore patterns from ESLint's `globalIgnores` will automatically apply to Prettier as well. You don't need a separate `.prettierignore` file unless you're running Prettier standalone.

If you need to run Prettier separately, create a `.prettierignore` file in your project root:

```
# .prettierignore
node_modules
dist
build
.turbo
coverage
.next
.cache
pnpm-lock.yaml
```

### JSConfig Configuration

#### For Node.js packages:

Create a `jsconfig.json` file:

```json
{
  "extends": "@pharmaflow/repoconfig/jsconfig/node"
}
```

#### For Web/Browser packages:

```json
{
  "extends": "@pharmaflow/repoconfig/jsconfig/web"
}
```

## Configurations

### ESLint

- **Base**: Common rules for all JavaScript code
  - Recommended ESLint rules
  - Global ignores (node_modules, dist, build, etc.)
  - Prettier integration (runs Prettier as an ESLint rule)
  - Import plugin for better import management
  - Promise plugin for async best practices
  - No unused variables (with underscore prefix exception)
  - Console warnings (allows warn/error)
  - Prefer const over let
  - No var usage
  - Strict equality checks
  - Curly braces required
  - No shadow variables
  - Organized imports with alphabetization
  - Automatic Prettier formatting enforcement

- **Node**: Base config + Node.js specific rules
  - Node.js plugin (eslint-plugin-n)
  - Node.js globals
  - ES2021+ features
  - Process exit warnings
  - Monorepo-friendly settings

- **Web**: Base config + Browser specific rules
  - React plugin with JSX runtime support
  - React Hooks plugin
  - JSX Accessibility plugin (a11y)
  - Browser globals
  - ES2021+ features
  - Alert warnings
  - Console info allowed
  - Automatic React version detection

### Prettier

**Code Formatting:**

- Print width: 80 characters
- Tab width: 2 spaces
- Use tabs: false (spaces only)
- Semi-colons: enabled
- Quote style: double quotes
- Quote props: as-needed

**JSX:**

- JSX single quotes: false (double quotes)
- JSX bracket same line: false

**Commas & Spacing:**

- Trailing commas: ES5 compatible
- Bracket spacing: enabled
- Arrow function parentheses: always

**Line Endings:**

- End of line: LF (Unix-style)

**HTML & Vue:**

- HTML whitespace sensitivity: CSS
- Vue indent script and style: false

**Other:**

- Prose wrap: preserve
- Embedded language formatting: auto
- Single attribute per line: false

### JSConfig

- **Base**: Common TypeScript/JavaScript compiler options
  - Target: ES2020
  - Module: ESNext
  - Module resolution: bundler
  - Strict mode enabled
  - JSON module resolution
  - ESM interop

- **Node**: Base + Node.js library
- **Web**: Base + DOM + React JSX support

## License

Private package for internal use only.
