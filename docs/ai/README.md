# OpenAPI Documentation Structure

This directory contains the OpenAPI 3.0.3 specification for the PharmaFlow API.

## Structure

```
openapi/
├── openapi.yaml                 # Main OpenAPI specification file
├── components/                  # Reusable component definitions
│   ├── common/                  # Common/shared components
│   │   ├── schemas.yaml        # Common schemas (UUID, Name, Email, etc.)
│   │   ├── parameters.yaml     # Common parameters (pagination, search, etc.)
│   │   ├── responses.yaml      # Common responses (errors, success, etc.)
│   │   └── enums.yaml          # Enumerations (user roles, statuses, etc.)
│   ├── auth/                    # Authentication components
│   │   └── schemas.yaml        # Auth-related schemas
│   ├── users/                   # User management components
│   │   └── schemas.yaml        # User-related schemas
│   ├── customers/               # Customer components
│   ├── inventory/               # Inventory components
│   ├── medications/             # Medication components
│   ├── purchases/               # Purchase components
│   ├── reports/                 # Report components
│   ├── sales/                   # Sales components
│   ├── suppliers/               # Supplier components
│   └── warehouse/               # Warehouse components
└── paths/                       # API endpoint definitions
    ├── auth/                    # Authentication endpoints
    │   ├── register.yaml
    │   ├── login.yaml
    │   ├── forgot-password.yaml
    │   ├── reset-password.yaml
    │   ├── change-password.yaml
    │   └── me.yaml
    ├── users/                   # User management endpoints
    │   ├── users.yaml
    │   └── users-id.yaml
    ├── system/                  # System endpoints
    │   └── health.yaml
    ├── customers/               # Customer endpoints (TODO)
    ├── inventory/               # Inventory endpoints (TODO)
    ├── medications/             # Medication endpoints (TODO)
    ├── purchases/               # Purchase endpoints (TODO)
    ├── reports/                 # Report endpoints (TODO)
    ├── sales/                   # Sales endpoints (TODO)
    ├── suppliers/               # Supplier endpoints (TODO)
    └── warehouse/               # Warehouse endpoints (TODO)
```

## Completed Features

### ✅ Common Components

- **Schemas**: UUID, Name, Email, Phone, Address, Date, DateTime, Pagination, Error, Message
- **Parameters**: Page, Limit, SortBy, SortOrder, Search, ID
- **Responses**: BadRequest, Unauthorized, Forbidden, NotFound, Conflict, InternalServerError
- **Enums**: All system enumerations (UserRole, UserStatus, OrderStatus, etc.)

### ✅ Authentication (Auth)

All auth endpoints are fully defined with DTOs:

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/change-password` - Change password (authenticated)
- `GET /auth/me` - Get current user info

### ✅ User Management (Users)

User CRUD operations with DTOs:

- `GET /users` - List users (paginated, filterable)
- `POST /users` - Create users (batch)
- `GET /users/{id}` - Get user by ID
- `PATCH /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### ✅ System

- `GET /health` - Health check endpoint

## TODO: Remaining Modules

The following modules need their OpenAPI definitions:

- [ ] Customers
- [ ] Inventory
- [ ] Medications
- [ ] Purchases
- [ ] Reports
- [ ] Sales
- [ ] Suppliers
- [ ] Warehouse

## Viewing the Documentation

### Option 1: Swagger UI

You can use Swagger UI to view and interact with the API documentation:

```bash
npx swagger-ui-watcher openapi/openapi.yaml
```

### Option 2: Redoc

For a clean, three-panel documentation view:

```bash
npx redoc-cli serve openapi/openapi.yaml
```

### Option 3: VS Code Extension

Install the "OpenAPI (Swagger) Editor" extension in VS Code for inline validation and preview.

## Development Guidelines

### Adding New Endpoints

1. **Create component schemas** in `components/{module}/schemas.yaml`
2. **Create path definition** in `paths/{module}/{endpoint}.yaml`
3. **Reference in main file** by adding the path reference in `openapi.yaml`

### Example: Adding a new endpoint

```yaml
# In openapi.yaml
paths:
  /medications:
    $ref: "./paths/medications/medications.yaml#/~1medications"
```

### Schema Reference Format

- **Same file**: `#/ComponentName`
- **Different file**: `./path/to/file.yaml#/ComponentName`
- **Path with slashes**: Use `~1` to escape `/` in JSON pointers
  - Example: `/auth/login` → `#/~1auth~1login`

### Best Practices

1. **Reuse common components** - Don't duplicate schemas, use `$ref`
2. **Keep files focused** - One resource per path file
3. **Document everything** - Add descriptions to all fields
4. **Use examples** - Provide realistic example values
5. **Follow DTO schemas** - Match the Zod schemas in `packages/dto/src/core/`

## Validation

The OpenAPI specification is validated on file save. Common issues:

- Unused components (warning only)
- Invalid $ref paths
- Missing required fields
- Type mismatches

## Source of Truth

The OpenAPI specification is generated from:

- **DTO Schemas**: `packages/dto/src/core/` - Request/response validation
- **Database Schema**: `apps/api/src/db/schema/` - Data models
- **NOT from routes** - Routes may differ from the spec

This ensures the API contract is independent of implementation details.
