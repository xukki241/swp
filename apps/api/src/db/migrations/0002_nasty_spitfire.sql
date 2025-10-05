CREATE TYPE "public"."supplier_status" AS ENUM('active', 'inactive', 'blacklisted');--> statement-breakpoint
CREATE TABLE "supplier_medication_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer NOT NULL,
	"medication_variant_id" integer NOT NULL,
	"supplier_sku" varchar(50),
	"lead_time_days" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"contact_name" varchar(100),
	"email" varchar(255),
	"phone" varchar(10),
	"address" text,
	"status" "supplier_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "supplier_medication_variants_supplier_id_medication_variant_id_index" ON "supplier_medication_variants" USING btree ("supplier_id","medication_variant_id");--> statement-breakpoint
CREATE INDEX "supplier_medication_variants_supplier_id_index" ON "supplier_medication_variants" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_medication_variants_medication_variant_id_index" ON "supplier_medication_variants" USING btree ("medication_variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_email_index" ON "suppliers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_phone_index" ON "suppliers" USING btree ("phone");