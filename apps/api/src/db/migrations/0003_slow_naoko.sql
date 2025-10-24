ALTER TABLE "file_attachments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "file_attachments" CASCADE;--> statement-breakpoint
ALTER TABLE "files" RENAME COLUMN "storage_path" TO "blob";--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "blob" SET DATA TYPE bytea USING blob::bytea;--> statement-breakpoint
ALTER TABLE "medications" ADD COLUMN "image_id" uuid;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "prescription_id" uuid;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD COLUMN "contract_id" uuid;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_image_id_files_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_prescription_id_files_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier_medication_variants" ADD CONSTRAINT "supplier_medication_variants_contract_id_files_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE cascade;