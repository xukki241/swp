/* eslint-disable no-console */
/**
 * Database Seeding Script
 *
 * This script populates the database with realistic fake data for development and testing.
 *
 * Usage:
 *   pnpm db:seed              # Use default behavior (clear DB based on SEED_CONFIG.clearBeforeSeed)
 *   pnpm db:seed -- --clear   # Force clear database before seeding
 *   pnpm db:seed -- --no-clear # Skip clearing, append data to existing records
 *
 * Configuration:
 *   Adjust SEED_CONFIG object below to control the amount of data generated.
 *
 * Default Credentials:
 *   Email: owner@pharmaflow.com
 *   Password: password123
 */
import "dotenv/config";

import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

import { db } from "./connection.js";
import * as schema from "./schema/index.js";

/**
 * Seed configuration
 * Adjust these numbers to control the amount of data generated
 */
const SEED_CONFIG = {
  users: 20,
  customers: 50,
  suppliers: 15,
  medications: 100,
  medicationVariants: 200,
  warehouseZones: 5,
  warehouseRacks: 20,
  warehouseBins: 100,
  purchaseOrders: 30,
  salesOrders: 50,
  shifts: 3,
  clearBeforeSeed: true,
};

/**
 * Helper function to generate random array elements
 */
function randomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Helper function to generate random element from array
 */
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Define seed data for Users
 */
function defineUsers(count = SEED_CONFIG.users) {
  const users = [];

  // Create owner user
  users.push({
    name: "Quản Trị Viên",
    email: "owner@pharmaflow.com",
    phone: "0901234567",
    address: faker.location.streetAddress({ useFullAddress: true }),
    status: "active",
    role: "owner",
  });

  // Create staff users
  for (let i = 0; i < count - 1; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: `09${faker.string.numeric(8)}`,
      address: faker.location.streetAddress({ useFullAddress: true }),
      status: randomElement(["active", "active", "active", "inactive"]), // 75% active
      role: "staff",
    });
  }

  return users;
}

/**
 * Define seed data for User Credentials
 */
async function defineUserCredentials(users) {
  const credentials = [];
  const defaultPassword = await bcrypt.hash("password123", 10);

  for (const user of users) {
    credentials.push({
      userId: user.id,
      provider: "local",
      identifier: user.email, // Using email as identifier for local auth
      secret: defaultPassword,
    });
  }

  return credentials;
}

/**
 * Define seed data for Customers
 */
function defineCustomers(count = SEED_CONFIG.customers) {
  const customers = [];

  for (let i = 0; i < count; i++) {
    customers.push({
      name: faker.person.fullName(),
      email: Math.random() > 0.3 ? faker.internet.email().toLowerCase() : null,
      phone: `09${faker.string.numeric(8)}`,
      address: faker.location.streetAddress({ useFullAddress: true }),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
      notes: Math.random() > 0.7 ? faker.lorem.sentence() : null,
    });
  }

  return customers;
}

/**
 * Define seed data for Suppliers
 */
function defineSuppliers(count = SEED_CONFIG.suppliers) {
  const suppliers = [];

  for (let i = 0; i < count; i++) {
    suppliers.push({
      name: faker.company.name(),
      email: faker.internet.email({ provider: "supplier.com" }).toLowerCase(),
      phone: `09${faker.string.numeric(8)}`,
      address: faker.location.streetAddress({ useFullAddress: true }),
      status: randomElement(["active", "active", "active", "inactive"]), // 75% active
      notes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
    });
  }

  return suppliers;
}

/**
 * Define seed data for Medications
 */
function defineMedications(count = SEED_CONFIG.medications) {
  const medications = [];

  const medicationNames = [
    "Paracetamol",
    "Ibuprofen",
    "Amoxicillin",
    "Aspirin",
    "Omeprazole",
    "Metformin",
    "Lisinopril",
    "Atorvastatin",
    "Levothyroxine",
    "Albuterol",
    "Gabapentin",
    "Losartan",
    "Simvastatin",
    "Clopidogrel",
    "Montelukast",
    "Ciprofloxacin",
    "Doxycycline",
    "Prednisone",
    "Furosemide",
    "Vitamin D3",
    "Cefixime",
    "Mefenamic Acid",
    "Loperamide",
    "Cetirizine",
    "Salbutamol",
  ];

  const brands = [
    "Traphaco",
    "Domesco",
    "DHG Pharma",
    "Imexpharm",
    "Hau Giang Pharma",
    "Pymepharco",
    "OPC Pharma",
    "Saigon Pharma",
    "Vidipha",
    "Danapha",
  ];

  for (let i = 0; i < count; i++) {
    const baseName = randomElement(medicationNames);
    const variant =
      Math.random() > 0.5
        ? ` ${faker.number.int({ min: 100, max: 1000 })}mg`
        : "";

    medications.push({
      name: `${baseName}${variant}`,
      brand: randomElement(brands),
      description: faker.lorem.paragraph(),
      isPrescriptionRequired: Math.random() > 0.6, // 40% require prescription
      isControlledSubstance: Math.random() > 0.85, // 15% controlled substance
      status: randomElement(["active", "active", "active", "inactive"]), // 75% active
    });
  }

  return medications;
}

/**
 * Define seed data for Medication Variants
 */
function defineMedicationVariants(
  medications,
  count = SEED_CONFIG.medicationVariants
) {
  const variants = [];

  const dosageForms = [
    "viên nén", // tablet
    "viên nang", // capsule
    "siro", // syrup
    "tiêm", // injection
    "kem bôi", // cream
    "thuốc mỡ", // ointment
  ];
  const strengths = [
    "50mg",
    "100mg",
    "250mg",
    "500mg",
    "1000mg",
    "10ml",
    "20ml",
    "50ml",
  ];

  for (let i = 0; i < count; i++) {
    const medication = randomElement(medications);
    const sku = `TH-${faker.string.alphanumeric(8).toUpperCase()}`;
    const barcode = faker.string.numeric(13);
    const dosageForm = randomElement(dosageForms);
    const strength = randomElement(strengths);

    variants.push({
      medicationId: medication.id,
      sku,
      name: `${dosageForm} ${strength}`,
      unit: dosageForm,
      unitFactor: 1.0,
      barcode,
      sellPrice: parseFloat(
        faker.commerce.price({ min: 10000, max: 500000, dec: 0 })
      ), // VND - increased minimum
      isActive: Math.random() > 0.1, // 90% active
      isForSale: Math.random() > 0.2, // 80% for sale
    });
  }

  return variants;
}

/**
 * Define seed data for Warehouse Zones
 */
function defineWarehouseZones(count = SEED_CONFIG.warehouseZones) {
  const zones = [];
  const zoneTypes = ["normal", "cold", "hazard", "quarantine"];

  for (let i = 0; i < count; i++) {
    zones.push({
      code: `KHU-${String(i + 1).padStart(2, "0")}`,
      name: `${randomElement(["Bắc", "Nam", "Đông", "Tây", "Trung Tâm"])} Khu ${i + 1}`,
      type: randomElement(zoneTypes),
      description: faker.lorem.sentence(),
    });
  }

  return zones;
}

/**
 * Define seed data for Warehouse Racks
 */
function defineWarehouseRacks(zones, count = SEED_CONFIG.warehouseRacks) {
  const racks = [];

  for (let i = 0; i < count; i++) {
    const zone = randomElement(zones);
    racks.push({
      zoneId: zone.id,
      code: `${zone.code}-K${String(i + 1).padStart(2, "0")}`,
      name: `Kệ ${i + 1}`,
    });
  }

  return racks;
}

/**
 * Define seed data for Warehouse Bins
 */
function defineWarehouseBins(racks, count = SEED_CONFIG.warehouseBins) {
  const bins = [];

  for (let i = 0; i < count; i++) {
    const rack = randomElement(racks);
    const level = faker.number.int({ min: 1, max: 5 });
    const number = i + 1;

    bins.push({
      rackId: rack.id,
      code: `${rack.code}-H${String(number).padStart(3, "0")}`,
      name: `Hộp ${number}`,
      level,
      number,
      description: `Tầng ${level} - Hộp ${number}`,
    });
  }

  return bins;
}

/**
 * Define seed data for Inventory
 * Note: This will be populated after purchase order receipts are created
 */
function defineInventory(
  purchaseOrderReceiptItems,
  purchaseOrderItems,
  supplierMedicationVariants,
  bins
) {
  const inventory = [];

  for (const receiptItem of purchaseOrderReceiptItems) {
    // Find the purchase order item
    const orderItem = purchaseOrderItems.find(
      (item) => item.id === receiptItem.purchaseOrderItemId
    );
    if (!orderItem) {
      continue;
    }

    // Find the supplier medication variant
    const supplierVariant = supplierMedicationVariants.find(
      (sv) => sv.id === orderItem.supplierMedicationVariantId
    );
    if (!supplierVariant) {
      continue;
    }

    const bin = randomElement(bins);

    inventory.push({
      medicationVariantId: supplierVariant.medicationVariantId,
      purchaseOrderReceiptItemsId: receiptItem.id,
      binId: bin.id,
      quantity: receiptItem.quantity,
      batchNumber: `BATCH-${faker.string.alphanumeric(8).toUpperCase()}`,
      manufactureDate: faker.date.past({ years: 1 }),
      expiryDate: faker.date.future({ years: 2 }),
    });
  }

  return inventory;
}

/**
 * Define seed data for Shifts
 */
function defineShifts() {
  return [
    {
      name: "Ca Sáng",
      shiftType: "morning",
      startTime: "06:00:00",
      endTime: "14:00:00",
      description: "Ca làm việc buổi sáng",
    },
    {
      name: "Ca Chiều",
      shiftType: "afternoon",
      startTime: "14:00:00",
      endTime: "22:00:00",
      description: "Ca làm việc buổi chiều",
    },
    {
      name: "Ca Tối",
      shiftType: "night",
      startTime: "22:00:00",
      endTime: "06:00:00",
      description: "Ca làm việc buổi tối",
    },
    {
      name: "Ca Full",
      shiftType: "full_day",
      startTime: "08:00:00",
      endTime: "17:00:00",
      description: "Ca làm việc toàn thời gian",
    },
  ];
}

/**
 * Define seed data for Shift Assignments
 */
function defineShiftAssignments(users, shifts) {
  const assignments = [];
  const staffUsers = users.filter((u) => u.role === "staff");
  const assignmentMap = new Map(); // Track assignments by user+date

  for (const user of staffUsers) {
    // Create assignments for the next 7 days
    for (let i = 0; i < 7; i++) {
      const assignedDate = new Date();
      assignedDate.setDate(assignedDate.getDate() + i);
      assignedDate.setHours(0, 0, 0, 0); // Normalize to start of day

      const key = `${user.id}-${assignedDate.toISOString()}`;
      if (!assignmentMap.has(key)) {
        // Randomly assign a shift
        const shift = randomElement(shifts);
        assignments.push({
          userId: user.id,
          shiftId: shift.id,
          assignedDate,
          status: "scheduled",
        });
        assignmentMap.set(key, true);
      }
    }
  }

  return assignments;
}

/**
 * Define seed data for Purchase Orders
 */
function definePurchaseOrders(
  suppliers,
  users,
  count = SEED_CONFIG.purchaseOrders
) {
  const orders = [];
  const statuses = ["pending", "ordered", "received", "cancelled"];

  for (let i = 0; i < count; i++) {
    orders.push({
      supplierId: randomElement(suppliers).id,
      createdBy: randomElement(users).id,
      orderDate: faker.date.past({ years: 1 }),
      expectedDate: faker.date.future({ years: 0.5 }),
      status: randomElement(statuses),
    });
  }

  return orders;
}

/**
 * Define seed data for Purchase Order Items
 */
function definePurchaseOrderItems(purchaseOrders, supplierMedicationVariants) {
  const items = [];

  for (const order of purchaseOrders) {
    // Each order has 2-10 items
    const numItems = faker.number.int({ min: 2, max: 10 });
    const selectedVariants = randomElements(
      supplierMedicationVariants,
      numItems
    );

    for (const supplierVariant of selectedVariants) {
      const quantity = faker.number.int({ min: 10, max: 500 });
      const unitPrice = parseFloat(supplierVariant.purchasePrice);
      items.push({
        purchaseOrderId: order.id,
        supplierMedicationVariantId: supplierVariant.id,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      });
    }
  }

  return items;
}

/**
 * Define seed data for Sales Orders
 */
function defineSalesOrders(customers, users, count = SEED_CONFIG.salesOrders) {
  const orders = [];
  const statuses = ["pending", "paid", "cancelled"];
  const paymentMethods = [
    "cash",
    "bank_transfer",
    "credit_card",
    "mobile_payment",
  ];

  for (let i = 0; i < count; i++) {
    orders.push({
      customerId: randomElement(customers).id,
      salespersonId: randomElement(users).id,
      orderDate: faker.date.past({ years: 1 }),
      status: randomElement(statuses),
      paymentMethod: randomElement(paymentMethods),
      notes: Math.random() > 0.7 ? faker.lorem.sentence() : null,
    });
  }

  return orders;
}

/**
 * Define seed data for Purchase Order Receipts
 */
function definePurchaseOrderReceipts(purchaseOrders, users) {
  const receipts = [];

  // Create receipts for orders with status "received"
  const receivedOrders = purchaseOrders.filter(
    (order) => order.status === "received"
  );

  for (const order of receivedOrders) {
    receipts.push({
      purchaseOrderId: order.id,
      receivedDate: faker.date.between({
        from: order.orderDate,
        to: new Date(),
      }),
      receivedBy: randomElement(users).id,
    });
  }

  return receipts;
}

/**
 * Define seed data for Purchase Order Receipt Items
 */
function definePurchaseOrderReceiptItems(
  purchaseOrderReceipts,
  purchaseOrderItems
) {
  const receiptItems = [];

  for (const receipt of purchaseOrderReceipts) {
    // Get all items for this purchase order
    const orderItems = purchaseOrderItems.filter(
      (item) => item.purchaseOrderId === receipt.purchaseOrderId
    );

    for (const orderItem of orderItems) {
      // Receive 80-100% of the ordered quantity
      const receivedQuantity = Math.floor(
        orderItem.quantity * faker.number.float({ min: 0.8, max: 1.0 })
      );

      receiptItems.push({
        purchaseOrderReceiptId: receipt.id,
        purchaseOrderItemId: orderItem.id,
        quantity: receivedQuantity,
      });
    }
  }

  return receiptItems;
}

/**
 * Define seed data for Sales Order Items
 */
function defineSalesOrderItems(salesOrders, inventory) {
  const items = [];

  for (const order of salesOrders) {
    // Each order has 1-5 items
    const numItems = faker.number.int({ min: 1, max: 5 });
    const selectedInventory = randomElements(inventory, numItems);

    for (const inv of selectedInventory) {
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = parseFloat(
        faker.commerce.price({ min: 10000, max: 500000, dec: 0 })
      );
      items.push({
        salesOrderId: order.id,
        medicationVariantId: inv.medicationVariantId,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      });
    }
  }

  return items;
}

/**
 * Define seed data for Supplier Medication Variants
 */
function defineSupplierMedicationVariants(suppliers, medicationVariants) {
  const supplierVariants = [];

  // Each medication variant is supplied by 1-3 suppliers
  for (const variant of medicationVariants) {
    const numSuppliers = faker.number.int({ min: 1, max: 3 });
    const selectedSuppliers = randomElements(suppliers, numSuppliers);

    for (const supplier of selectedSuppliers) {
      const purchasePrice = parseFloat(
        faker.commerce.price({ min: 5000, max: 400000, dec: 0 })
      ); // VND - should be less than sell price
      supplierVariants.push({
        supplierId: supplier.id,
        medicationVariantId: variant.id,
        supplierSku: `SUP-${faker.string.alphanumeric(8).toUpperCase()}`,
        purchasePrice,
        leadTimeDays: faker.number.int({ min: 3, max: 30 }),
      });
    }
  }

  return supplierVariants;
}

/**
 * Clear all data from the database
 */
async function clearDatabase() {
  console.log("🧹 Clearing existing data...");
  // Delete in order respecting foreign key constraints
  await db.delete(schema.salesOrderItems);
  await db.delete(schema.salesOrders);
  await db.delete(schema.inventory); // Delete inventory first (references purchase_order_receipt_items)
  await db.delete(schema.purchaseOrderReceiptItems);
  await db.delete(schema.purchaseOrderReceipts);
  await db.delete(schema.purchaseOrderItems);
  await db.delete(schema.purchaseOrders);
  await db.delete(schema.supplierMedicationVariants);
  await db.delete(schema.warehouseBins);
  await db.delete(schema.warehouseRacks);
  await db.delete(schema.warehouseZones);
  await db.delete(schema.medicationVariants);
  await db.delete(schema.medications);
  await db.delete(schema.suppliers);
  await db.delete(schema.customers);
  await db.delete(schema.shiftAssignments);
  await db.delete(schema.shifts);
  await db.delete(schema.userCredentials);
  await db.delete(schema.users);
  console.log("✅ Database cleared");
}

/**
 * Main seed function
 */
async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Parse command line arguments
    const args = process.argv.slice(2);
    const clearArg = args.find(
      (arg) => arg === "--clear" || arg === "--no-clear"
    );
    const shouldClear = clearArg
      ? clearArg === "--clear"
      : SEED_CONFIG.clearBeforeSeed;

    // Clear existing data if requested
    if (shouldClear) {
      await clearDatabase();
    } else {
      console.log("⚠️  Skipping database clear - data will be appended");
    }

    // Seed Users
    console.log("👥 Seeding users...");
    const usersData = defineUsers();
    const users = await db.insert(schema.users).values(usersData).returning();
    console.log(`✅ Created ${users.length} users`);

    // Seed User Credentials
    console.log("🔐 Seeding user credentials...");
    const credentialsData = await defineUserCredentials(users);
    await db.insert(schema.userCredentials).values(credentialsData);
    console.log(`✅ Created ${credentialsData.length} user credentials`);

    // Seed Customers
    console.log("🛍️ Seeding customers...");
    const customersData = defineCustomers();
    const customers = await db
      .insert(schema.customers)
      .values(customersData)
      .returning();
    console.log(`✅ Created ${customers.length} customers`);

    // Seed Suppliers
    console.log("🏭 Seeding suppliers...");
    const suppliersData = defineSuppliers();
    const suppliers = await db
      .insert(schema.suppliers)
      .values(suppliersData)
      .returning();
    console.log(`✅ Created ${suppliers.length} suppliers`);

    // Seed Medications
    console.log("💊 Seeding medications...");
    const medicationsData = defineMedications();
    const medications = await db
      .insert(schema.medications)
      .values(medicationsData)
      .returning();
    console.log(`✅ Created ${medications.length} medications`);

    // Seed Medication Variants
    console.log("📦 Seeding medication variants...");
    const variantsData = defineMedicationVariants(medications);
    const variants = await db
      .insert(schema.medicationVariants)
      .values(variantsData)
      .returning();
    console.log(`✅ Created ${variants.length} medication variants`);

    // Seed Warehouse Zones
    console.log("🏢 Seeding warehouse zones...");
    const zonesData = defineWarehouseZones();
    const zones = await db
      .insert(schema.warehouseZones)
      .values(zonesData)
      .returning();
    console.log(`✅ Created ${zones.length} warehouse zones`);

    // Seed Warehouse Racks
    console.log("📚 Seeding warehouse racks...");
    const racksData = defineWarehouseRacks(zones);
    const racks = await db
      .insert(schema.warehouseRacks)
      .values(racksData)
      .returning();
    console.log(`✅ Created ${racks.length} warehouse racks`);

    // Seed Warehouse Bins
    console.log("📥 Seeding warehouse bins...");
    const binsData = defineWarehouseBins(racks);
    const bins = await db
      .insert(schema.warehouseBins)
      .values(binsData)
      .returning();
    console.log(`✅ Created ${bins.length} warehouse bins`);

    // Seed Supplier Medication Variants (needed before purchase orders)
    console.log("� Seeding supplier medication variants...");
    const supplierVariantsData = defineSupplierMedicationVariants(
      suppliers,
      variants
    );
    const supplierVariants = await db
      .insert(schema.supplierMedicationVariants)
      .values(supplierVariantsData)
      .returning();
    console.log(
      `✅ Created ${supplierVariants.length} supplier medication variants`
    );

    // Seed Shifts
    console.log("⏰ Seeding shifts...");
    const shiftsData = defineShifts();
    const shifts = await db
      .insert(schema.shifts)
      .values(shiftsData)
      .returning();
    console.log(`✅ Created ${shifts.length} shifts`);

    // Seed Shift Assignments
    console.log("📅 Seeding shift assignments...");
    const assignmentsData = defineShiftAssignments(users, shifts);
    await db.insert(schema.shiftAssignments).values(assignmentsData);
    console.log(`✅ Created ${assignmentsData.length} shift assignments`);

    // Seed Purchase Orders
    console.log("📝 Seeding purchase orders...");
    const purchaseOrdersData = definePurchaseOrders(suppliers, users);
    const purchaseOrders = await db
      .insert(schema.purchaseOrders)
      .values(purchaseOrdersData)
      .returning();
    console.log(`✅ Created ${purchaseOrders.length} purchase orders`);

    // Seed Purchase Order Items
    console.log("📋 Seeding purchase order items...");
    const poItemsData = definePurchaseOrderItems(
      purchaseOrders,
      supplierVariants
    );
    const purchaseOrderItems = await db
      .insert(schema.purchaseOrderItems)
      .values(poItemsData)
      .returning();
    console.log(`✅ Created ${purchaseOrderItems.length} purchase order items`);

    // Seed Purchase Order Receipts
    console.log("📦 Seeding purchase order receipts...");
    const receiptsData = definePurchaseOrderReceipts(purchaseOrders, users);
    const receipts = await db
      .insert(schema.purchaseOrderReceipts)
      .values(receiptsData)
      .returning();
    console.log(`✅ Created ${receipts.length} purchase order receipts`);

    // Seed Purchase Order Receipt Items
    console.log("📝 Seeding purchase order receipt items...");
    const receiptItemsData = definePurchaseOrderReceiptItems(
      receipts,
      purchaseOrderItems
    );
    const receiptItems = await db
      .insert(schema.purchaseOrderReceiptItems)
      .values(receiptItemsData)
      .returning();
    console.log(`✅ Created ${receiptItems.length} receipt items`);

    // Seed Inventory (depends on receipt items)
    console.log("📊 Seeding inventory...");
    const inventoryData = defineInventory(
      receiptItems,
      purchaseOrderItems,
      supplierVariants,
      bins
    );
    const inventory = await db
      .insert(schema.inventory)
      .values(inventoryData)
      .returning();
    console.log(`✅ Created ${inventory.length} inventory records`);

    // Seed Sales Orders
    console.log("🛒 Seeding sales orders...");
    const salesOrdersData = defineSalesOrders(customers, users);
    const salesOrders = await db
      .insert(schema.salesOrders)
      .values(salesOrdersData)
      .returning();
    console.log(`✅ Created ${salesOrders.length} sales orders`);

    // Seed Sales Order Items
    console.log("🧾 Seeding sales order items...");
    const soItemsData = defineSalesOrderItems(salesOrders, inventory);
    await db.insert(schema.salesOrderItems).values(soItemsData);
    console.log(`✅ Created ${soItemsData.length} sales order items`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n� Summary:");
    console.log(`   Users: ${users.length}`);
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Suppliers: ${suppliers.length}`);
    console.log(`   Medications: ${medications.length}`);
    console.log(`   Medication Variants: ${variants.length}`);
    console.log(`   Supplier Medication Variants: ${supplierVariants.length}`);
    console.log(`   Warehouse Zones: ${zones.length}`);
    console.log(`   Warehouse Racks: ${racks.length}`);
    console.log(`   Warehouse Bins: ${bins.length}`);
    console.log(`   Purchase Orders: ${purchaseOrders.length}`);
    console.log(`   Purchase Order Items: ${purchaseOrderItems.length}`);
    console.log(`   Purchase Order Receipts: ${receipts.length}`);
    console.log(`   Purchase Order Receipt Items: ${receiptItems.length}`);
    console.log(`   Inventory Records: ${inventory.length}`);
    console.log(`   Sales Orders: ${salesOrders.length}`);
    console.log(`   Sales Order Items: ${soItemsData.length}`);
    console.log("\n🔑 Default credentials:");
    console.log("   Email: owner@pharmaflow.com");
    console.log("   Password: password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }

  // eslint-disable-next-line n/no-process-exit
  process.exit(0);
}

// Run the seed function
seed();
