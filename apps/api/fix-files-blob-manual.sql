-- Migration to fix the files table blob column type
-- Run this manually if drizzle-kit migrate doesn't work

-- Step 1: Check current column type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'files' AND column_name = 'blob';

-- Step 2: If it's 'text', convert to bytea
-- WARNING: This will fail if there's any existing data in the blob column
-- that cannot be converted to bytea
ALTER TABLE files ALTER COLUMN blob TYPE bytea USING blob::bytea;

-- Step 3: Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'files' AND column_name = 'blob';
