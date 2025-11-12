-- First, drop the default constraint and convert to text
ALTER TABLE "sales_orders" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DATA TYPE text USING "status"::text;--> statement-breakpoint
UPDATE "sales_orders" SET "status" = 'paid' WHERE "status" IS NOT NULL;--> statement-breakpoint
UPDATE "sales_orders" SET "status" = 'paid' WHERE "status" IS NULL;--> statement-breakpoint
DROP TYPE "public"."sales_order_status" CASCADE;--> statement-breakpoint
CREATE TYPE "public"."sales_order_status" AS ENUM('paid');--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DATA TYPE "public"."sales_order_status" USING "status"::"public"."sales_order_status";--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DEFAULT 'paid'::"public"."sales_order_status";--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET NOT NULL;