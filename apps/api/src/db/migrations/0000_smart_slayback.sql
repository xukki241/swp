CREATE TYPE "public"."medication_status" AS ENUM('active', 'inactive', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('pending', 'ordered', 'received', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('inventory', 'sales', 'purchase', 'custom');--> statement-breakpoint
CREATE TYPE "public"."sales_order_payment_method" AS ENUM('cash', 'bank_transfer', 'credit_card', 'mobile_payment');--> statement-breakpoint
CREATE TYPE "public"."sales_order_status" AS ENUM('pending', 'paid', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('active', 'inactive', 'blacklisted');--> statement-breakpoint
CREATE TYPE "public"."user_registration_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'staff');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."warehouse_zone_type" AS ENUM('normal', 'cold', 'hazard', 'quarantine');--> statement-breakpoint
CREATE TYPE "public"."reset_method" AS ENUM('email', 'sms');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity" varchar(100) NOT NULL,
	"entity_id" uuid,
	"changes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(10),
	"address" text
);
--> statement-breakpoint
CREATE TABLE "file_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"uploaded_by" uuid,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medication_variant_id" uuid NOT NULL,
	"purchase_order_receipt_items_id" uuid NOT NULL,
	"bin_id" uuid NOT NULL,
	"batch_number" varchar(100) NOT NULL,
	"manufacture_date" date,
	"expiry_date" date,
	"quantity" double precision NOT NULL,
	"quantity_reserved" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"brand" varchar(100),
	"description" text,
	"is_prescription_required" boolean DEFAULT false NOT NULL,
	"is_controlled_substance" boolean DEFAULT false NOT NULL,
	"status" "medication_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medication_id" uuid NOT NULL,
	"sku" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"unit_factor" double precision DEFAULT 1 NOT NULL,
	"barcode" varchar(50),
	"sell_price" double precision NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_for_sale" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"supplier_medication_variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" double precision NOT NULL,
	"total_price" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_receipt_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_receipt_id" uuid NOT NULL,
	"purchase_order_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"received_date" timestamp DEFAULT now() NOT NULL,
	"received_by" uuid
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"expected_date" timestamp,
	"status" "purchase_order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" double precision DEFAULT 0 NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "report_type" NOT NULL,
	"report_date" timestamp DEFAULT now() NOT NULL,
	"data" jsonb NOT NULL,
	"parameters" jsonb
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sales_order_id" uuid NOT NULL,
	"medication_variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" double precision NOT NULL,
	"total_price" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"total_amount" double precision DEFAULT 0 NOT NULL,
	"status" "sales_order_status" DEFAULT 'pending' NOT NULL,
	"payment_method" "sales_order_payment_method" DEFAULT 'cash' NOT NULL,
	"salesperson_id" uuid
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"group" varchar(100) DEFAULT 'general' NOT NULL,
	"value" jsonb NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "supplier_medication_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"medication_variant_id" uuid NOT NULL,
	"supplier_sku" varchar(50),
	"lead_time_days" integer
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"contact_name" varchar(100),
	"email" varchar(255),
	"phone" varchar(10),
	"address" text,
	"status" "supplier_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"secret" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(10) NOT NULL,
	"address" text NOT NULL,
	"password" varchar(255) NOT NULL,
	"status" "user_registration_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(10),
	"address" text,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"role" "user_role" DEFAULT 'staff' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(6) NOT NULL,
	"method" "reset_method" DEFAULT 'email' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_bins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rack_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"level" integer NOT NULL,
	"number" integer NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "warehouse_racks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zone_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "warehouse_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "warehouse_zone_type" DEFAULT 'normal' NOT NULL,
	"location" text,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_purchase_order_receipt_items_id_purchase_order_receipt_items_id_fk" FOREIGN KEY ("purchase_order_receipt_items_id") REFERENCES "public"."purchase_order_receipt_items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_bin_id_warehouse_bins_id_fk" FOREIGN KEY ("bin_id") REFERENCES "public"."warehouse_bins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medication_variants" ADD CONSTRAINT "medication_variants_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_supplier_medication_variant_id_supplier_medication_variants_id_fk" FOREIGN KEY ("supplier_medication_variant_id") REFERENCES "public"."supplier_medication_variants"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_receipt_items" ADD CONSTRAINT "purchase_order_receipt_items_purchase_order_receipt_id_purchase_order_receipts_id_fk" FOREIGN KEY ("purchase_order_receipt_id") REFERENCES "public"."purchase_order_receipts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_receipt_items" ADD CONSTRAINT "purchase_order_receipt_items_purchase_order_item_id_purchase_order_items_id_fk" FOREIGN KEY ("purchase_order_item_id") REFERENCES "public"."purchase_order_items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_receipts" ADD CONSTRAINT "purchase_order_receipts_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_order_receipts" ADD CONSTRAINT "purchase_order_receipts_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD CONSTRAINT "supplier_medication_variants_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD CONSTRAINT "supplier_medication_variants_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "warehouse_bins" ADD CONSTRAINT "warehouse_bins_rack_id_warehouse_racks_id_fk" FOREIGN KEY ("rack_id") REFERENCES "public"."warehouse_racks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "warehouse_racks" ADD CONSTRAINT "warehouse_racks_zone_id_warehouse_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."warehouse_zones"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_unique" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_phone_unique" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "file_attachments_file_id_entity_type_entity_id_unique" ON "file_attachments" USING btree ("file_id","entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_medication_variant_id_bin_id_batch_number_unique" ON "inventory" USING btree ("medication_variant_id","bin_id","batch_number");--> statement-breakpoint
CREATE UNIQUE INDEX "medication_variants_sku_unique" ON "medication_variants" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "medication_variants_barcode_unique" ON "medication_variants" USING btree ("barcode");--> statement-breakpoint
CREATE UNIQUE INDEX "settings_key_unique" ON "settings" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_medication_variants_supplier_id_medication_variant_id_unique" ON "supplier_medication_variants" USING btree ("supplier_id","medication_variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_email_unique" ON "suppliers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_phone_unique" ON "suppliers" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "user_credentials_user_id_provider_unique" ON "user_credentials" USING btree ("user_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "user_registrations_email_unique" ON "user_registrations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_registrations_phone_unique" ON "user_registrations" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_unique" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_bins_rack_id_code_unique" ON "warehouse_bins" USING btree ("rack_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_bins_rack_id_level_number_unique" ON "warehouse_bins" USING btree ("rack_id","level","number");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_racks_zone_id_code_unique" ON "warehouse_racks" USING btree ("zone_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouse_zones_code_unique" ON "warehouse_zones" USING btree ("code");