import { crudServiceFactory } from "../common/index.js";
import { users, userCredentials } from "../db/schema/index.js";
import { db } from "../db/connection.js";
import {
  createUserSchema,
  updateUserSchema,
  selectUserSchema,
} from "../validation/schemas/users.js";
import bcrypt from "bcrypt";

// Password hashing utility
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Hook to validate and hash password before creating user
const beforeCreate = async (data) => {
  try {
    // Validate data using Zod schema
    const validatedData = createUserSchema.parse(data);

    // Remove password from user data (will be stored separately)
    const { password, ...userData } = validatedData;

    return userData;
  } catch (error) {
    // Re-throw validation errors
    throw error;
  }
};

// Hook to create user credentials after user creation
const afterCreate = async (createdUser, originalData) => {
  try {
    // If password was provided in original data, create credentials
    if (originalData.password) {
      const hashedPassword = await hashPassword(originalData.password);

      await db.insert(userCredentials).values({
        userId: createdUser.id,
        provider: "local",
        identifier: createdUser.email,
        secretHash: hashedPassword,
      });
    }
  } catch (error) {
    console.error("Error creating user credentials:", error);
    // Note: In production, you might want to delete the user if credentials creation fails
    throw error;
  }
};

// Hook to validate and hash password before updating user
const beforeUpdate = async (id, data) => {
  try {
    // Validate data using Zod schema (partial update)
    const validatedData = updateUserSchema.parse(data);

    // Remove password from user data (will be handled separately)
    const { password, ...userData } = validatedData;

    return userData;
  } catch (error) {
    // Re-throw validation errors
    throw error;
  }
};

// Create user service with password hashing support
const userService = crudServiceFactory(users, {
  entityName: "User",
  searchableFields: ["name", "email", "phone"],
  defaultOrderBy: "name",
  defaultOrderDirection: "asc",
  beforeCreate,
  afterCreate,
  beforeUpdate,
});

// Add password verification method
userService.verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export default userService;
