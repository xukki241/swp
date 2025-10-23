-- Add search_vector columns
ALTER TABLE "customers" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "medications" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "medication_variants" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "warehouse_bins" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "warehouse_racks" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "warehouse_zones" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint

-- Create GIN indexes for FTS
CREATE INDEX "customers_search_vector_idx" ON "customers" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "inventory_search_vector_idx" ON "inventory" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "medications_search_vector_idx" ON "medications" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "medication_variants_search_vector_idx" ON "medication_variants" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "purchase_orders_search_vector_idx" ON "purchase_orders" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "sales_orders_search_vector_idx" ON "sales_orders" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "suppliers_search_vector_idx" ON "suppliers" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "users_search_vector_idx" ON "users" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "warehouse_bins_search_vector_idx" ON "warehouse_bins" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "warehouse_racks_search_vector_idx" ON "warehouse_racks" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "warehouse_zones_search_vector_idx" ON "warehouse_zones" USING gin ("search_vector");--> statement-breakpoint

-- ==================================================================
-- FTS TRIGGER FUNCTIONS AND TRIGGERS
-- ==================================================================

-- USERS
CREATE OR REPLACE FUNCTION users_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.role::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER users_search_vector_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION users_search_vector_update();--> statement-breakpoint

-- CUSTOMERS
CREATE OR REPLACE FUNCTION customers_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER customers_search_vector_trigger
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION customers_search_vector_update();--> statement-breakpoint

-- SUPPLIERS
CREATE OR REPLACE FUNCTION suppliers_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.contact_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER suppliers_search_vector_trigger
  BEFORE INSERT OR UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION suppliers_search_vector_update();--> statement-breakpoint

-- MEDICATIONS
CREATE OR REPLACE FUNCTION medications_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER medications_search_vector_trigger
  BEFORE INSERT OR UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION medications_search_vector_update();--> statement-breakpoint

-- MEDICATION_VARIANTS
CREATE OR REPLACE FUNCTION medication_variants_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.barcode, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.unit, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER medication_variants_search_vector_trigger
  BEFORE INSERT OR UPDATE ON medication_variants
  FOR EACH ROW EXECUTE FUNCTION medication_variants_search_vector_update();--> statement-breakpoint

-- INVENTORY
CREATE OR REPLACE FUNCTION inventory_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.batch_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.manufacture_date::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.expiry_date::text, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER inventory_search_vector_trigger
  BEFORE INSERT OR UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION inventory_search_vector_update();--> statement-breakpoint

-- PURCHASE_ORDERS
CREATE OR REPLACE FUNCTION purchase_orders_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.id::text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.order_date::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.expected_date::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER purchase_orders_search_vector_trigger
  BEFORE INSERT OR UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION purchase_orders_search_vector_update();--> statement-breakpoint

-- SALES_ORDERS
CREATE OR REPLACE FUNCTION sales_orders_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.id::text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.payment_method::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.order_date::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER sales_orders_search_vector_trigger
  BEFORE INSERT OR UPDATE ON sales_orders
  FOR EACH ROW EXECUTE FUNCTION sales_orders_search_vector_update();--> statement-breakpoint

-- WAREHOUSE_ZONES
CREATE OR REPLACE FUNCTION warehouse_zones_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER warehouse_zones_search_vector_trigger
  BEFORE INSERT OR UPDATE ON warehouse_zones
  FOR EACH ROW EXECUTE FUNCTION warehouse_zones_search_vector_update();--> statement-breakpoint

-- WAREHOUSE_RACKS
CREATE OR REPLACE FUNCTION warehouse_racks_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER warehouse_racks_search_vector_trigger
  BEFORE INSERT OR UPDATE ON warehouse_racks
  FOR EACH ROW EXECUTE FUNCTION warehouse_racks_search_vector_update();--> statement-breakpoint

-- WAREHOUSE_BINS
CREATE OR REPLACE FUNCTION warehouse_bins_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER warehouse_bins_search_vector_trigger
  BEFORE INSERT OR UPDATE ON warehouse_bins
  FOR EACH ROW EXECUTE FUNCTION warehouse_bins_search_vector_update();--> statement-breakpoint

-- ==================================================================
-- BACKFILL EXISTING DATA
-- ==================================================================

-- Backfill users
UPDATE users SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(role::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'C')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill customers
UPDATE customers SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'C')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill suppliers
UPDATE suppliers SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(contact_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'C')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill medications
UPDATE medications SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(brand, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'D')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill medication_variants
UPDATE medication_variants SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(sku, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(barcode, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(unit, '')), 'C')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill inventory
UPDATE inventory SET search_vector = 
  setweight(to_tsvector('english', COALESCE(batch_number, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(manufacture_date::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(expiry_date::text, '')), 'B')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill purchase_orders
UPDATE purchase_orders SET search_vector = 
  setweight(to_tsvector('english', COALESCE(id::text, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(order_date::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(expected_date::text, '')), 'C')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill sales_orders
UPDATE sales_orders SET search_vector = 
  setweight(to_tsvector('english', COALESCE(id::text, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(payment_method::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(order_date::text, '')), 'C')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill warehouse_zones
UPDATE warehouse_zones SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill warehouse_racks
UPDATE warehouse_racks SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C')
WHERE search_vector IS NULL;--> statement-breakpoint

-- Backfill warehouse_bins
UPDATE warehouse_bins SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C')
WHERE search_vector IS NULL;
