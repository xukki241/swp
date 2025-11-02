ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
-- Migrate 'delivered' status to 'paid' since we're removing 'delivered' from the enum
UPDATE "sales_orders" SET "status" = 'paid' WHERE "status" = 'delivered';--> statement-breakpoint
DROP TYPE "public"."sales_order_status";--> statement-breakpoint
CREATE TYPE "public"."sales_order_status" AS ENUM('pending', 'paid', 'cancelled');--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."sales_order_status";--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DATA TYPE "public"."sales_order_status" USING "status"::"public"."sales_order_status";