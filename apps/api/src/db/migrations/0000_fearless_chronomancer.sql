CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending_verification', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."medication_status" AS ENUM('active', 'inactive', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('active', 'inactive', 'blacklisted');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('draft', 'submitted', 'partially_received', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."inventory_transaction_type" AS ENUM('purchase', 'sale', 'adjustment', 'return');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('retail', 'wholesale');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'credit_card', 'insurance', 'other');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('pending', 'completed', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"status" "user_status" DEFAULT 'active',
	"role_id" bigint NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_credentials" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_credentials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"provider" varchar(100) NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"secret_hash" varchar(255) NOT NULL,
	CONSTRAINT "user_credentials_user_id_provider_unique" UNIQUE("user_id","provider"),
	CONSTRAINT "user_credentials_provider_identifier_unique" UNIQUE("provider","identifier")
);
--> statement-breakpoint
CREATE TABLE "user_registrations" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"password_hash" varchar(255) NOT NULL,
	"registration_date" timestamp with time zone DEFAULT now(),
	"status" "registration_status" DEFAULT 'pending_verification',
	CONSTRAINT "user_registrations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "medications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"brand" varchar(255),
	"description" text,
	"status" "medication_status" DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "medication_variants" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "medication_variants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"medication_id" bigint NOT NULL,
	"sku" varchar(100) NOT NULL,
	"unit_conversion_factor" integer DEFAULT 1,
	"barcode" varchar(100),
	"price" numeric(10, 2) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "medication_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "medication_variants_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "suppliers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"address" text,
	"status" "supplier_status" DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "supplier_medication_variants" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplier_medication_variants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"supplier_id" bigint NOT NULL,
	"medication_variant_id" bigint NOT NULL,
	"supplier_sku" varchar(100),
	"lead_time_days" integer,
	"cost_price" numeric(10, 2) NOT NULL,
	CONSTRAINT "supplier_medication_variants_supplier_id_medication_variant_id_unique" UNIQUE("supplier_id","medication_variant_id")
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "purchase_orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"supplier_id" bigint NOT NULL,
	"order_date" timestamp DEFAULT now(),
	"expected_delivery_date" date,
	"status" "purchase_order_status" DEFAULT 'draft',
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "purchase_order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"purchase_order_id" bigint NOT NULL,
	"medication_variant_id" bigint NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"received_quantity" integer DEFAULT 0,
	CONSTRAINT "purchase_order_items_purchase_order_id_medication_variant_id_unique" UNIQUE("purchase_order_id","medication_variant_id")
);
--> statement-breakpoint
CREATE TABLE "inventory_levels" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_levels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"lot_id" bigint,
	"quantity_on_hand" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "inventory_lots" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_lots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"medication_variant_id" bigint NOT NULL,
	"lot_number" varchar(100) NOT NULL,
	"expiration_date" date,
	"received_date" timestamp DEFAULT now(),
	CONSTRAINT "inventory_lots_medication_variant_id_lot_number_unique" UNIQUE("medication_variant_id","lot_number")
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"lot_id" bigint,
	"transaction_type" "inventory_transaction_type" NOT NULL,
	"quantity_changed" integer NOT NULL,
	"transaction_date" timestamp DEFAULT now(),
	"reference" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "customer_type" DEFAULT 'retail',
	"name" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"tax_id" varchar(100),
	"email" varchar(255),
	"phone" varchar(20),
	"address" text,
	CONSTRAINT "customers_email_unique" UNIQUE("email"),
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"customer_id" bigint,
	"sale_date" timestamp DEFAULT now(),
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_reference" varchar(255),
	"status" "sale_status" DEFAULT 'pending',
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sale_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"sale_id" bigint NOT NULL,
	"medication_variant_id" bigint NOT NULL,
	"lot_id" bigint,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	CONSTRAINT "sale_items_sale_id_medication_variant_id_lot_id_unique" UNIQUE("sale_id","medication_variant_id","lot_id")
);
--> statement-breakpoint
CREATE TABLE "reports_daily" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reports_daily_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"report_date" date NOT NULL,
	"sales_summary" jsonb,
	"inventory_values" jsonb,
	"low_stock_items_alert" jsonb,
	"expiring_lots_alert" jsonb,
	CONSTRAINT "reports_daily_report_date_unique" UNIQUE("report_date")
);
--> statement-breakpoint
CREATE TABLE "reports_monthly" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reports_monthly_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"month_start_date" date NOT NULL,
	"sales_summary" jsonb,
	CONSTRAINT "reports_monthly_month_start_date_unique" UNIQUE("month_start_date")
);
--> statement-breakpoint
CREATE TABLE "reports_weekly" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reports_weekly_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"week_start_date" date NOT NULL,
	"sales_summary" jsonb,
	"product_performance" jsonb,
	CONSTRAINT "reports_weekly_week_start_date_unique" UNIQUE("week_start_date")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_variants" ADD CONSTRAINT "medication_variants_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD CONSTRAINT "supplier_medication_variants_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD CONSTRAINT "supplier_medication_variants_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_lot_id_inventory_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."inventory_lots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_lot_id_inventory_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."inventory_lots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_medication_variant_id_medication_variants_id_fk" FOREIGN KEY ("medication_variant_id") REFERENCES "public"."medication_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_lot_id_inventory_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."inventory_lots"("id") ON DELETE set null ON UPDATE no action;