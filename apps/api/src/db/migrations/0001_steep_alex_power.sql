CREATE TYPE "public"."medication_status" AS ENUM('active', 'inactive', 'discontinued');
--> statement-breakpoint
CREATE TABLE "medication_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"medication_id" integer NOT NULL,
	"sku" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"unit_factor" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"quantity_factor" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"barcode" varchar(50),
	"retail_price" numeric(10, 2) NOT NULL,
	"wholesale_price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"brand" varchar(100),
	"description" text,
	"status" "medication_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "medication_variants_sku_index" ON "medication_variants" USING btree ("sku");
--> statement-breakpoint
CREATE UNIQUE INDEX "medication_variants_barcode_index" ON "medication_variants" USING btree ("barcode");
--> statement-breakpoint
CREATE INDEX "medication_variants_medication_id_index" ON "medication_variants" USING btree ("medication_id");
--> statement-breakpoint
CREATE INDEX "medications_name_index" ON "medications" USING btree ("name");