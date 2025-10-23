-- Fix blob column type from text to bytea
ALTER TABLE "files" ALTER COLUMN "blob" TYPE bytea USING blob::bytea;
