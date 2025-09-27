# G4-SE1961-NJ-SWP391-FAL25

A monorepo powered by [Turborepo](https://turbo.build/repo) v2.5.8.

## Getting Started

This is a modern Turborepo setup with the following structure:

```
.
├── apps/          # Applications (web apps, mobile apps, etc.)
├── packages/      # Shared packages and libraries
├── package.json   # Root package.json with workspace configuration
├── turbo.json     # Turborepo configuration
└── pnpm-workspace.yaml # PNPM workspace configuration
```

## Prerequisites

- Node.js 18+
- PNPM (recommended package manager)

## Installation

```bash
# Install dependencies
pnpm install
```

## Available Scripts

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Run linting across all packages
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean build artifacts
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Adding Apps and Packages

### Apps

Place your applications in the `apps/` directory. Each app should have its own `package.json`.

### Packages

Place your shared packages in the `packages/` directory. These can be shared utilities, UI
components, configurations, etc.

## Turborepo Features

This setup includes:

- **Fast builds** with intelligent caching
- **Remote caching** support (configure as needed)
- **Parallel execution** of tasks across packages
- **Dependency-aware task scheduling**
- **Hot reloading** during development

## Workspace Management

This monorepo uses PNPM workspaces. All packages in `apps/*` and `packages/*` are automatically
detected and managed.

To add dependencies:

```bash
# Add to root
pnpm add -w <package>

# Add to specific workspace
pnpm add <package> --filter <workspace-name>
```

## Development Workflow

1. Add your apps to the `apps/` directory
2. Add your shared packages to the `packages/` directory
3. Configure tasks in `turbo.json` as needed
4. Use `pnpm dev` to start development
5. Use `pnpm build` to build for production
