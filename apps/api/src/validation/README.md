# Validation Layer

This directory contains all input validation schemas and utilities using Valibot for type-safe validation of API requests.

## Overview

- **Library**: Valibot for schema-based validation
- **Responsibility**: Input validation, data transformation, and error handling
- **Integration**: Drizzle-Valibot for automatic schema generation from database schemas
- **Middleware**: Custom validation middleware for request processing

## Directory Structure

```
validation/
├── schemas/
│   ├── common.js        # Reusable validation schemas
│   ├── users.js         # User-specific validation schemas
│   └── index.js         # Schema exports
└── index.js            # Validation utilities export
```

## Valibot Basics

Valibot provides a functional approach to schema validation with excellent TypeScript support and performance.

### Basic Schema Types

```javascript
import * as v from 'valibot';

// Primitive types
const stringSchema = v.string('Must be a string');
const numberSchema = v.number('Must be a number');
const booleanSchema = v.boolean('Must be a boolean');

// String validation with transformations
const emailSchema = v.pipe(
  v.string('Email must be a string'),
  v.trim(),                    // Remove whitespace
  v.toLowerCase(),             // Convert to lowercase
  v.email('Invalid email format'),
  v.maxLength(255, 'Email too long')
);

// Number validation
const ageSchema = v.pipe(
  v.number('Age must be a number'),
  v.integer('Age must be an integer'),
  v.minValue(0, 'Age must be positive'),
  v.maxValue(120, 'Age must be realistic')
);

// Enum/choice validation
const statusSchema = v.picklist(
  ['active', 'inactive', 'suspended'],
  'Status must be active, inactive, or suspended'
);
```

### Object Schemas

```javascript
// Basic object schema
const userSchema = v.object({
  name: v.pipe(
    v.string('Name must be a string'),
    v.trim(),
    v.minLength(1, 'Name is required'),
    v.maxLength(255, 'Name too long')
  ),
  email: emailSchema,
  age: v.optional(ageSchema),  // Optional field
  status: v.optional(statusSchema, 'active')  // Optional with default
});

// Partial schemas for updates
const userUpdateSchema = v.partial(userSchema);

// Pick specific fields
const userLoginSchema = v.pick(userSchema, ['email', 'password']);
```

## Common Validation Schemas

Located in `src/validation/schemas/common.js`, these schemas are reused across different entities:

### Parameter Validation

```javascript
// ID parameter validation
export const idParamSchema = v.object({
  id: v.pipe(
    v.string('ID must be a string'),
    v.transform(input => parseInt(input, 10)),
    v.number('ID must be a number'),
    v.integer('ID must be an integer'),
    v.minValue(1, 'ID must be positive')
  )
});

// Email parameter validation
export const emailParamSchema = v.object({
  email: v.pipe(
    v.string('Email must be a string'),
    v.trim(),
    v.toLowerCase(),
    v.email('Invalid email format')
  )
});
```

### Query Parameter Schemas

```javascript
// Pagination schema
export const paginationSchema = v.object({
  page: v.optional(
    v.pipe(
      v.string('Page must be a string'),
      v.transform(input => parseInt(input, 10)),
      v.number('Page must be a number'),
      v.integer('Page must be an integer'),
      v.minValue(1, 'Page must be at least 1')
    )
  ),
  limit: v.optional(
    v.pipe(
      v.string('Limit must be a string'),
      v.transform(input => parseInt(input, 10)),
      v.number('Limit must be a number'),
      v.integer('Limit must be an integer'),
      v.minValue(1, 'Limit must be at least 1'),
      v.maxValue(100, 'Limit must be at most 100')
    )
  )
});

// Sorting schema
export const sortingSchema = v.object({
  orderBy: v.optional(v.string('Order by must be a string')),
  orderDirection: v.optional(
    v.picklist(['asc', 'desc'], "Order direction must be 'asc' or 'desc'")
  )
});

// Search schema
export const searchSchema = v.object({
  search: v.optional(
    v.pipe(
      v.string('Search must be a string'),
      v.trim(),
      v.maxLength(255, 'Search term too long')
    )
  )
});
```

## Schema Generation from Database

Use Drizzle-Valibot to automatically generate schemas from database tables:

```javascript
// src/validation/schemas/users.js
import * as v from 'valibot';
import { createSelectSchema, createInsertSchema } from 'drizzle-valibot';
import { users } from '../../db/schema/users.js';

// Generate base schemas from database schema
export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);

// Customize generated schemas
export const userCreateSchema = v.omit(userInsertSchema, [
  'id',           // Exclude auto-generated fields
  'createdAt',
  'updatedAt'
]);

// Add custom validation
export const userCreateSchemaWithValidation = v.object({
  ...userCreateSchema.entries,
  email: v.pipe(
    v.string('Email must be a string'),
    v.trim(),
    v.toLowerCase(),
    v.email('Invalid email format'),
    v.maxLength(255, 'Email too long')
  ),
  password: v.pipe(
    v.string('Password must be a string'),
    v.minLength(8, 'Password must be at least 8 characters'),
    v.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
  )
});
```

## Entity-Specific Schemas

### User Validation Schemas

```javascript
// src/validation/schemas/users.js
import * as v from 'valibot';

// Create user schema
export const userCreateSchema = v.object({
  name: v.pipe(
    v.string('Name must be a string'),
    v.trim(),
    v.minLength(1, 'Name is required'),
    v.maxLength(255, 'Name must be 255 characters or less')
  ),
  email: v.pipe(
    v.string('Email must be a string'),
    v.trim(),
    v.toLowerCase(),
    v.email('Invalid email format'),
    v.maxLength(255, 'Email must be 255 characters or less')
  ),
  phone: v.pipe(
    v.string('Phone must be a string'),
    v.trim(),
    v.minLength(1, 'Phone is required'),
    v.maxLength(20, 'Phone must be 20 characters or less'),
    v.regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format')
  ),
  roleId: v.pipe(
    v.number('Role ID must be a number'),
    v.integer('Role ID must be an integer'),
    v.minValue(1, 'Role ID must be positive')
  ),
  password: v.pipe(
    v.string('Password must be a string'),
    v.minLength(8, 'Password must be at least 8 characters long'),
    v.maxLength(128, 'Password must be 128 characters or less'),
    v.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
  )
});

// Update user schema (partial)
export const userUpdateSchema = v.partial(
  v.omit(userCreateSchema, ['password'])
);

// Password update schema
export const userPasswordUpdateSchema = v.object({
  currentPassword: v.string('Current password is required'),
  newPassword: v.pipe(
    v.string('New password must be a string'),
    v.minLength(8, 'Password must be at least 8 characters long'),
    v.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
  ),
  confirmPassword: v.string('Password confirmation is required')
});

// Query parameters for user listing
export const userQuerySchema = v.object({
  ...paginationSchema.entries,
  ...sortingSchema.entries,
  ...searchSchema.entries,
  status: v.optional(
    v.picklist(['active', 'inactive', 'suspended'], 'Invalid status filter')
  ),
  roleId: v.optional(
    v.pipe(
      v.string('Role ID must be a string'),
      v.transform(input => parseInt(input, 10)),
      v.number('Role ID must be a number'),
      v.integer('Role ID must be an integer'),
      v.minValue(1, 'Role ID must be positive')
    )
  )
});
```

## Advanced Validation Patterns

### Custom Validation Functions

```javascript
// Custom validation for unique email
const uniqueEmailValidation = v.custom(
  async (email) => {
    const existingUser = await usersService.findByEmail(email);
    return !existingUser;
  },
  'Email already exists'
);

// Password confirmation validation
const passwordConfirmationSchema = v.pipe(
  v.object({
    password: v.string(),
    confirmPassword: v.string()
  }),
  v.forward(
    v.custom(
      (input) => input.password === input.confirmPassword,
      'Passwords do not match'
    ),
    ['confirmPassword']
  )
);
```

### Conditional Validation

```javascript
// Conditional required fields
const userRegistrationSchema = v.object({
  name: v.string(),
  email: v.string(),
  userType: v.picklist(['individual', 'business']),
  // Business name required only for business users
  businessName: v.optional(v.string()),
  // Tax ID required only for business users
  taxId: v.optional(v.string())
});

// Add conditional validation
const userRegistrationWithConditionalSchema = v.pipe(
  userRegistrationSchema,
  v.forward(
    v.custom(
      (input) => {
        if (input.userType === 'business') {
          return input.businessName && input.taxId;
        }
        return true;
      },
      'Business name and tax ID are required for business users'
    ),
    ['businessName']
  )
);
```

### Array Validation

```javascript
// Validate array of items
export const bulkUserCreateSchema = v.object({
  users: v.pipe(
    v.array(userCreateSchema, 'Users must be an array'),
    v.minLength(1, 'At least one user is required'),
    v.maxLength(100, 'Maximum 100 users allowed per bulk operation')
  )
});

// Validate array with unique constraints
const uniqueEmailsSchema = v.pipe(
  v.array(v.string()),
  v.custom(
    (emails) => {
      const uniqueEmails = new Set(emails);
      return uniqueEmails.size === emails.length;
    },
    'Duplicate emails not allowed'
  )
);
```

## Schema Composition

### Combining Schemas

```javascript
// Base address schema
const addressSchema = v.object({
  street: v.string('Street is required'),
  city: v.string('City is required'),
  state: v.string('State is required'),
  zipCode: v.string('ZIP code is required'),
  country: v.string('Country is required')
});

// User with address
const userWithAddressSchema = v.object({
  ...userCreateSchema.entries,
  address: addressSchema,
  billingAddress: v.optional(addressSchema)
});

// Extend schemas
const adminUserSchema = v.object({
  ...userCreateSchema.entries,
  permissions: v.array(v.string()),
  departmentId: v.number()
});
```

### Schema Utilities

```javascript
// Create reusable field validators
const createStringField = (name, options = {}) => {
  const {
    required = true,
    minLength = 1,
    maxLength = 255,
    pattern,
    transform = true
  } = options;
  
  let schema = v.string(`${name} must be a string`);
  
  if (transform) {
    schema = v.pipe(schema, v.trim());
  }
  
  if (required && minLength > 0) {
    schema = v.pipe(schema, v.minLength(minLength, `${name} is required`));
  }
  
  if (maxLength) {
    schema = v.pipe(schema, v.maxLength(maxLength, `${name} too long`));
  }
  
  if (pattern) {
    schema = v.pipe(schema, v.regex(pattern, `Invalid ${name} format`));
  }
  
  return required ? schema : v.optional(schema);
};

// Usage
const productSchema = v.object({
  name: createStringField('Product name', { maxLength: 100 }),
  description: createStringField('Description', { 
    required: false, 
    maxLength: 1000 
  }),
  sku: createStringField('SKU', { 
    pattern: /^[A-Z0-9-]+$/,
    maxLength: 50 
  })
});
```

## Error Handling

### Validation Error Format

```javascript
// Valibot error structure
{
  success: false,
  error: 'Validation Error',
  message: 'Invalid request data',
  details: [
    {
      path: ['name'],
      message: 'Name is required'
    },
    {
      path: ['email'],
      message: 'Invalid email format'
    }
  ]
}
```

### Custom Error Messages

```javascript
// Localized error messages
const errorMessages = {
  en: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {min} characters',
    maxLength: 'Must be no more than {max} characters'
  },
  es: {
    required: 'Este campo es obligatorio',
    email: 'Por favor ingrese un email válido',
    minLength: 'Debe tener al menos {min} caracteres',
    maxLength: 'No debe tener más de {max} caracteres'
  }
};

// Create localized schema
const createLocalizedSchema = (locale = 'en') => {
  const messages = errorMessages[locale];
  
  return v.object({
    email: v.pipe(
      v.string(messages.required),
      v.email(messages.email)
    ),
    name: v.pipe(
      v.string(messages.required),
      v.minLength(1, messages.required),
      v.maxLength(100, messages.maxLength.replace('{max}', '100'))
    )
  });
};
```

## Testing Validation Schemas

```javascript
// tests/unit/validation/schemas/users.test.js
import { describe, test, expect } from '@jest/globals';
import * as v from 'valibot';
import { userCreateSchema } from '../../../src/validation/schemas/users.js';

describe('User Validation Schemas', () => {
  describe('userCreateSchema', () => {
    test('should validate valid user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        roleId: 1,
        password: 'SecurePass123!'
      };
      
      const result = v.safeParse(userCreateSchema, validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.output.email).toBe('john@example.com');
        expect(result.output.name).toBe('John Doe');
      }
    });
    
    test('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+1234567890',
        roleId: 1,
        password: 'SecurePass123!'
      };
      
      const result = v.safeParse(userCreateSchema, invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.issues.some(issue => 
          issue.path?.[0]?.key === 'email'
        )).toBe(true);
      }
    });
    
    test('should transform email to lowercase', () => {
      const data = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        phone: '+1234567890',
        roleId: 1,
        password: 'SecurePass123!'
      };
      
      const result = v.safeParse(userCreateSchema, data);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.output.email).toBe('john@example.com');
      }
    });
  });
});
```

## Best Practices

1. **Consistent Error Messages**: Use clear, user-friendly error messages
2. **Data Transformation**: Use `v.pipe()` with `v.trim()`, `v.toLowerCase()` etc.
3. **Reusable Schemas**: Create common schemas for repeated patterns
4. **Schema Composition**: Build complex schemas from simpler ones
5. **Type Safety**: Leverage TypeScript for better development experience
6. **Performance**: Use `v.safeParse()` for better error handling
7. **Testing**: Write comprehensive tests for all validation scenarios
8. **Documentation**: Document complex validation rules and business logic
