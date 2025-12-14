-- Add image_url column to sweets table
ALTER TABLE sweets ADD COLUMN IF NOT EXISTS image_url TEXT;

