ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_medication_variant_id_medication_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_purchase_order_receipt_items_id_purchase_order_receipt_items_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_bin_id_warehouse_bins_id_fk";
--> statement-breakpoint
ALTER TABLE "medications" DROP CONSTRAINT "medications_image_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "medication_variants" DROP CONSTRAINT "medication_variants_medication_id_medications_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_supplier_medication_variant_id_supplier_medication_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order_receipt_items" DROP CONSTRAINT "purchase_order_receipt_items_purchase_order_receipt_id_purchase_order_receipts_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order_receipt_items" DROP CONSTRAINT "purchase_order_receipt_items_purchase_order_item_id_purchase_order_items_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order_receipts" DROP CONSTRAINT "purchase_order_receipts_purchase_order_id_purchase_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order_receipts" DROP CONSTRAINT "purchase_order_receipts_received_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sales_order_items" DROP CONSTRAINT "sales_order_items_sales_order_id_sales_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "sales_order_items" DROP CONSTRAINT "sales_order_items_medication_variant_id_medication_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_customer_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_salesperson_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_prescription_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "shift_assignments" DROP CONSTRAINT "shift_assignments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "shift_assignments" DROP CONSTRAINT "shift_assignments_shift_id_shifts_id_fk";
--> statement-breakpoint
ALTER TABLE "shift_assignments" DROP CONSTRAINT "shift_assignments_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" DROP CONSTRAINT "supplier_medication_variants_supplier_id_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" DROP CONSTRAINT "supplier_medication_variants_medication_variant_id_medication_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" DROP CONSTRAINT "supplier_medication_variants_contract_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "warehouse_bins" DROP CONSTRAINT "warehouse_bins_rack_id_warehouse_racks_id_fk";
--> statement-breakpoint
ALTER TABLE "warehouse_racks" DROP CONSTRAINT "warehouse_racks_zone_id_warehouse_zones_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_purchase_order_receipt_items_id_purchase_order_receipt_items_id_fk" FOREIGN KEY ("purchase_order_receipt_items_id") REFERENCES "public"."purchase_order_receipt_items"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_bin_id_warehouse_bins_id_fk" FOREIGN KEY ("bin_id") REFERENCES "public"."warehouse_bins"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_image_id_files_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medication_variants" ADD CONSTRAINT "medication_variants_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_supplier_medication_variant_id_supplier_medication_variants_id_fk" FOREIGN KEY ("supplier_medication_variant_id") REFERENCES "public"."supplier_medication_variants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_receipt_items" ADD CONSTRAINT "purchase_order_receipt_items_purchase_order_receipt_id_purchase_order_receipts_id_fk" FOREIGN KEY ("purchase_order_receipt_id") REFERENCES "public"."purchase_order_receipts"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_receipt_items" ADD CONSTRAINT "purchase_order_receipt_items_purchase_order_item_id_purchase_order_items_id_fk" FOREIGN KEY ("purchase_order_item_id") REFERENCES "public"."purchase_order_items"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_receipts" ADD CONSTRAINT "purchase_order_receipts_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_receipts" ADD CONSTRAINT "purchase_order_receipts_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_prescription_id_files_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD CONSTRAINT "supplier_medication_variants_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD CONSTRAINT "supplier_medication_variants_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD CONSTRAINT "supplier_medication_variants_contract_id_files_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "warehouse_bins" ADD CONSTRAINT "warehouse_bins_rack_id_warehouse_racks_id_fk" FOREIGN KEY ("rack_id") REFERENCES "public"."warehouse_racks"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "warehouse_racks" ADD CONSTRAINT "warehouse_racks_zone_id_warehouse_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."warehouse_zones"("id") ON DELETE restrict ON UPDATE cascade;