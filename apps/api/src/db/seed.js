/* eslint-disable n/no-process-exit */
/* eslint-disable no-console */

import { db } from "./connection.js";
import {
  auditLogs,
  customers,
  files,
  inventory,
  medications,
  medicationVariants,
  notifications,
  purchaseOrderItems,
  purchaseOrderReceiptItems,
  purchaseOrderReceipts,
  purchaseOrders,
  reports,
  salesOrderItems,
  salesOrders,
  settings,
  shiftAssignments,
  shifts,
  supplierMedicationVariants,
  suppliers,
  userCredentials,
  userRegistrations,
  users,
  warehouseBins,
  warehouseRacks,
  warehouseZones,
} from "./schema/index.js";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in reverse dependency order)
    console.log("🧹 Clearing existing data...");
    await db.delete(auditLogs);
    await db.delete(notifications);
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
    await db.delete(shiftAssignments);
    await db.delete(shifts);
    await db.delete(userCredentials);
    await db.delete(userRegistrations);
    await db.delete(users);
    await db.delete(reports);
    await db.delete(settings);

    // 1. Seed Users
    console.log("👥 Seeding users...");
    const [owner, staff1, staff2, staff3, staff4] = await db
      .insert(users)
      .values([
        {
          name: "Dr. Sarah Chen",
          email: "owner@pharmaflow.com",
          phone: "0901234567",
          address: "123 Medical Plaza, District 1, Ho Chi Minh City",
          status: "active",
          role: "owner",
        },
        {
          name: "Nguyen Van Tuan",
          email: "tuan.nguyen@pharmaflow.com",
          phone: "0912345678",
          address: "456 Pharmacy Street, District 3, Ho Chi Minh City",
          status: "active",
          role: "staff",
        },
        {
          name: "Le Thi Mai",
          email: "mai.le@pharmaflow.com",
          phone: "0923456789",
          address: "789 Healthcare Ave, District 5, Ho Chi Minh City",
          status: "active",
          role: "staff",
        },
        {
          name: "Tran Minh Quan",
          email: "quan.tran@pharmaflow.com",
          phone: "0934567890",
          address: "321 Wellness Blvd, District 7, Ho Chi Minh City",
          status: "active",
          role: "staff",
        },
        {
          name: "Pham Thu Huong",
          email: "huong.pham@pharmaflow.com",
          phone: "0945678901",
          address: "654 Medical Center, District 10, Ho Chi Minh City",
          status: "inactive",
          role: "staff",
        },
      ])
      .returning();

    // 2. Seed User Credentials (password: "admin123" for all users)
    console.log("🔐 Seeding user credentials...");
    await db.insert(userCredentials).values([
      {
        userId: owner.id,
        provider: "local",
        identifier: "owner@pharmaflow.com",
        secret: "$2a$12$K5knK5KpQNbsKKgIsUcopOKmKpvGqscZh.nku3I5SZO5HMLOei2qu",
      },
      {
        userId: staff1.id,
        provider: "local",
        identifier: "tuan.nguyen@pharmaflow.com",
        secret: "$2a$12$K5knK5KpQNbsKKgIsUcopOKmKpvGqscZh.nku3I5SZO5HMLOei2qu",
      },
      {
        userId: staff2.id,
        provider: "local",
        identifier: "mai.le@pharmaflow.com",
        secret: "$2a$12$K5knK5KpQNbsKKgIsUcopOKmKpvGqscZh.nku3I5SZO5HMLOei2qu",
      },
      {
        userId: staff3.id,
        provider: "local",
        identifier: "quan.tran@pharmaflow.com",
        secret: "$2a$12$K5knK5KpQNbsKKgIsUcopOKmKpvGqscZh.nku3I5SZO5HMLOei2qu",
      },
      {
        userId: staff4.id,
        provider: "local",
        identifier: "huong.pham@pharmaflow.com",
        secret: "$2a$12$K5knK5KpQNbsKKgIsUcopOKmKpvGqscZh.nku3I5SZO5HMLOei2qu",
      },
    ]);

    // 3. Seed User Registrations
    console.log("📝 Seeding user registrations...");
    await db.insert(userRegistrations).values([
      {
        name: "Hoang Van Nam",
        email: "nam.hoang@example.com",
        phone: "0956789012",
        address: "147 Nguyen Trai St, District 1, Ho Chi Minh City",
        password:
          "$2a$12$K5knK5KpQNbsKKgIsUcopOKmKpvGqscZh.nku3I5SZO5HMLOei2qu",
        status: "pending",
      },
      {
        name: "Vo Thi Lan",
        email: "lan.vo@example.com",
        phone: "0967890123",
        address: "258 Le Loi Blvd, District 3, Ho Chi Minh City",
        password:
          "$2a$12$K5knK5KpQNbsKKgIsUcopOKmKpvGqscZh.nku3I5SZO5HMLOei2qu",
        status: "approved",
      },
      {
        name: "Do Minh Tri",
        email: "tri.do@example.com",
        phone: "0978901234",
        address: "369 Vo Van Tan St, District 3, Ho Chi Minh City",
        password:
          "$2a$12$K5knK5KpQNbsKKgIsUcopOKmKpvGqscZh.nku3I5SZO5HMLOei2qu",
        status: "rejected",
      },
    ]);

    // 4. Seed Customers
    console.log("🛍️ Seeding customers...");
    const [customer1, customer2, customer3, customer4] = await db
      .insert(customers)
      .values([
        {
          name: "Nguyen Thi Hoa",
          email: "hoa.nguyen@customer.com",
          phone: "0989012345",
          address: "12 Tran Hung Dao St, District 1, Ho Chi Minh City",
        },
        {
          name: "Le Van Hung",
          email: "hung.le@customer.com",
          phone: "0990123456",
          address: "34 Pasteur St, District 1, Ho Chi Minh City",
        },
        {
          name: "Pham Thi Thao",
          email: "thao.pham@customer.com",
          phone: "0991234567",
          address: "56 Nguyen Hue Blvd, District 1, Ho Chi Minh City",
        },
        {
          name: "Tran Van Binh",
          email: "binh.tran@customer.com",
          phone: "0992345678",
          address: "78 Le Duan St, District 1, Ho Chi Minh City",
        },
        {
          name: "Vo Thi Kim",
          email: "kim.vo@customer.com",
          phone: "0993456789",
          address: "90 Hai Ba Trung St, District 3, Ho Chi Minh City",
        },
        {
          name: "Dang Van Long",
          email: "long.dang@customer.com",
          phone: "0994567890",
          address: "45 Cach Mang Thang 8 St, District 10, Ho Chi Minh City",
        },
      ])
      .returning();

    // 5. Seed Suppliers
    console.log("🏭 Seeding suppliers...");
    const [supplier1, supplier2, supplier3, supplier4] = await db
      .insert(suppliers)
      .values([
        {
          name: "Viet Pharmaceutical Corporation",
          contactName: "Nguyen Van Khai",
          email: "contact@vietpharm.vn",
          phone: "0281234567",
          address: "123 Nguyen Van Linh Pkwy, District 7, Ho Chi Minh City",
          status: "active",
        },
        {
          name: "Saigon MediSupply Co., Ltd",
          contactName: "Tran Thi Thanh",
          email: "orders@sgmedisupply.com",
          phone: "0282345678",
          address: "456 Truong Chinh St, Tan Binh District, Ho Chi Minh City",
          status: "active",
        },
        {
          name: "Global BioMed Vietnam",
          contactName: "Le Hoang Phuc",
          email: "sales@globalbiomed.vn",
          phone: "0283456789",
          address: "789 Xa Lo Ha Noi St, Thu Duc City, Ho Chi Minh City",
          status: "active",
        },
        {
          name: "Asia Pacific Pharmaceuticals",
          contactName: "Pham Van Duc",
          email: "info@appharm.com",
          phone: "0284567890",
          address: "321 Vo Thi Sau St, District 3, Ho Chi Minh City",
          status: "active",
        },
        {
          name: "Mekong Healthcare Supplies",
          contactName: "Vo Thi Minh",
          email: "contact@mekonghealth.vn",
          phone: "0285678901",
          address: "654 3/2 St, District 10, Ho Chi Minh City",
          status: "inactive",
        },
      ])
      .returning();

    // 6. Seed Medication Images (Sample Files)
    console.log("🖼️ Seeding medication images...");

    // Create sample image buffers (1x1 PNG placeholders with different colors)
    const createSampleImage = (color) => {
      // Minimal valid PNG header + IEND chunk
      const base64 = `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN${color}AAAA${color}wAAQpwMvKLK8QAAAABJRU5ErkJggg==`;
      return Buffer.from(base64, "base64");
    };

    const [
      imageParacetamol,
      imageAmoxicillin,
      imageIbuprofen,
      imageOmeprazole,
      imageCetirizine,
      imageMetformin,
    ] = await db
      .insert(files)
      .values([
        {
          filename: "paracetamol.png",
          fileType: "png",
          mimeType: "image/png",
          fileSize: 95,
          blob: createSampleImage("k8"),
          uploadedBy: owner.id,
        },
        {
          filename: "amoxicillin.png",
          fileType: "png",
          mimeType: "image/png",
          fileSize: 95,
          blob: createSampleImage("Ma"),
          uploadedBy: owner.id,
        },
        {
          filename: "ibuprofen.png",
          fileType: "png",
          mimeType: "image/png",
          fileSize: 95,
          blob: createSampleImage("Ng"),
          uploadedBy: owner.id,
        },
        {
          filename: "omeprazole.png",
          fileType: "png",
          mimeType: "image/png",
          fileSize: 95,
          blob: createSampleImage("Ow"),
          uploadedBy: owner.id,
        },
        {
          filename: "cetirizine.png",
          fileType: "png",
          mimeType: "image/png",
          fileSize: 95,
          blob: createSampleImage("Pg"),
          uploadedBy: owner.id,
        },
        {
          filename: "metformin.png",
          fileType: "png",
          mimeType: "image/png",
          fileSize: 95,
          blob: createSampleImage("Qg"),
          uploadedBy: owner.id,
        },
      ])
      .returning();

    // 6. Seed Medications
    console.log("💊 Seeding medications...");
    const [
      med1,
      med2,
      med3,
      med4,
      med5,
      med6,
      med7,
      med8,
      med9,
      med10,
      med11,
      med12,
    ] = await db
      .insert(medications)
      .values([
        {
          name: "Paracetamol",
          brand: "Tylenol",
          description:
            "Analgesic and antipyretic for pain relief and fever reduction",
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          status: "active",
          imageId: imageParacetamol.id,
        },
        {
          name: "Amoxicillin",
          brand: "Amoxil",
          description: "Beta-lactam antibiotic for bacterial infections",
          isPrescriptionRequired: true,
          isControlledSubstance: false,
          status: "active",
          imageId: imageAmoxicillin.id,
        },
        {
          name: "Ibuprofen",
          brand: "Brufen",
          description: "Non-steroidal anti-inflammatory drug (NSAID)",
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          status: "active",
          imageId: imageIbuprofen.id,
        },
        {
          name: "Omeprazole",
          brand: "Losec",
          description:
            "Proton pump inhibitor for gastric acid-related disorders",
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          status: "active",
          imageId: imageOmeprazole.id,
        },
        {
          name: "Cetirizine",
          brand: "Zyrtec",
          description: "Antihistamine for allergic conditions",
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          status: "active",
          imageId: imageCetirizine.id,
        },
        {
          name: "Metformin",
          brand: "Glucophage",
          description: "Oral antidiabetic medication for type 2 diabetes",
          isPrescriptionRequired: true,
          isControlledSubstance: false,
          status: "active",
          imageId: imageMetformin.id,
        },
        {
          name: "Atorvastatin",
          brand: "Lipitor",
          description: "Statin for cholesterol management",
          isPrescriptionRequired: true,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Amlodipine",
          brand: "Norvasc",
          description: "Calcium channel blocker for hypertension",
          isPrescriptionRequired: true,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Salbutamol",
          brand: "Ventolin",
          description: "Bronchodilator for asthma and COPD",
          isPrescriptionRequired: true,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Vitamin D3",
          brand: "Cholecalciferol",
          description: "Vitamin D supplement for bone health",
          isPrescriptionRequired: false,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Azithromycin",
          brand: "Zithromax",
          description: "Macrolide antibiotic for respiratory infections",
          isPrescriptionRequired: true,
          isControlledSubstance: false,
          status: "active",
        },
        {
          name: "Tramadol",
          brand: "Ultram",
          description: "Opioid analgesic for moderate to severe pain",
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
        sku: "PAR-500-TAB-100",
        name: "Paracetamol 500mg Tablets (Box of 100)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890001",
        sellPrice: 50000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med1.id,
        sku: "PAR-650-TAB-50",
        name: "Paracetamol 650mg Tablets (Box of 50)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890002",
        sellPrice: 35000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med1.id,
        sku: "PAR-250-SYR-60ML",
        name: "Paracetamol 250mg/5ml Syrup (60ml bottle)",
        unit: "bottle",
        unitFactor: 1.0,
        barcode: "8934567890003",
        sellPrice: 45000,
        isActive: true,
        isForSale: true,
      },

      // Amoxicillin variants
      {
        medicationId: med2.id,
        sku: "AMX-500-CAP-20",
        name: "Amoxicillin 500mg Capsules (Box of 20)",
        unit: "capsule",
        unitFactor: 1.0,
        barcode: "8934567890011",
        sellPrice: 85000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med2.id,
        sku: "AMX-250-SUS-100ML",
        name: "Amoxicillin 250mg/5ml Suspension (100ml bottle)",
        unit: "bottle",
        unitFactor: 1.0,
        barcode: "8934567890012",
        sellPrice: 65000,
        isActive: true,
        isForSale: true,
      },

      // Ibuprofen variants
      {
        medicationId: med3.id,
        sku: "IBU-400-TAB-30",
        name: "Ibuprofen 400mg Tablets (Box of 30)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890021",
        sellPrice: 55000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med3.id,
        sku: "IBU-200-TAB-50",
        name: "Ibuprofen 200mg Tablets (Box of 50)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890022",
        sellPrice: 40000,
        isActive: true,
        isForSale: true,
      },

      // Omeprazole variants
      {
        medicationId: med4.id,
        sku: "OME-20-CAP-28",
        name: "Omeprazole 20mg Capsules (Box of 28)",
        unit: "capsule",
        unitFactor: 1.0,
        barcode: "8934567890031",
        sellPrice: 120000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med4.id,
        sku: "OME-40-CAP-14",
        name: "Omeprazole 40mg Capsules (Box of 14)",
        unit: "capsule",
        unitFactor: 1.0,
        barcode: "8934567890032",
        sellPrice: 95000,
        isActive: true,
        isForSale: true,
      },

      // Cetirizine variants
      {
        medicationId: med5.id,
        sku: "CET-10-TAB-30",
        name: "Cetirizine 10mg Tablets (Box of 30)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890041",
        sellPrice: 45000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med5.id,
        sku: "CET-5-SYR-60ML",
        name: "Cetirizine 5mg/5ml Syrup (60ml bottle)",
        unit: "bottle",
        unitFactor: 1.0,
        barcode: "8934567890042",
        sellPrice: 38000,
        isActive: true,
        isForSale: true,
      },

      // Metformin variants
      {
        medicationId: med6.id,
        sku: "MET-500-TAB-60",
        name: "Metformin 500mg Tablets (Box of 60)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890051",
        sellPrice: 75000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med6.id,
        sku: "MET-850-TAB-30",
        name: "Metformin 850mg Tablets (Box of 30)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890052",
        sellPrice: 65000,
        isActive: true,
        isForSale: true,
      },

      // Atorvastatin variants
      {
        medicationId: med7.id,
        sku: "ATO-10-TAB-30",
        name: "Atorvastatin 10mg Tablets (Box of 30)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890061",
        sellPrice: 150000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med7.id,
        sku: "ATO-20-TAB-30",
        name: "Atorvastatin 20mg Tablets (Box of 30)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890062",
        sellPrice: 220000,
        isActive: true,
        isForSale: true,
      },

      // Amlodipine variants
      {
        medicationId: med8.id,
        sku: "AML-5-TAB-30",
        name: "Amlodipine 5mg Tablets (Box of 30)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890071",
        sellPrice: 85000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med8.id,
        sku: "AML-10-TAB-30",
        name: "Amlodipine 10mg Tablets (Box of 30)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890072",
        sellPrice: 125000,
        isActive: true,
        isForSale: true,
      },

      // Salbutamol variants
      {
        medicationId: med9.id,
        sku: "SAL-100-INH-200",
        name: "Salbutamol 100mcg Inhaler (200 doses)",
        unit: "inhaler",
        unitFactor: 1.0,
        barcode: "8934567890081",
        sellPrice: 95000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med9.id,
        sku: "SAL-2-NEB-20",
        name: "Salbutamol 2mg/2ml Nebules (Box of 20)",
        unit: "nebule",
        unitFactor: 1.0,
        barcode: "8934567890082",
        sellPrice: 180000,
        isActive: true,
        isForSale: true,
      },

      // Vitamin D3 variants
      {
        medicationId: med10.id,
        sku: "VID-1000-CAP-30",
        name: "Vitamin D3 1000IU Soft Capsules (Box of 30)",
        unit: "capsule",
        unitFactor: 1.0,
        barcode: "8934567890091",
        sellPrice: 65000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med10.id,
        sku: "VID-400-DROP-10ML",
        name: "Vitamin D3 400IU/drop Oral Drops (10ml bottle)",
        unit: "bottle",
        unitFactor: 1.0,
        barcode: "8934567890092",
        sellPrice: 55000,
        isActive: true,
        isForSale: true,
      },

      // Azithromycin variants
      {
        medicationId: med11.id,
        sku: "AZI-500-TAB-3",
        name: "Azithromycin 500mg Tablets (Box of 3)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890101",
        sellPrice: 75000,
        isActive: true,
        isForSale: true,
      },
      {
        medicationId: med11.id,
        sku: "AZI-200-SUS-15ML",
        name: "Azithromycin 200mg/5ml Suspension (15ml bottle)",
        unit: "bottle",
        unitFactor: 1.0,
        barcode: "8934567890102",
        sellPrice: 85000,
        isActive: true,
        isForSale: true,
      },

      // Tramadol variants (controlled substance)
      {
        medicationId: med12.id,
        sku: "TRA-50-CAP-20",
        name: "Tramadol 50mg Capsules (Box of 20)",
        unit: "capsule",
        unitFactor: 1.0,
        barcode: "8934567890111",
        sellPrice: 250000,
        isActive: true,
        isForSale: false, // Controlled substance - special handling
      },
      {
        medicationId: med12.id,
        sku: "TRA-100-TAB-10",
        name: "Tramadol 100mg Extended-Release Tablets (Box of 10)",
        unit: "tablet",
        unitFactor: 1.0,
        barcode: "8934567890112",
        sellPrice: 180000,
        isActive: true,
        isForSale: false, // Controlled substance - special handling
      },
    ];

    const medicationVariantsResults = await db
      .insert(medicationVariants)
      .values(medicationVariantData)
      .returning();

    // 8. Seed Warehouse Zones
    console.log("🏪 Seeding warehouse zones...");
    const [zone1, zone2, zone3, zone4] = await db
      .insert(warehouseZones)
      .values([
        {
          code: "NORM-A",
          name: "Normal Storage Zone A",
          type: "normal",
          location: "Ground Floor - Section A (Main Warehouse)",
          description:
            "Primary storage for tablets, capsules, and general medications at room temperature",
        },
        {
          code: "NORM-B",
          name: "Normal Storage Zone B",
          type: "normal",
          location: "Ground Floor - Section B (Main Warehouse)",
          description:
            "Secondary storage for high-volume OTC medications and supplements",
        },
        {
          code: "COLD-C",
          name: "Cold Storage Zone C",
          type: "cold",
          location: "Second Floor - Cold Storage Facility",
          description:
            "Temperature-controlled (2-8°C) storage for vaccines, insulin, and biologics",
        },
        {
          code: "CTRL-D",
          name: "Controlled Substances Vault D",
          type: "hazard",
          location: "Basement - High Security Vault",
          description:
            "Restricted access vault for controlled substances and narcotics with 24/7 monitoring",
        },
      ])
      .returning();

    // 9. Seed Warehouse Racks
    console.log("🗄️ Seeding warehouse racks...");
    const [rack1, rack2, rack3, rack4, rack5, rack6, rack7, rack8] = await db
      .insert(warehouseRacks)
      .values([
        // Zone A - Normal Storage Racks
        {
          zoneId: zone1.id,
          code: "R-A-001",
          name: "Rack A-001 (Oral Solids)",
          description: "Tablets and capsules - Antibiotics and Analgesics",
        },
        {
          zoneId: zone1.id,
          code: "R-A-002",
          name: "Rack A-002 (Cardiovascular)",
          description: "Blood pressure and cholesterol medications",
        },
        {
          zoneId: zone1.id,
          code: "R-A-003",
          name: "Rack A-003 (Liquids & Syrups)",
          description: "Liquid formulations and suspensions",
        },
        // Zone B - Normal Storage Racks
        {
          zoneId: zone2.id,
          code: "R-B-001",
          name: "Rack B-001 (OTC Medications)",
          description: "Over-the-counter pain relief and cold medications",
        },
        {
          zoneId: zone2.id,
          code: "R-B-002",
          name: "Rack B-002 (Vitamins & Supplements)",
          description: "Dietary supplements and multivitamins",
        },
        // Zone C - Cold Storage Racks
        {
          zoneId: zone3.id,
          code: "R-C-001",
          name: "Cold Rack C-001 (Vaccines)",
          description: "Vaccine storage with temperature monitoring",
        },
        {
          zoneId: zone3.id,
          code: "R-C-002",
          name: "Cold Rack C-002 (Insulin & Biologics)",
          description: "Refrigerated insulin and biological products",
        },
        // Zone D - Controlled Substances
        {
          zoneId: zone4.id,
          code: "R-D-001",
          name: "Secure Vault D-001 (Narcotics)",
          description: "High-security storage for controlled narcotics",
        },
      ])
      .returning();

    // 10. Seed Warehouse Bins
    console.log("📦 Seeding warehouse bins...");
    const binData = [];

    // Create bins for each rack (4 levels x 6 positions per level)
    [rack1, rack2, rack3, rack4, rack5, rack6, rack7, rack8].forEach((rack) => {
      for (let level = 1; level <= 4; level++) {
        for (let number = 1; number <= 6; number++) {
          binData.push({
            rackId: rack.id,
            code: `${rack.code}-L${level}-B${number.toString().padStart(2, "0")}`,
            name: `${rack.name} - Level ${level} - Bin ${number}`,
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
    const supplierMedicationVariantData = [
      // Supplier 1 (Viet Pharmaceutical Corporation)
      {
        supplierId: supplier1.id,
        medicationVariantId: medicationVariantsResults[0].id, // Paracetamol 500mg
        supplierSku: "VP-PAR500",
        leadTimeDays: 5,
        purchasePrice: "40000.00",
      },
      {
        supplierId: supplier1.id,
        medicationVariantId: medicationVariantsResults[3].id, // Amoxicillin 500mg
        supplierSku: "VP-AMX500",
        leadTimeDays: 7,
        purchasePrice: "75000.00",
      },
      {
        supplierId: supplier1.id,
        medicationVariantId: medicationVariantsResults[13].id, // Atorvastatin 20mg
        supplierSku: "VP-ATO20",
        leadTimeDays: 10,
        purchasePrice: "200000.00",
      },
      {
        supplierId: supplier1.id,
        medicationVariantId: medicationVariantsResults[15].id, // Amlodipine 10mg
        supplierSku: "VP-AML10",
        leadTimeDays: 7,
        purchasePrice: "97500.00",
      },

      // Supplier 2 (Saigon MediSupply)
      {
        supplierId: supplier2.id,
        medicationVariantId: medicationVariantsResults[5].id, // Ibuprofen 400mg
        supplierSku: "SGM-IBU400",
        leadTimeDays: 4,
        purchasePrice: "45000.00",
      },
      {
        supplierId: supplier2.id,
        medicationVariantId: medicationVariantsResults[7].id, // Omeprazole 20mg
        supplierSku: "SGM-OME20",
        leadTimeDays: 6,
        purchasePrice: "90000.00",
      },
      {
        supplierId: supplier2.id,
        medicationVariantId: medicationVariantsResults[9].id, // Cetirizine 10mg
        supplierSku: "SGM-CET10",
        leadTimeDays: 5,
        purchasePrice: "35000.00",
      },
      {
        supplierId: supplier2.id,
        medicationVariantId: medicationVariantsResults[21].id, // Azithromycin 500mg
        supplierSku: "SGM-AZI500",
        leadTimeDays: 8,
        purchasePrice: "65000.00",
      },

      // Supplier 3 (Global BioMed)
      {
        supplierId: supplier3.id,
        medicationVariantId: medicationVariantsResults[11].id, // Metformin 500mg
        supplierSku: "GBM-MET500",
        leadTimeDays: 12,
        purchasePrice: "60000.00",
      },
      {
        supplierId: supplier3.id,
        medicationVariantId: medicationVariantsResults[17].id, // Salbutamol Inhaler
        supplierSku: "GBM-SAL-INH",
        leadTimeDays: 14,
        purchasePrice: "75000.00",
      },
      {
        supplierId: supplier3.id,
        medicationVariantId: medicationVariantsResults[19].id, // Vitamin D3 1000IU
        supplierSku: "GBM-VID1000",
        leadTimeDays: 10,
        purchasePrice: "50000.00",
      },

      // Supplier 4 (Asia Pacific Pharmaceuticals)
      {
        supplierId: supplier4.id,
        medicationVariantId: medicationVariantsResults[23].id, // Tramadol 50mg
        supplierSku: "APP-TRA50",
        leadTimeDays: 15,
        purchasePrice: "200000.00",
      },
      {
        supplierId: supplier4.id,
        medicationVariantId: medicationVariantsResults[1].id, // Paracetamol 650mg
        supplierSku: "APP-PAR650",
        leadTimeDays: 6,
        purchasePrice: "28000.00",
      },
      {
        supplierId: supplier4.id,
        medicationVariantId: medicationVariantsResults[6].id, // Ibuprofen 200mg
        supplierSku: "APP-IBU200",
        leadTimeDays: 5,
        purchasePrice: "32000.00",
      },
    ];

    const supplierMedicationVariantsResults = await db
      .insert(supplierMedicationVariants)
      .values(supplierMedicationVariantData)
      .returning();

    // 12. Seed Purchase Orders
    console.log("📋 Seeding purchase orders...");
    const [po1, po2, po3, po4, po5] = await db
      .insert(purchaseOrders)
      .values([
        {
          supplierId: supplier1.id,
          orderDate: new Date("2024-05-15T09:00:00Z"),
          expectedDate: new Date("2024-05-22T09:00:00Z"),
          status: "received",
          totalAmount: 18500000,
          createdBy: owner.id,
        },
        {
          supplierId: supplier2.id,
          orderDate: new Date("2024-06-01T14:00:00Z"),
          expectedDate: new Date("2024-06-07T14:00:00Z"),
          status: "ordered",
          totalAmount: 11250000,
          createdBy: staff1.id,
        },
        {
          supplierId: supplier3.id,
          orderDate: new Date("2024-06-10T11:30:00Z"),
          expectedDate: new Date("2024-06-24T11:30:00Z"),
          status: "pending",
          totalAmount: 24750000,
          createdBy: staff2.id,
        },
        {
          supplierId: supplier1.id,
          orderDate: new Date("2024-06-12T16:00:00Z"),
          expectedDate: new Date("2024-06-19T16:00:00Z"),
          status: "pending",
          totalAmount: 9750000,
          createdBy: owner.id,
        },
        {
          supplierId: supplier4.id,
          orderDate: new Date("2024-06-14T10:00:00Z"),
          expectedDate: new Date("2024-06-29T10:00:00Z"),
          status: "cancelled",
          totalAmount: 35000000,
          createdBy: staff3.id,
        },
      ])
      .returning();

    // 13. Seed Purchase Order Items
    console.log("📦 Seeding purchase order items...");
    const purchaseOrderItemData = [
      // PO1 Items (Viet Pharmaceutical)
      {
        purchaseOrderId: po1.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[0].id, // Paracetamol 500mg
        quantity: 200,
        unitPrice: 40000,
        totalPrice: 8000000,
      },
      {
        purchaseOrderId: po1.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[1].id, // Amoxicillin 500mg
        quantity: 100,
        unitPrice: 75000,
        totalPrice: 7500000,
      },
      {
        purchaseOrderId: po1.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[2].id, // Atorvastatin 20mg
        quantity: 50,
        unitPrice: 200000,
        totalPrice: 3000000,
      },

      // PO2 Items (Saigon MediSupply)
      {
        purchaseOrderId: po2.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[4].id, // Ibuprofen 400mg
        quantity: 150,
        unitPrice: 45000,
        totalPrice: 6750000,
      },
      {
        purchaseOrderId: po2.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[5].id, // Omeprazole 20mg
        quantity: 50,
        unitPrice: 90000,
        totalPrice: 4500000,
      },

      // PO3 Items (Global BioMed)
      {
        purchaseOrderId: po3.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[8].id, // Metformin 500mg
        quantity: 300,
        unitPrice: 60000,
        totalPrice: 18000000,
      },
      {
        purchaseOrderId: po3.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[9].id, // Salbutamol Inhaler
        quantity: 50,
        unitPrice: 75000,
        totalPrice: 3750000,
      },
      {
        purchaseOrderId: po3.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[10].id, // Vitamin D3
        quantity: 100,
        unitPrice: 50000,
        totalPrice: 3000000,
      },

      // PO4 Items (Viet Pharmaceutical)
      {
        purchaseOrderId: po4.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[3].id, // Amlodipine 10mg
        quantity: 100,
        unitPrice: 97500,
        totalPrice: 9750000,
      },

      // PO5 Items (Asia Pacific Pharmaceuticals) - Cancelled PO
      {
        purchaseOrderId: po5.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[11].id, // Tramadol 50mg
        quantity: 100,
        unitPrice: 200000,
        totalPrice: 20000000,
      },
      {
        purchaseOrderId: po5.id,
        supplierMedicationVariantId: supplierMedicationVariantsResults[12].id, // Paracetamol 650mg
        quantity: 300,
        unitPrice: 50000,
        totalPrice: 15000000,
      },
    ];

    const purchaseOrderItemsResults = await db
      .insert(purchaseOrderItems)
      .values(purchaseOrderItemData)
      .returning();

    // 14. Seed Purchase Order Receipts (for received orders)
    console.log("📥 Seeding purchase order receipts...");
    const [receipt1, receipt2, receipt3, receipt4] = await db
      .insert(purchaseOrderReceipts)
      .values([
        // Receipt for PO1 (Viet Pharmaceutical - May 2024)
        {
          purchaseOrderId: po1.id,
          receivedDate: new Date("2024-05-23T10:00:00Z"),
          receivedBy: staff1.id,
        },
        // Receipt for PO2 (Saigon MediSupply - June 2024)
        {
          purchaseOrderId: po2.id,
          receivedDate: new Date("2024-06-08T14:30:00Z"),
          receivedBy: staff2.id,
        },
        // Receipt for PO3 (Global BioMed - June 2024)
        {
          purchaseOrderId: po3.id,
          receivedDate: new Date("2024-06-25T09:15:00Z"),
          receivedBy: staff1.id,
        },
        // Receipt for PO4 (Viet Pharmaceutical - June 2024)
        {
          purchaseOrderId: po4.id,
          receivedDate: new Date("2024-06-20T11:00:00Z"),
          receivedBy: staff3.id,
        },
      ])
      .returning();

    // 15. Seed Purchase Order Receipt Items
    console.log("📋 Seeding purchase order receipt items...");

    // Receipt 1 items (PO1)
    const receipt1ItemData = purchaseOrderItemsResults
      .filter((item) => item.purchaseOrderId === po1.id)
      .map((item) => ({
        purchaseOrderReceiptId: receipt1.id,
        purchaseOrderItemId: item.id,
        quantity: item.quantity,
      }));

    // Receipt 2 items (PO2)
    const receipt2ItemData = purchaseOrderItemsResults
      .filter((item) => item.purchaseOrderId === po2.id)
      .map((item) => ({
        purchaseOrderReceiptId: receipt2.id,
        purchaseOrderItemId: item.id,
        quantity: item.quantity,
      }));

    // Receipt 3 items (PO3)
    const receipt3ItemData = purchaseOrderItemsResults
      .filter((item) => item.purchaseOrderId === po3.id)
      .map((item) => ({
        purchaseOrderReceiptId: receipt3.id,
        purchaseOrderItemId: item.id,
        quantity: item.quantity,
      }));

    // Receipt 4 items (PO4)
    const receipt4ItemData = purchaseOrderItemsResults
      .filter((item) => item.purchaseOrderId === po4.id)
      .map((item) => ({
        purchaseOrderReceiptId: receipt4.id,
        purchaseOrderItemId: item.id,
        quantity: item.quantity,
      }));

    const allReceiptItemData = [
      ...receipt1ItemData,
      ...receipt2ItemData,
      ...receipt3ItemData,
      ...receipt4ItemData,
    ];

    const receiptItemsResults = await db
      .insert(purchaseOrderReceiptItems)
      .values(allReceiptItemData)
      .returning();

    // 16. Seed Inventory (from all received purchase order receipts)
    console.log("📊 Seeding inventory...");

    const inventoryData = [
      // Inventory from PO1 Receipt - Item 0: Paracetamol 500mg (200 boxes)
      {
        medicationVariantId: medicationVariantsResults[0].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[0].id,
        binId: warehouseBinsResults[0].id,
        batchNumber: "P2405001",
        manufactureDate: new Date("2024-01-10"),
        expiryDate: new Date("2027-01-09"),
        quantity: 200,
      },
      // Inventory from PO1 Receipt - Item 1: Amoxicillin 500mg (100 boxes)
      {
        medicationVariantId: medicationVariantsResults[3].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[1].id,
        binId: warehouseBinsResults[1].id,
        batchNumber: "A2405002",
        manufactureDate: new Date("2024-02-15"),
        expiryDate: new Date("2026-02-14"),
        quantity: 100,
      },
      // Inventory from PO1 Receipt - Item 2: Atorvastatin 20mg (50 boxes)
      {
        medicationVariantId: medicationVariantsResults[13].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[2].id,
        binId: warehouseBinsResults[2].id,
        batchNumber: "T2405003",
        manufactureDate: new Date("2023-12-20"),
        expiryDate: new Date("2025-12-19"),
        quantity: 50,
      },
      // Inventory from PO2 Receipt - Item 3: Ibuprofen 400mg (150 boxes)
      {
        medicationVariantId: medicationVariantsResults[5].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[3].id,
        binId: warehouseBinsResults[3].id,
        batchNumber: "I2406001",
        manufactureDate: new Date("2024-03-05"),
        expiryDate: new Date("2026-03-04"),
        quantity: 150,
      },
      // Inventory from PO2 Receipt - Item 4: Omeprazole 20mg (50 boxes)
      {
        medicationVariantId: medicationVariantsResults[7].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[4].id,
        binId: warehouseBinsResults[4].id,
        batchNumber: "O2406002",
        manufactureDate: new Date("2024-02-20"),
        expiryDate: new Date("2026-02-19"),
        quantity: 50,
      },
      // Inventory from PO3 Receipt - Item 5: Metformin 500mg (300 boxes)
      {
        medicationVariantId: medicationVariantsResults[11].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[5].id,
        binId: warehouseBinsResults[5].id,
        batchNumber: "M2406001",
        manufactureDate: new Date("2024-03-15"),
        expiryDate: new Date("2027-03-14"),
        quantity: 300,
      },
      // Inventory from PO3 Receipt - Item 6: Salbutamol Inhaler (50 units)
      {
        medicationVariantId: medicationVariantsResults[17].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[6].id,
        binId: warehouseBinsResults[6].id,
        batchNumber: "S2406002",
        manufactureDate: new Date("2024-04-01"),
        expiryDate: new Date("2026-03-31"),
        quantity: 50,
      },
      // Inventory from PO3 Receipt - Item 7: Vitamin D3 1000IU (100 boxes)
      {
        medicationVariantId: medicationVariantsResults[19].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[7].id,
        binId: warehouseBinsResults[7].id,
        batchNumber: "V2406003",
        manufactureDate: new Date("2024-02-28"),
        expiryDate: new Date("2027-02-27"),
        quantity: 100,
      },
      // Inventory from PO4 Receipt - Item 8: Amlodipine 10mg (100 boxes)
      {
        medicationVariantId: medicationVariantsResults[15].id,
        purchaseOrderReceiptItemsId: receiptItemsResults[8].id,
        binId: warehouseBinsResults[8].id,
        batchNumber: "M2406004",
        manufactureDate: new Date("2024-03-20"),
        expiryDate: new Date("2027-03-19"),
        quantity: 100,
      },
    ];

    await db.insert(inventory).values(inventoryData);

    // 17. Seed Sales Orders (Status: pending, paid, cancelled only)
    console.log("💰 Seeding sales orders...");
    const [sale1, sale2, sale3] = await db
      .insert(salesOrders)
      .values([
        // Old sales from June 2024 (for historical data)
        {
          customerId: customer1.id,
          orderDate: new Date("2024-06-05T10:30:00Z"),
          totalAmount: 220000,
          status: "paid",
          paymentMethod: "cash",
          salespersonId: staff1.id,
        },
        {
          customerId: customer2.id,
          orderDate: new Date("2024-06-08T15:00:00Z"),
          totalAmount: 340000,
          status: "paid",
          paymentMethod: "credit_card",
          salespersonId: staff2.id,
        },
        {
          customerId: customer3.id,
          orderDate: new Date("2024-06-12T09:00:00Z"),
          totalAmount: 110000,
          status: "pending",
          paymentMethod: "mobile_payment",
          salespersonId: staff1.id,
        },
        {
          customerId: customer1.id,
          orderDate: new Date("2024-06-13T11:00:00Z"),
          totalAmount: 85000,
          status: "cancelled",
          paymentMethod: "cash",
          salespersonId: staff3.id,
        },
        {
          customerId: customer4.id,
          orderDate: new Date("2024-06-14T16:30:00Z"),
          totalAmount: 540000,
          status: "paid",
          paymentMethod: "bank_transfer",
          salespersonId: staff2.id,
        },
        // NEW: October 2025 sales orders (current month) - Only pending, paid, cancelled
        {
          customerId: customer1.id,
          orderDate: new Date("2025-10-02T09:15:00Z"),
          totalAmount: 450000,
          status: "paid",
          paymentMethod: "cash",
          salespersonId: staff1.id,
        },
        {
          customerId: customer2.id,
          orderDate: new Date("2025-10-05T14:30:00Z"),
          totalAmount: 680000,
          status: "paid",
          paymentMethod: "bank_transfer",
          salespersonId: staff2.id,
        },
        {
          customerId: customer3.id,
          orderDate: new Date("2025-10-08T11:00:00Z"),
          totalAmount: 320000,
          status: "paid",
          paymentMethod: "mobile_payment",
          salespersonId: staff1.id,
        },
        {
          customerId: customer4.id,
          orderDate: new Date("2025-10-12T16:45:00Z"),
          totalAmount: 1250000,
          status: "paid",
          paymentMethod: "bank_transfer",
          salespersonId: staff3.id,
        },
        {
          customerId: customer1.id,
          orderDate: new Date("2025-10-15T10:20:00Z"),
          totalAmount: 540000,
          status: "paid",
          paymentMethod: "cash",
          salespersonId: staff2.id,
        },
        {
          customerId: customer2.id,
          orderDate: new Date("2025-10-18T13:30:00Z"),
          totalAmount: 890000,
          status: "paid",
          paymentMethod: "mobile_payment",
          salespersonId: staff1.id,
        },
        {
          customerId: customer3.id,
          orderDate: new Date("2025-10-20T09:00:00Z"),
          totalAmount: 420000,
          status: "pending",
          paymentMethod: "cash",
          salespersonId: staff2.id,
        },
        {
          customerId: customer4.id,
          orderDate: new Date("2025-10-22T15:15:00Z"),
          totalAmount: 760000,
          status: "paid",
          paymentMethod: "bank_transfer",
          salespersonId: staff3.id,
        },
        {
          customerId: customer1.id,
          orderDate: new Date("2025-10-25T11:30:00Z"),
          totalAmount: 350000,
          status: "cancelled",
          paymentMethod: "cash",
          salespersonId: staff1.id,
        },
        {
          customerId: customer2.id,
          orderDate: new Date("2025-10-28T14:00:00Z"),
          totalAmount: 920000,
          status: "pending",
          paymentMethod: "mobile_payment",
          salespersonId: staff2.id,
        },
      ])
      .returning();

    // 18. Seed Sales Order Items
    console.log("🛒 Seeding sales order items...");
    await db.insert(salesOrderItems).values([
      // Sale 1 items (June 2024)
      {
        salesOrderId: sale1.id,
        medicationVariantId: medicationVariantsResults[0].id, // Paracetamol 500mg
        quantity: 2,
        unitPrice: 50000,
        totalPrice: 100000,
      },
      {
        salesOrderId: sale1.id,
        medicationVariantId: medicationVariantsResults[5].id, // Ibuprofen 400mg
        quantity: 3,
        unitPrice: 40000,
        totalPrice: 120000,
      },
      // Sale 2 items (June 2024)
      {
        salesOrderId: sale2.id,
        medicationVariantId: medicationVariantsResults[3].id, // Amoxicillin 500mg
        quantity: 4,
        unitPrice: 85000,
        totalPrice: 340000,
      },
      // Sale 3 items (June 2024)
      {
        salesOrderId: sale3.id,
        medicationVariantId: medicationVariantsResults[2].id, // Paracetamol Syrup
        quantity: 2,
        unitPrice: 45000,
        totalPrice: 90000,
      },
      {
        salesOrderId: sale3.id,
        medicationVariantId: medicationVariantsResults[9].id, // Cetirizine 10mg
        quantity: 1,
        unitPrice: 20000,
        totalPrice: 20000,
      },
    ]);

    // 19. Seed Files
    console.log("📁 Seeding files...");
    await db
      .insert(files)
      .values([
        {
          filename: "supplier_contract_pharmacorp.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          fileSize: 2048576, // 2MB
          blob: Buffer.from("Sample PDF file content"),
          uploadedBy: owner.id,
          uploadedAt: new Date("2024-01-01"),
        },
        {
          filename: "medication_certificate_amoxicillin.jpg",
          fileType: "jpg",
          mimeType: "image/jpeg",
          fileSize: 1024768, // 1MB
          blob: Buffer.from("Sample JPEG file content"),
          uploadedBy: staff1.id,
          uploadedAt: new Date("2024-01-15"),
        },
        {
          filename: "monthly_sales_report_may_2024.xlsx",
          fileType: "xlsx",
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          fileSize: 512345, // 0.5MB
          blob: Buffer.from("Sample Excel file content"),
          uploadedBy: owner.id,
          uploadedAt: new Date("2024-06-01"),
        },
      ])
      .returning();

    // 20. Seed Notifications
    console.log("🔔 Seeding notifications...");
    await db.insert(notifications).values([
      {
        userId: owner.id,
        message: `Purchase order PO-${po1.id.substring(0, 8)} has been fully received.`,
        isRead: true,
      },
      {
        userId: staff1.id,
        message:
          "Low stock alert: Ibuprofen 400mg Tablets is below the configured threshold.",
        isRead: false,
      },
      {
        userId: staff2.id,
        message: `New sales order SO-${sale3.id.substring(0, 8)} is pending payment.`,
        isRead: false,
      },
      {
        userId: owner.id,
        message: "The monthly sales summary report for May 2024 is available.",
        isRead: false,
      },
      {
        userId: staff3.id,
        message: `Your user account status has been changed to 'inactive'.`,
        isRead: true,
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
          totalAmount: 18500000,
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
        userId: staff2.id,
        action: "CREATE",
        entity: "sales_order",
        entityId: sale2.id,
        changes: {
          customerId: customer2.id,
          totalAmount: 340000,
          status: "pending",
        },
      },
      {
        userId: staff2.id,
        action: "UPDATE",
        entity: "sales_order",
        entityId: sale2.id,
        changes: {
          status: { from: "pending", to: "paid" },
        },
      },
      {
        userId: owner.id,
        action: "UPDATE",
        entity: "user",
        entityId: staff4.id,
        changes: {
          status: { from: "active", to: "inactive" },
        },
      },
    ]);

    // 23. Seed Reports
    console.log("📊 Seeding reports...");
    await db.insert(reports).values([
      {
        type: "inventory_on_hand",
        reportDate: new Date("2024-06-01T00:00:00Z"),
        data: {
          total_variants: 26,
          total_quantity: 580,
          total_value: 45750000,
        },
        parameters: {
          asOfDate: "2024-06-01",
          includeZeroQuantity: false,
        },
      },
      {
        type: "sales_summary",
        reportDate: new Date("2024-06-15T00:00:00Z"),
        data: {
          total_orders: 5,
          total_revenue: 1295000,
          top_selling_variant: "Amoxicillin 500mg Capsules",
          average_order_value: 259000,
        },
        parameters: {
          startDate: "2024-06-01",
          endDate: "2024-06-14",
        },
      },
      {
        type: "expiry_dates",
        reportDate: new Date("2024-06-15T00:00:00Z"),
        data: {
          expiring_next_90_days: 1,
          expiring_next_180_days: 2,
          total_expiring_value: 15000000,
        },
        parameters: {
          days_threshold: 180,
        },
      },
      {
        type: "low_stock",
        reportDate: new Date("2024-06-15T00:00:00Z"),
        data: {
          low_stock_variants: 3,
          variants_to_reorder: ["Ibuprofen 400mg", "Tramadol 50mg"],
        },
        parameters: {
          threshold_percentage: 20,
        },
      },
    ]);

    // 24. Seed Shifts
    console.log("⏰ Seeding shifts...");
    const [morningShift, afternoonShift, nightShift, fullDayShift] = await db
      .insert(shifts)
      .values([
        {
          name: "Ca sáng",
          shiftType: "morning",
          startTime: "06:00:00",
          endTime: "14:00:00",
          description: "Ca làm việc buổi sáng từ 6:00 đến 14:00",
        },
        {
          name: "Ca chiều",
          shiftType: "afternoon",
          startTime: "14:00:00",
          endTime: "22:00:00",
          description: "Ca làm việc buổi chiều từ 14:00 đến 22:00",
        },
        {
          name: "Ca tối",
          shiftType: "night",
          startTime: "22:00:00",
          endTime: "06:00:00",
          description: "Ca làm việc ban đêm từ 22:00 đến 6:00 sáng hôm sau",
        },
        {
          name: "Ca hành chính",
          shiftType: "full_day",
          startTime: "08:00:00",
          endTime: "17:00:00",
          description: "Ca hành chính toàn thời gian từ 8:00 đến 17:00",
        },
      ])
      .returning();

    // 25. Seed Shift Assignments
    console.log("📅 Seeding shift assignments...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    await db.insert(shiftAssignments).values([
      // Hôm nay
      {
        userId: staff1.id,
        shiftId: morningShift.id,
        assignedDate: today,
        status: "completed",
        checkInTime: new Date(today.setHours(6, 5, 0, 0)),
        checkOutTime: new Date(today.setHours(14, 2, 0, 0)),
        createdBy: owner.id,
      },
      {
        userId: staff2.id,
        shiftId: afternoonShift.id,
        assignedDate: today,
        status: "in_progress",
        checkInTime: new Date(today.setHours(14, 3, 0, 0)),
        createdBy: owner.id,
      },
      {
        userId: staff3.id,
        shiftId: nightShift.id,
        assignedDate: today,
        status: "scheduled",
        createdBy: owner.id,
      },
      // Ngày mai
      {
        userId: staff1.id,
        shiftId: afternoonShift.id,
        assignedDate: tomorrow,
        status: "scheduled",
        createdBy: owner.id,
      },
      {
        userId: staff2.id,
        shiftId: morningShift.id,
        assignedDate: tomorrow,
        status: "confirmed",
        createdBy: owner.id,
      },
      {
        userId: staff3.id,
        shiftId: fullDayShift.id,
        assignedDate: tomorrow,
        status: "scheduled",
        createdBy: owner.id,
      },
      // Ngày kia
      {
        userId: staff1.id,
        shiftId: fullDayShift.id,
        assignedDate: dayAfter,
        status: "scheduled",
        createdBy: owner.id,
      },
      {
        userId: staff2.id,
        shiftId: nightShift.id,
        assignedDate: dayAfter,
        status: "scheduled",
        createdBy: owner.id,
      },
    ]);

    // 26. Seed Settings
    console.log("⚙️ Seeding settings...");
    await db.insert(settings).values([
      {
        key: "pharmacyInfo.name",
        name: "Pharmacy Name",
        group: "pharmacyInfo",
        value: { name: "PharmaFlow Solutions" },
        description: "The official name of the pharmacy business.",
      },
      {
        key: "pharmacyInfo.address",
        name: "Pharmacy Address",
        group: "pharmacyInfo",
        value: {
          address: "123 Health Avenue, Medical District, Ho Chi Minh City",
        },
        description: "The physical address of the main pharmacy branch.",
      },
      {
        key: "pharmacyInfo.phone",
        name: "Pharmacy Phone",
        group: "pharmacyInfo",
        value: { phone: "+84 28 3812 3456" },
        description: "The primary contact phone number for the pharmacy.",
      },
      {
        key: "pharmacyInfo.email",
        name: "Pharmacy Email",
        group: "pharmacyInfo",
        value: { email: "support@pharmaflow.vn" },
        description: "The primary contact email for customer support.",
      },
      {
        key: "reporting.lowStockThreshold",
        name: "Low Stock Threshold",
        group: "reporting",
        value: { lowStockThreshold: 20 },
        description:
          "The inventory quantity below which a medication is considered low stock.",
      },
      {
        key: "reporting.expiryWarningDays",
        name: "Expiry Warning Days",
        group: "reporting",
        value: { expiryWarningDays: 90 },
        description:
          "The number of days before a medication's expiry date to trigger a warning.",
      },
      {
        key: "sales.currency",
        name: "Currency",
        group: "sales",
        value: { currency: "VND" },
        description: "The default currency for all financial transactions.",
      },
      {
        key: "sales.taxRate",
        name: "VAT Rate",
        group: "sales",
        value: { taxRate: 0.05 },
        description:
          "The Value Added Tax (VAT) rate applied to sales (e.g., 0.05 for 5%).",
      },
      {
        key: "system.timezone",
        name: "System Timezone",
        group: "system",
        value: { timezone: "Asia/Ho_Chi_Minh" },
        description: "The timezone for all date and time operations.",
      },
      {
        key: "system.language",
        name: "Default Language",
        group: "system",
        value: { language: "vi" },
        description:
          "The default language for the user interface (e.g., 'en', 'vi').",
      },
    ]);

    console.log("✅ Database seeding completed successfully!");
    console.log(`
    📈 Seeded data summary:
    - Users: 5
    - User Credentials: 5
    - User Registrations: 3
    - Customers: 6
    - Suppliers: 5
    - Medications: 12 (6 with images)
    - Medication Variants: 26
    - Supplier-Medication Links: 14
    - Warehouse Zones: 4
    - Warehouse Racks: 8
    - Warehouse Bins: 192
    - Purchase Orders: 5
    - Purchase Order Items: 11
    - Purchase Order Receipts: 4 (PO1, PO2, PO3, PO4 received)
    - Receipt Items: 9 (from 4 receipts)
    - Inventory Entries: 9 (from all receipts)
    - Sales Orders: 15 (5 from June 2024 + 10 from October 2025)
      * Status: pending, paid, cancelled only
      * October 2025: 10 orders - 8 paid, 1 cancelled, 1 pending
      * Total October Revenue: 7,580,000 VND
      * Total October Revenue: 7,580,000 VND
    - Sales Order Items: 6 (old June 2024 data only - October items removed for simplicity)
    - Files: 3
    - File Attachments: 3
    - Notifications: 5
    - Audit Logs: 5
    - Reports: 4
    - Shifts: 4
    - Shift Assignments: 8
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
