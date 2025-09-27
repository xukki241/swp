# Contributing to Pharmacy Management API

Welcome to the Pharmacy Management API project! This guide will help you understand our codebase
structure, development workflow, and contribution standards.

## Table of Contents

- [Project Overview](#project-overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Database Development](#database-development)
- [API Development](#api-development)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Getting Help](#getting-help)
- [Resources](#resources)

## Project Overview

This is a modern Node.js Express API for pharmacy management, featuring:

- **Runtime**: Node.js 22+ with ES modules
- **Framework**: Express 5.x
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Valibot schemas with custom middleware
- **Package Manager**: pnpm (required)
- **Architecture**: Factory pattern for controllers and services

### Core Features

- User management with roles and authentication
- Medication and inventory management
- Supplier and purchase order management
- Sales and customer management
- Reporting capabilities

## Development Setup

### Prerequisites

- Node.js 22 or higher
- pnpm 10 or higher
- PostgreSQL database
- Git

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd apps/api
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**

Copy the `.env.example` file and rename it to `.env`.

Then edit `.env` with your specific configuration.

> **Note**: The `env.example` file contains all available configuration options with example values.
> Never commit your actual `.env` file to version control.

4. **Database Setup**

   ```bash
   # Generate and run migrations
   pnpm db:migrate

   # Seed the database with initial data
   pnpm db:seed

   # (Optional) Open Drizzle Studio for database management
   pnpm db:studio
   ```

5. **Start Development Server**

   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app.js                 # Express app configuration
├── server.js             # Server entry point
├── config/
│   └── env.js            # Environment configuration
├── db/                   # Database layer (see src/db/README.md)
│   ├── connection.js     # Database connection
│   ├── schema/           # Drizzle schema definitions
│   ├── migrations/       # Database migrations
│   └── seed.js          # Database seeding
├── controllers/          # HTTP controllers (see src/controllers/README.md)
│   ├── common/           # Reusable controller patterns
│   └── *.controller.js   # Route handlers
├── services/             # Business logic (see src/services/README.md)
│   ├── common/           # Reusable service patterns
│   └── *.service.js      # Business logic layer
├── routes/               # Route definitions (see src/routes/README.md)
├── validation/           # Input validation (see src/validation/README.md)
│   └── schemas/         # Valibot validation schemas
└── middleware/           # Custom middleware (see src/middleware/README.md)
```

### Key Architectural Patterns

- **Factory Pattern**: Standardized CRUD controllers and services
- **Validation Pipeline**: Valibot schemas for request validation
- **Middleware Composition**: Layered request processing
- **Service Layer**: Separation of business logic from HTTP handling

> 📚 **Detailed Implementation**: Each directory has its own README with comprehensive guides,
> examples, and best practices.

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Commit Messages

Follow conventional commits format:

```
type(scope): description

feat(api): add user authentication endpoint
fix(db): resolve connection pool timeout issue
docs(readme): update installation instructions
refactor(controllers): extract common validation logic
```

### Development Process

1. **Create a feature branch**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following our standards
   - Add appropriate tests
   - Update documentation if needed

3. **Test your changes**

   ```bash
   pnpm dev  # Test locally
   # Run any additional tests
   ```

4. **Commit and push**

   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

## Code Standards

### JavaScript/ES Modules

- Use ES6+ features and ES modules (`import`/`export`)
- Use `const` and `let`, avoid `var`
- Prefer arrow functions for callbacks
- Use template literals for string interpolation
- Follow camelCase naming convention

### File Naming

- Use kebab-case for file names: `user-controller.js`
- Use PascalCase for class names
- Use camelCase for functions and variables

### Code Structure

```javascript
// File header with description
/**
 * User Controller
 * Handles user-related HTTP requests
 */

// Imports (external first, then internal)
import express from "express";
import { crudControllerFactory } from "./common/factory.js";
import { usersService } from "../services/index.js";

// Constants
const ENTITY_NAME = "User";

// Main implementation
export const usersController = crudControllerFactory(usersService, {
  entityName: ENTITY_NAME,
  allowedSortFields: ["name", "email", "createdAt"],
  transformResponse: user => ({ ...user, password: undefined }),
});

// Default export (if applicable)
export default usersController;
```

### Error Handling

Always use consistent error response format:

```javascript
// Success response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error response
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [/* error details */]
}
```

### Documentation

- Add JSDoc comments for all public functions
- Include parameter types and descriptions
- Document complex business logic
- Keep README.md updated

## Database Development

We use Drizzle ORM with PostgreSQL for type-safe database operations.

### Quick Commands

```bash
# Generate new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open database studio
pnpm db:studio

# Seed database
pnpm db:seed
```

### Development Workflow

1. **Modify schema files** in `src/db/schema/`
2. **Generate migration**: `pnpm db:generate`
3. **Review generated SQL** in `src/db/migrations/`
4. **Apply migration**: `pnpm db:migrate`

> 📚 **For detailed database development guide**, see [`src/db/README.md`](src/db/README.md)

## API Development

### Quick Start: Adding a New Resource

1. **Define database schema** in `src/db/schema/`
2. **Create validation schemas** in `src/validation/schemas/`
3. **Generate service** using CRUD factory
4. **Generate controller** using CRUD factory
5. **Define routes** with validation middleware
6. **Export routes** in `src/routes/index.js`

### Standard Response Format

```javascript
// Success
{ "success": true, "data": {}, "message": "Operation completed" }

// Error
{ "success": false, "error": "Error Type", "message": "Description" }
```

> 📚 **For detailed guides**, see:
>
> - [Controllers](src/controllers/README.md) - HTTP request handling
> - [Services](src/services/README.md) - Business logic implementation
> - [Validation](src/validation/README.md) - Input validation with Valibot
> - [Routes](src/routes/README.md) - Endpoint organization and middleware
> - [Middleware](src/middleware/README.md) - Custom middleware development

## Testing Guidelines

The project uses Jest for testing with ES modules support.

### Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Testing Standards

- Write tests for all new features and bug fixes
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies
- Aim for high test coverage (>80%)

> 📚 **Testing examples and patterns** are included in each domain-specific README

## Pull Request Process

### Before Submitting

1. **Ensure code quality**
   - Code follows our standards
   - No console errors or warnings
   - All tests pass

2. **Update documentation**
   - Add/update JSDoc comments
   - Update README if needed
   - Add API documentation

3. **Test thoroughly**
   - Test your changes locally
   - Verify database migrations work
   - Check API endpoints manually

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Local testing completed
- [ ] Database migrations tested
- [ ] API endpoints verified

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** must pass
2. **Peer review** required from team members
3. **Manual testing** for significant changes
4. **Documentation review** for API changes

## Common Tasks

### Adding a New Resource

1. Create database schema in `src/db/schema/`
2. Generate migration: `pnpm db:generate`
3. Apply migration: `pnpm db:migrate`
4. Create validation schemas in `src/validation/schemas/`
5. Create service using factory pattern
6. Create controller using factory pattern
7. Define routes with validation middleware
8. Export routes in main router

### Database Management

```bash
# View/manage database
pnpm db:studio

# Reset database (development only)
pnpm db:drop && pnpm db:migrate && pnpm db:seed
```

## Troubleshooting

### Quick Fixes

```bash
# Environment setup
node --version    # Should be 22+
pnpm --version    # Should be 10+

# Clean install
rm -rf node_modules pnpm-lock.yaml && pnpm install

# Database issues
pnpm db:studio    # Check database connection
pnpm db:drop && pnpm db:migrate && pnpm db:seed  # Reset database

# Development server
netstat -an | findstr :3000  # Check if port is available
DEBUG=* pnpm dev             # Start with debug logging
```

### Common Issues

- **Module Errors**: Ensure ES modules (`"type": "module"` in package.json)
- **Validation Errors**: Use Valibot syntax (`import * as v from 'valibot'`)
- **Database Errors**: Check PostgreSQL is running and DATABASE_URL is correct

## Getting Help

- **Documentation**: Check this guide and code comments
- **Issues**: Search existing issues before creating new ones
- **Questions**: Use discussions for general questions
- **Code Review**: Tag team members for review

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Valibot Documentation](https://valibot.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

Thank you for contributing to the Pharmacy Management API! 🚀
