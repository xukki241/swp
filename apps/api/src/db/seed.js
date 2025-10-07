/* eslint-disable n/no-process-exit */

import { db } from "./connection.js";
import {
  users,
  userCredentials,
  userRegistrations,
  customers,
  suppliers,
  medications,
  medicationVariants,
  supplierMedicationVariants,
  warehouseZones,
  warehouseRacks,
  warehouseBins,
  purchaseOrders,
  purchaseOrderItems,
  purchaseOrderReceipts,
  purchaseOrderReceiptItems,
  inventory,
  salesOrders,
  salesOrderItems,
  files,
  fileAttachments,
  notifications,
  auditLogs,
  reports,
  settings,
} from "./schema/index.js";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in reverse dependency order)
    console.log("🧹 Clearing existing data...");
    await db.delete(auditLogs);
    await db.delete(notifications);
    await db.delete(fileAttachments);
    await db.delete(files);
    await db.delete(salesOrderItems);
    await db.delete(salesOrders);
    await db.delete(inventory);
    await db.delete(purchaseOrderReceiptItems);
    await db.delete(purchaseOrderReceipts);
    await db.delete(purchaseOrderItems);
    await db.delete(purchaseOrders);
    await db.delete(supplierMedicationVariants);
    await db.delete(medicationVariants);
    await db.delete(medications);
    await db.delete(warehouseBins);
    await db.delete(warehouseRacks);
    await db.delete(warehouseZones);
    await db.delete(suppliers);
    await db.delete(customers);
    await db.delete(userCredentials);
    await db.delete(userRegistrations);
    await db.delete(users);
    await db.delete(reports);
    await db.delete(settings);

    // 1. Seed Users
    console.log("👥 Seeding users...");
    const [owner, staff1, staff2] = await db
      .insert(users)
      .values([
        {
          name: "John Doe",
          email: "owner@pharmacy.com",
          phone: "0123456789",
          address: "123 Main St, City Center",
          status: "active",
          role: "owner",
        },
        {
          name: "Jane Smith",
          email: "jane@pharmacy.com",
          phone: "0987654321",
          address: "456 Oak Ave, Downtown",
          status: "active",
          role: "staff",
        },
        {
          name: "Mike Johnson",
          email: "mike@pharmacy.com",
          phone: "0555123456",
          address: "789 Pine St, Uptown",
          status: "active",
          role: "staff",
        },
      ])
      .returning();

    // 2. Seed User Credentials
    console.log("🔐 Seeding user credentials...");
    await db.insert(userCredentials).values([
      {
        userId: owner.id,
        provider: "local",
        identifier: "owner@pharmacy.com",
        secret: "$2b$10$example.hashed.password.owner",
      },
      {
        userId: staff1.id,
        provider: "local",
        identifier: "jane@pharmacy.com",
        secret: "$2b$10$example.hashed.password.jane",
      },
      {
        userId: staff2.id,
        provider: "local",
        identifier: "mike@pharmacy.com",
        secret: "$2b$10$example.hashed.password.mike",
      },
    ]);

    // 3. Seed User Registrations
    console.log("📝 Seeding user registrations...");
    await db.insert(userRegistrations).values([
      {
        name: "Alice Brown",
        email: "alice@example.com",
        phone: "0111222333",
        address: "321 Elm St, Suburb",
        password: "$2b$10$example.hashed.password.alice",
        status: "pending",
      },
      {
        name: "Bob Wilson",
        email: "bob@example.com",
        phone: "0444555666",
        address: "654 Maple Dr, Village",
        password: "$2b$10$example.hashed.password.bob",
        status: "approved",
      },
    ]);

    // 4. Seed Customers
    console.log("🛍️ Seeding customers...");
    const [customer1, customer2, customer3] = await db
      .insert(customers)
      .values([
        {
          name: "Sarah Connor",
          email: "sarah@customer.com",
          phone: "0777888999",
          address: "147 Future St, Tech City",
        },
        {
          name: "Peter Parker",
          email: "peter@customer.com",
          phone: "0333444555",
          address: "20 Spider Lane, New York",
        },
        {
          name: "Diana Prince",
          email: "diana@customer.com",
          phone: "0666777888",
          address: "1 Wonder Ave, Paradise Island",
        },
      ])
      .returning();

    // 5. Seed Suppliers
    console.log("🏭 Seeding suppliers...");
    const [supplier1, supplier2, supplier3] = await db
      .insert(suppliers)
      .values([
        {
          name: "PharmaCorp International",
          contactName: "David Lee",
          email: "contact@pharmacorp.com",
          phone: "0200300400",
          address: "500 Industrial Blvd, Manufacturing District",
          status: "active",
        },
        {
          name: "MediSupply Ltd",
          contactName: "Lisa Wang",
          email: "orders@medisupply.com",
          phone: "0201302403",
          address: "301 Supply Chain Ave, Logistics Hub",
          status: "active",
        },
        {
          name: "BioMed Solutions",
          contactName: "Robert Chen",
          email: "sales@biomed.com",
          phone: "0202304405",
          address: "750 Research Parkway, Science City",
          status: "inactive",
        },
      ])
      .returning();

    // 6. Seed Medications
    console.log("💊 Seeding medications...");
    const [med1, med2, med3, med4, med5] = await db
      .insert(medications)
      .values([
        {
          name: "Paracetamol",
          brand: "Tylenol",
          description: "Pain reliever and fever reducer",
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Amoxicillin",
          brand: "Amoxil",
          description: "Antibiotic for bacterial infections",
          isPrescriptionRequired: true,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Ibuprofen",
          brand: "Advil",
          description: "Anti-inflammatory pain reliever",
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Omeprazole",
          brand: "Prilosec",
          description: "Proton pump inhibitor for acid reflux",
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Morphine",
          brand: "MS Contin",
          description: "Strong opioid pain medication",
          isPrescriptionRequired: true,
          isControlledSubstance: true,
          status: "active",
        },
      ])
      .returning();

    // 7. Seed Medication Variants
    console.log("🔬 Seeding medication variants...");
    const medicationVariantData = [
      // Paracetamol variants
      {
        medicationId: med1.id,
        sku: "PAR-500-TAB",
        name: "Paracetamol 500mg Tablets",
        unit: "tablet",
        unitFactor: "1.00",
        barcode: "1234567890001",
        sellPrice: "0.50",
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med1.id,
        sku: "PAR-250-SYR",
        name: "Paracetamol 250mg/5ml Syrup",
        unit: "ml",
        unitFactor: "5.00",
        barcode: "1234567890002",
        sellPrice: "0.10",
        isActive: true,
        isForSale: true,
      },
      // Amoxicillin variants
      {
        medicationId: med2.id,
        sku: "AMX-500-CAP",
        name: "Amoxicillin 500mg Capsules",
        unit: "capsule",
        unitFactor: "1.00",
        barcode: "1234567890003",
        sellPrice: "1.25",
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med2.id,
        sku: "AMX-250-SUS",
        name: "Amoxicillin 250mg/5ml Suspension",
        unit: "ml",
        unitFactor: "5.00",
        barcode: "1234567890004",
        sellPrice: "0.25",
        isActive: true,
        isForSale: true,
      },
      // Ibuprofen variants
      {
        medicationId: med3.id,
        sku: "IBU-400-TAB",
        name: "Ibuprofen 400mg Tablets",
        unit: "tablet",
        unitFactor: "1.00",
        barcode: "1234567890005",
        sellPrice: "0.75",
        isActive: true,
        isForSale: true,
      },
      // Omeprazole variants
      {
        medicationId: med4.id,
        sku: "OME-20-CAP",
        name: "Omeprazole 20mg Capsules",
        unit: "capsule",
        unitFactor: "1.00",
        barcode: "1234567890006",
        sellPrice: "1.50",
        isActive: true,
        isForSale: true,
      },
      // Morphine variants
      {
        medicationId: med5.id,
        sku: "MOR-10-TAB",
        name: "Morphine 10mg Tablets",
        unit: "tablet",
        unitFactor: "1.00",
        barcode: "1234567890007",
        sellPrice: "5.00",
        isActive: true,
        isForSale: false, // Controlled substance
      },
    ];

    const medicationVariantsResults = await db
      .insert(medicationVariants)
      .values(medicationVariantData)
      .returning();

    // 8. Seed Warehouse Zones
    console.log("🏪 Seeding warehouse zones...");
    const [zone1, zone2, zone3] = await db
      .insert(warehouseZones)
      .values([
        {
          code: "NORM-A",
          name: "Normal Storage Zone A",
          type: "normal",
          location: "Main Floor - Section A",
          description: "General medication storage area",
        },
        {
          code: "COLD-B",
          name: "Cold Storage Zone B",
          type: "cold",
          location: "Refrigerated Section - Floor 2",
          description:
            "Temperature controlled storage for vaccines and biologics",
        },
        {
          code: "CTRL-C",
          name: "Controlled Substances Zone C",
          type: "hazard",
          location: "Secure Vault - Basement",
          description: "High security area for controlled medications",
        },
      ])
      .returning();

    // 9. Seed Warehouse Racks
    console.log("🗄️ Seeding warehouse racks...");
    const [rack1, rack2, rack3, rack4] = await db
      .insert(warehouseRacks)
      .values([
        {
          zoneId: zone1.id,
          code: "R001",
          name: "Rack A1",
          description: "Main storage rack for tablets and capsules",
        },
        {
          zoneId: zone1.id,
          code: "R002",
          name: "Rack A2",
          description: "Storage rack for liquid medications",
        },
        {
          zoneId: zone2.id,
          code: "C001",
          name: "Cold Rack B1",
          description: "Refrigerated storage rack",
        },
        {
          zoneId: zone3.id,
          code: "S001",
          name: "Secure Rack C1",
          description: "High security rack for controlled substances",
        },
      ])
      .returning();

    // 10. Seed Warehouse Bins
    console.log("📦 Seeding warehouse bins...");
    const binData = [];

    // Create bins for each rack
    [rack1, rack2, rack3, rack4].forEach((rack, rackIndex) => {
      for (let level = 1; level <= 3; level++) {
        for (let number = 1; number <= 4; number++) {
          binData.push({
            rackId: rack.id,
            code: `${rack.code}-L${level}-${number.toString().padStart(2, "0")}`,
            name: `${rack.name} Level ${level} Bin ${number}`,
            level,
            number,
            description: `Storage bin at level ${level}, position ${number}`,
          });
        }
      }
    });

    const warehouseBinsResults = await db
      .insert(warehouseBins)
      .values(binData)
      .returning();

    // 11. Seed Supplier Medication Variants
    console.log("🤝 Seeding supplier medication variants...");
    const supplierMedicationVariantData = [];

    // Link suppliers with medication variants
    medicationVariantsResults.forEach((variant, index) => {
      const supplierId = [supplier1.id, supplier2.id][index % 2]; // Alternate between suppliers
      supplierMedicationVariantData.push({
        supplierId,
        medicationVariantId: variant.id,
        supplierSku: `SUP-${variant.sku}`,
        leadTimeDays: Math.floor(Math.random() * 14) + 7, // 7-20 days
      });
    });

    const supplierMedicationVariantsResults = await db
      .insert(supplierMedicationVariants)
      .values(supplierMedicationVariantData)
      .returning();

    // 12. Seed Purchase Orders
    console.log("📋 Seeding purchase orders...");
    const [po1, po2, po3] = await db
      .insert(purchaseOrders)
      .values([
        {
          supplierId: supplier1.id,
          orderDate: new Date("2024-01-15"),
          expectedDate: new Date("2024-01-29"),
          status: "received",
          totalAmount: "2500.00",
          createdBy: owner.id,
        },
        {
          supplierId: supplier2.id,
          orderDate: new Date("2024-02-01"),
          expectedDate: new Date("2024-02-15"),
          status: "ordered",
          totalAmount: "1800.50",
          createdBy: staff1.id,
        },
        {
          supplierId: supplier1.id,
          orderDate: new Date("2024-02-10"),
          expectedDate: new Date("2024-02-24"),
          status: "pending",
          totalAmount: "3200.75",
          createdBy: staff2.id,
        },
      ])
      .returning();

    // 13. Seed Purchase Order Items
    console.log("📦 Seeding purchase order items...");
    const purchaseOrderItemData = [
      // PO1 Items
      {
        purchaseOrderId: po1.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[0].id,
        quantity: 1000,
        unitPrice: "0.40",
        totalPrice: "400.00",
      },
      {
        purchaseOrderId: po1.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[2].id,
        quantity: 500,
        unitPrice: "1.00",
        totalPrice: "500.00",
      },
      {
        purchaseOrderId: po1.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[4].id,
        quantity: 800,
        unitPrice: "0.60",
        totalPrice: "480.00",
      },
      // PO2 Items
      {
        purchaseOrderId: po2.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[1].id,
        quantity: 200,
        unitPrice: "0.08",
        totalPrice: "16.00",
      },
      {
        purchaseOrderId: po2.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[3].id,
        quantity: 300,
        unitPrice: "0.20",
        totalPrice: "60.00",
      },
    ];

    const purchaseOrderItemsResults = await db
      .insert(purchaseOrderItems)
      .values(purchaseOrderItemData)
      .returning();

    // 14. Seed Purchase Order Receipts (for received orders)
    console.log("📥 Seeding purchase order receipts...");
    const [receipt1] = await db
      .insert(purchaseOrderReceipts)
      .values([
        {
          purchaseOrderId: po1.id,
          receivedDate: new Date("2024-01-30"),
          receivedBy: staff1.id,
        },
      ])
      .returning();

    // 15. Seed Purchase Order Receipt Items
    console.log("📋 Seeding purchase order receipt items...");
    const receiptItemData = purchaseOrderItemsResults
      .filter((item) => item.purchaseOrderId === po1.id)
      .map((item) => ({
        purchaseOrderReceiptId: receipt1.id,
        purchaseOrderItemId: item.id,
        quantity: item.quantity, // Full quantity received
      }));

    const receiptItemsResults = await db
      .insert(purchaseOrderReceiptItems)
      .values(receiptItemData)
      .returning();

    // 16. Seed Inventory
    console.log("📊 Seeding inventory...");
    const inventoryData = receiptItemsResults.map((receiptItem, index) => {
      const binIndex = index % warehouseBinsResults.length;
      const variant =
        medicationVariantsResults[index % medicationVariantsResults.length];

      return {
        medicationVariantId: variant.id,
        purchaseOrderReceiptItemsId: receiptItem.id,
        binId: warehouseBinsResults[binIndex].id,
        batchNumber: `BATCH-${Date.now()}-${index + 1}`,
        manufactureDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-01-01"),
        quantity: receiptItem.quantity.toString(),
        quantityReserved: "0",
      };
    });

    await db.insert(inventory).values(inventoryData);

    // 17. Seed Sales Orders
    console.log("💰 Seeding sales orders...");
    const [sale1, sale2, sale3] = await db
      .insert(salesOrders)
      .values([
        {
          customerId: customer1.id,
          orderDate: new Date("2024-02-05"),
          totalAmount: "45.50",
          status: "delivered",
          paymentMethod: "cash",
          salespersonId: staff1.id,
        },
        {
          customerId: customer2.id,
          orderDate: new Date("2024-02-08"),
          totalAmount: "78.25",
          status: "paid",
          paymentMethod: "credit_card",
          salespersonId: staff2.id,
        },
        {
          customerId: customer3.id,
          orderDate: new Date("2024-02-12"),
          totalAmount: "32.00",
          status: "pending",
          paymentMethod: "bank_transfer",
          salespersonId: staff1.id,
        },
      ])
      .returning();

    // 18. Seed Sales Order Items
    console.log("🛒 Seeding sales order items...");
    await db.insert(salesOrderItems).values([
      // Sale 1 items
      {
        salesOrderId: sale1.id,
        medicationVariantId: medicationVariantsResults[0].id, // Paracetamol 500mg
        quantity: 20,
        unitPrice: "0.50",
        totalPrice: "10.00",
      },
      {
        salesOrderId: sale1.id,
        medicationVariantId: medicationVariantsResults[4].id, // Ibuprofen 400mg
        quantity: 30,
        unitPrice: "0.75",
        totalPrice: "22.50",
      },
      // Sale 2 items
      {
        salesOrderId: sale2.id,
        medicationVariantId: medicationVariantsResults[2].id, // Amoxicillin 500mg
        quantity: 24,
        unitPrice: "1.25",
        totalPrice: "30.00",
      },
      {
        salesOrderId: sale2.id,
        medicationVariantId: medicationVariantsResults[5].id, // Omeprazole 20mg
        quantity: 14,
        unitPrice: "1.50",
        totalPrice: "21.00",
      },
      // Sale 3 items
      {
        salesOrderId: sale3.id,
        medicationVariantId: medicationVariantsResults[1].id, // Paracetamol Syrup
        quantity: 100, // 100ml
        unitPrice: "0.10",
        totalPrice: "10.00",
      },
    ]);

    // 19. Seed Files
    console.log("📁 Seeding files...");
    const [file1, file2] = await db
      .insert(files)
      .values([
        {
          filename: "supplier_contract_pharmacorp.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          fileSize: 2048576, // 2MB
          storagePath: "/uploads/contracts/supplier_contract_pharmacorp.pdf",
          uploadedBy: owner.id,
          uploadedAt: new Date("2024-01-01"),
        },
        {
          filename: "medication_certificate_amoxicillin.jpg",
          fileType: "jpg",
          mimeType: "image/jpeg",
          fileSize: 1024768, // 1MB
          storagePath:
            "/uploads/certificates/medication_certificate_amoxicillin.jpg",
          uploadedBy: staff1.id,
          uploadedAt: new Date("2024-01-15"),
        },
      ])
      .returning();

    // 20. Seed File Attachments
    console.log("🔗 Seeding file attachments...");
    await db.insert(fileAttachments).values([
      {
        fileId: file1.id,
        entityType: "supplier",
        entityId: supplier1.id,
      },
      {
        fileId: file2.id,
        entityType: "medication",
        entityId: med2.id,
      },
    ]);

    // 21. Seed Notifications
    console.log("🔔 Seeding notifications...");
    await db.insert(notifications).values([
      {
        userId: owner.id,
        message: "New purchase order #1 has been received and processed",
        isRead: true,
      },
      {
        userId: staff1.id,
        message:
          "Low stock alert: Paracetamol 500mg is below minimum threshold",
        isRead: false,
      },
      {
        userId: staff2.id,
        message: "Purchase order #2 has been confirmed by supplier",
        isRead: false,
      },
      {
        userId: owner.id,
        message: "Monthly sales report is ready for review",
        isRead: false,
      },
    ]);

    // 22. Seed Audit Logs
    console.log("📋 Seeding audit logs...");
    await db.insert(auditLogs).values([
      {
        userId: owner.id,
        action: "CREATE",
        entity: "purchase_order",
        entityId: po1.id,
        changes: {
          supplierId: supplier1.id,
          totalAmount: "2500.00",
          status: "pending",
        },
      },
      {
        userId: staff1.id,
        action: "UPDATE",
        entity: "purchase_order",
        entityId: po1.id,
        changes: {
          status: { from: "pending", to: "received" },
        },
      },
      {
        userId: staff1.id,
        action: "CREATE",
        entity: "sales_order",
        entityId: sale1.id,
        changes: {
          customerId: customer1.id,
          totalAmount: "45.50",
          status: "pending",
        },
      },
      {
        userId: staff2.id,
        action: "UPDATE",
        entity: "sales_order",
        entityId: sale1.id,
        changes: {
          status: { from: "pending", to: "delivered" },
        },
      },
    ]);

    // 23. Seed Reports
    console.log("📊 Seeding reports...");
    await db.insert(reports).values([
      {
        type: "inventory",
        reportDate: new Date("2024-02-01"),
        data: {
          totalItems: 5,
          totalValue: 2500.0,
          lowStockItems: 1,
          expiringSoon: 0,
        },
        parameters: {
          dateRange: "2024-01-01 to 2024-02-01",
          includeInactive: false,
        },
      },
      {
        type: "sales",
        reportDate: new Date("2024-02-15"),
        data: {
          totalSales: 3,
          totalRevenue: 155.75,
          topSellingMedication: "Paracetamol 500mg",
          averageOrderValue: 51.92,
        },
        parameters: {
          dateRange: "2024-02-01 to 2024-02-15",
          includeRefunds: false,
        },
      },
      {
        type: "purchase",
        reportDate: new Date("2024-02-10"),
        data: {
          totalOrders: 3,
          totalAmount: 7501.25,
          pendingOrders: 1,
          receivedOrders: 1,
        },
        parameters: {
          dateRange: "2024-01-01 to 2024-02-10",
          supplierId: null,
        },
      },
    ]);

    // 24. Seed Settings
    console.log("⚙️ Seeding settings...");
    await db.insert(settings).values([
      {
        key: "pharmacy_name",
        value: "Central Pharmacy",
        description: "Name of the pharmacy business",
      },
      {
        key: "pharmacy_address",
        value: "123 Healthcare Boulevard, Medical District, City 12345",
        description: "Physical address of the pharmacy",
      },
      {
        key: "pharmacy_phone",
        value: "0123-456-7890",
        description: "Main contact phone number",
      },
      {
        key: "pharmacy_email",
        value: "info@centralpharmacy.com",
        description: "Main contact email address",
      },
      {
        key: "low_stock_threshold",
        value: "50",
        description: "Minimum quantity threshold for low stock alerts",
      },
      {
        key: "expiry_warning_days",
        value: "90",
        description: "Number of days before expiry to show warnings",
      },
      {
        key: "tax_rate",
        value: "0.08",
        description: "Sales tax rate (as decimal)",
      },
      {
        key: "currency",
        value: "USD",
        description: "Currency code for all monetary values",
      },
      {
        key: "business_hours",
        value: JSON.stringify({
          monday: "9:00-18:00",
          tuesday: "9:00-18:00",
          wednesday: "9:00-18:00",
          thursday: "9:00-18:00",
          friday: "9:00-18:00",
          saturday: "9:00-14:00",
          sunday: "closed",
        }),
        description: "Business operating hours",
      },
      {
        key: "prescription_retention_days",
        value: "30",
        description: "Number of days to retain prescription records",
      },
    ]);

    console.log("✅ Database seeding completed successfully!");
    console.log(`
📈 Seeded data summary:
- Users: 3
- User Credentials: 3
- User Registrations: 2
- Customers: 3
- Suppliers: 3
- Medications: 5
- Medication Variants: 7
- Supplier-Medication Links: 7
- Warehouse Zones: 3
- Warehouse Racks: 4
- Warehouse Bins: 48
- Purchase Orders: 3
- Purchase Order Items: 5
- Purchase Order Receipts: 1
- Receipt Items: 3
- Inventory Entries: 3
- Sales Orders: 3
- Sales Order Items: 5
- Files: 2
- File Attachments: 2
- Notifications: 4
- Audit Logs: 4
- Reports: 3
- Settings: 10
    `);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("🎉 Seeding process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
