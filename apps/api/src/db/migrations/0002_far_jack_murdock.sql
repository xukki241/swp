ALTER TABLE "purchase_order_receipts" ALTER COLUMN "received_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD COLUMN "purchase_price" numeric(10, 2) NOT NULL;