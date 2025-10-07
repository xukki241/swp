// Example usage of the validation schemas
import {
  createUserSchema,
  updateUserSchema,
  userSchema,
  createMedicationSchema,
  createCustomerSchema,
  salesOrderSchema,
  userRoleSchema,
  positiveDecimalSchema,
} from "./index.js";

// Example: Validate user creation
console.log("=== Testing User Creation ===");
try {
  const newUser = createUserSchema.parse({
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    address: "123 Main St",
    role: "staff",
    status: "active",
  });
  console.log("✓ Valid user:", newUser);
} catch (error) {
  console.error("✗ Validation error:", error.errors);
}

// Example: Invalid phone number
console.log("\n=== Testing Invalid Phone ===");
try {
  const invalidUser = createUserSchema.parse({
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "123", // Invalid: not 10 digits
    role: "staff",
  });
  console.log("✓ Valid user:", invalidUser);
} catch (error) {
  console.error("✗ Expected validation error:", error.errors[0].message);
}

// Example: Validate partial update
console.log("\n=== Testing User Update (Partial) ===");
try {
  const updatedUser = updateUserSchema.parse({
    name: "John Smith",
  });
  console.log("✓ Valid partial update:", updatedUser);
} catch (error) {
  console.error("✗ Validation error:", error.errors);
}

// Example: Validate medication
console.log("\n=== Testing Medication Creation ===");
try {
  const newMedication = createMedicationSchema.parse({
    name: "Aspirin",
    brand: "Bayer",
    description: "Pain reliever",
    isPrescriptionRequired: false,
    isControlledSubstance: false,
    status: "active",
  });
  console.log("✓ Valid medication:", newMedication);
} catch (error) {
  console.error("✗ Validation error:", error.errors);
}

// Example: Validate decimal
console.log("\n=== Testing Decimal Validation ===");
try {
  const price1 = positiveDecimalSchema.parse("99.99");
  console.log("✓ Valid price (string):", price1);

  const price2 = positiveDecimalSchema.parse(149.99);
  console.log("✓ Valid price (number):", price2);

  const invalidPrice = positiveDecimalSchema.parse(-10);
} catch (error) {
  console.error(
    "✗ Expected error for negative price:",
    error.errors[0].message
  );
}

// Example: Validate enum
console.log("\n=== Testing Enum Validation ===");
try {
  const role1 = userRoleSchema.parse("staff");
  console.log("✓ Valid role:", role1);

  const role2 = userRoleSchema.parse("admin"); // Invalid
} catch (error) {
  console.error("✗ Expected error for invalid role:", error.errors[0].message);
}

console.log("\n=== All validation tests completed ===");
