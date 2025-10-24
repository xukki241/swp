# PharmaFlow - Pharmacy Management System

A monorepo powered by [Turborepo](https://turbo.build/repo) v2.5.8.

## 🚀 Quick Start

**📖 [Complete Setup Guide](./00-COMPLETE_SETUP_GUIDE.md)** ← Start here for full deployment setup!

This guide covers:

- ✅ Local Docker development
- ✅ GitLab CI/CD setup
- ✅ Self-hosted server deployment
- ✅ Azure cloud deployment
- ✅ Two-branch strategy (next → production)

## Project Structure

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
- `pnpm typecheck` - Run TypeScript type checking
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

## 📚 Documentation

### Setup & Deployment

- **[00-COMPLETE_SETUP_GUIDE.md](./00-COMPLETE_SETUP_GUIDE.md)** - All-in-one setup guide (START HERE!)
- [01-DOCKER_README.md](./01-DOCKER_README.md) - Docker setup details
- [02-BRANCHING_STRATEGY.md](./02-BRANCHING_STRATEGY.md) - Git workflow
- [03-TWO_BRANCH_SETUP.md](./03-TWO_BRANCH_SETUP.md) - Two-branch deployment

### CI/CD & Deployment

- [04-CICD_SETUP.md](./04-CICD_SETUP.md) - GitLab CI/CD configuration
- [05-GITLAB_VARIABLES_GUIDE.md](./05-GITLAB_VARIABLES_GUIDE.md) - Environment variables
- [06-DEPLOYMENT_SUMMARY.md](./06-DEPLOYMENT_SUMMARY.md) - Deployment overview
- [07-DEPLOYMENT_MASTER_GUIDE.md](./07-DEPLOYMENT_MASTER_GUIDE.md) - Master deployment guide
- [08-QUICK_REFERENCE.md](./08-QUICK_REFERENCE.md) - Quick commands reference

### Azure Cloud

- [09-AZURE_DEPLOYMENT.md](./09-AZURE_DEPLOYMENT.md) - Azure setup
- [10-AZURE_CICD.md](./10-AZURE_CICD.md) - Azure CI/CD integration
- [11-AZURE_INTEGRATION_COMPLETE.md](./11-AZURE_INTEGRATION_COMPLETE.md) - Azure completion guide
- [12-AZURE_QUICK_REFERENCE.md](./12-AZURE_QUICK_REFERENCE.md) - Azure commands

### Features & Migrations

- [13-DB_QUERY_MIGRATION_SUMMARY.md](./13-DB_QUERY_MIGRATION_SUMMARY.md) - Database migrations
- [14-PURCHASE_ORDER_EMAIL_FEATURE.md](./14-PURCHASE_ORDER_EMAIL_FEATURE.md) - Email feature
- [15-PURCHASE_ORDER_LOADING_STATE.md](./15-PURCHASE_ORDER_LOADING_STATE.md) - Loading states
