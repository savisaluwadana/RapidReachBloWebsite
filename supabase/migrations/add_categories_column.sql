-- Migration: Add `categories` array column to posts table
-- Run this in the Supabase SQL Editor to fix multi-category support.

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Backfill: populate categories from the existing single `category` field
UPDATE posts
SET categories = ARRAY[category::TEXT]
WHERE categories = '{}' OR categories IS NULL;

-- Optional: add GIN index for array lookups
CREATE INDEX IF NOT EXISTS idx_posts_categories ON posts USING GIN(categories);
