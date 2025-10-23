-- Add Full-Text Search (FTS) support to all searchable tables
-- This migration adds tsvector columns, GIN indexes, and triggers for automatic FTS updates

-- ====================================================================
-- USERS TABLE
-- ====================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS users_search_vector_idx ON users USING GIN (search_vector);

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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_search_vector_trigger ON users;
CREATE TRIGGER users_search_vector_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION users_search_vector_update();

-- Update existing records
UPDATE users SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(role::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'C')
WHERE search_vector IS NULL;

-- ====================================================================
-- CUSTOMERS TABLE
-- ====================================================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS customers_search_vector_idx ON customers USING GIN (search_vector);

CREATE OR REPLACE FUNCTION customers_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_search_vector_trigger ON customers;
CREATE TRIGGER customers_search_vector_trigger
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION customers_search_vector_update();

-- Update existing records
UPDATE customers SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'C')
WHERE search_vector IS NULL;

-- ====================================================================
-- SUPPLIERS TABLE
-- ====================================================================
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS suppliers_search_vector_idx ON suppliers USING GIN (search_vector);

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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS suppliers_search_vector_trigger ON suppliers;
CREATE TRIGGER suppliers_search_vector_trigger
  BEFORE INSERT OR UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION suppliers_search_vector_update();

-- Update existing records
UPDATE suppliers SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(contact_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'C')
WHERE search_vector IS NULL;

-- ====================================================================
-- MEDICATIONS TABLE
-- ====================================================================
ALTER TABLE medications ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS medications_search_vector_idx ON medications USING GIN (search_vector);

CREATE OR REPLACE FUNCTION medications_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS medications_search_vector_trigger ON medications;
CREATE TRIGGER medications_search_vector_trigger
  BEFORE INSERT OR UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION medications_search_vector_update();

-- Update existing records
UPDATE medications SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(brand, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'D')
WHERE search_vector IS NULL;

-- ====================================================================
-- MEDICATION_VARIANTS TABLE
-- ====================================================================
ALTER TABLE medication_variants ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS medication_variants_search_vector_idx ON medication_variants USING GIN (search_vector);

CREATE OR REPLACE FUNCTION medication_variants_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.barcode, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.unit, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS medication_variants_search_vector_trigger ON medication_variants;
CREATE TRIGGER medication_variants_search_vector_trigger
  BEFORE INSERT OR UPDATE ON medication_variants
  FOR EACH ROW EXECUTE FUNCTION medication_variants_search_vector_update();

-- Update existing records
UPDATE medication_variants SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(sku, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(barcode, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(unit, '')), 'C')
WHERE search_vector IS NULL;

-- ====================================================================
-- INVENTORY TABLE
-- ====================================================================
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS inventory_search_vector_idx ON inventory USING GIN (search_vector);

CREATE OR REPLACE FUNCTION inventory_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.batch_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.manufacture_date::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.expiry_date::text, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_search_vector_trigger ON inventory;
CREATE TRIGGER inventory_search_vector_trigger
  BEFORE INSERT OR UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION inventory_search_vector_update();

-- Update existing records
UPDATE inventory SET search_vector = 
  setweight(to_tsvector('english', COALESCE(batch_number, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(manufacture_date::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(expiry_date::text, '')), 'B')
WHERE search_vector IS NULL;

-- ====================================================================
-- PURCHASE_ORDERS TABLE
-- ====================================================================
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS purchase_orders_search_vector_idx ON purchase_orders USING GIN (search_vector);

CREATE OR REPLACE FUNCTION purchase_orders_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.id::text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.order_date::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.expected_date::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS purchase_orders_search_vector_trigger ON purchase_orders;
CREATE TRIGGER purchase_orders_search_vector_trigger
  BEFORE INSERT OR UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION purchase_orders_search_vector_update();

-- Update existing records
UPDATE purchase_orders SET search_vector = 
  setweight(to_tsvector('english', COALESCE(id::text, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(order_date::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(expected_date::text, '')), 'C')
WHERE search_vector IS NULL;

-- ====================================================================
-- SALES_ORDERS TABLE
-- ====================================================================
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS sales_orders_search_vector_idx ON sales_orders USING GIN (search_vector);

CREATE OR REPLACE FUNCTION sales_orders_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.id::text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.status::text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.payment_method::text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.order_date::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sales_orders_search_vector_trigger ON sales_orders;
CREATE TRIGGER sales_orders_search_vector_trigger
  BEFORE INSERT OR UPDATE ON sales_orders
  FOR EACH ROW EXECUTE FUNCTION sales_orders_search_vector_update();

-- Update existing records
UPDATE sales_orders SET search_vector = 
  setweight(to_tsvector('english', COALESCE(id::text, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(status::text, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(payment_method::text, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(order_date::text, '')), 'C')
WHERE search_vector IS NULL;

-- ====================================================================
-- WAREHOUSE_ZONES TABLE
-- ====================================================================
ALTER TABLE warehouse_zones ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS warehouse_zones_search_vector_idx ON warehouse_zones USING GIN (search_vector);

CREATE OR REPLACE FUNCTION warehouse_zones_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS warehouse_zones_search_vector_trigger ON warehouse_zones;
CREATE TRIGGER warehouse_zones_search_vector_trigger
  BEFORE INSERT OR UPDATE ON warehouse_zones
  FOR EACH ROW EXECUTE FUNCTION warehouse_zones_search_vector_update();

-- Update existing records
UPDATE warehouse_zones SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C')
WHERE search_vector IS NULL;

-- ====================================================================
-- WAREHOUSE_RACKS TABLE
-- ====================================================================
ALTER TABLE warehouse_racks ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS warehouse_racks_search_vector_idx ON warehouse_racks USING GIN (search_vector);

CREATE OR REPLACE FUNCTION warehouse_racks_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS warehouse_racks_search_vector_trigger ON warehouse_racks;
CREATE TRIGGER warehouse_racks_search_vector_trigger
  BEFORE INSERT OR UPDATE ON warehouse_racks
  FOR EACH ROW EXECUTE FUNCTION warehouse_racks_search_vector_update();

-- Update existing records
UPDATE warehouse_racks SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C')
WHERE search_vector IS NULL;

-- ====================================================================
-- WAREHOUSE_BINS TABLE
-- ====================================================================
ALTER TABLE warehouse_bins ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS warehouse_bins_search_vector_idx ON warehouse_bins USING GIN (search_vector);

CREATE OR REPLACE FUNCTION warehouse_bins_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS warehouse_bins_search_vector_trigger ON warehouse_bins;
CREATE TRIGGER warehouse_bins_search_vector_trigger
  BEFORE INSERT OR UPDATE ON warehouse_bins
  FOR EACH ROW EXECUTE FUNCTION warehouse_bins_search_vector_update();

-- Update existing records
UPDATE warehouse_bins SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C')
WHERE search_vector IS NULL;

