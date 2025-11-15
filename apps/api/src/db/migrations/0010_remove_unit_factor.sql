-- Remove unitFactor column from medication_variants table as it's not used
-- All quantity tracking is now done directly in the variant's unit
ALTER TABLE "medication_variants" DROP COLUMN "unit_factor";
