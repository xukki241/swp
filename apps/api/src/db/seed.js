import { db } from "./connection.js";
import { roles } from "./schema/index.js";

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Check if roles already exist
    const existingRoles = await db.select().from(roles);

    if (existingRoles.length === 0) {
      console.log("Seeding default roles...");

      // Insert default roles
      const defaultRoles = [
        { name: "Admin" },
        { name: "Manager" },
        { name: "Pharmacist" },
        { name: "Technician" },
        { name: "Cashier" },
      ];

      for (const role of defaultRoles) {
        await db.insert(roles).values(role);
      }

      console.log("Default roles seeded successfully");
    } else {
      console.log("Roles already exist, skipping role seeding");
    }

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding process failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };
