-- Add slug column to posts for SEO-friendly ad URLs.
-- This migration is written defensively to avoid failures if parts were applied manually in non-prod environments.

SET @slug_column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'posts'
      AND COLUMN_NAME = 'slug'
);

SET @sql := IF(
    @slug_column_exists = 0,
    'ALTER TABLE posts ADD COLUMN slug VARCHAR(320) NULL AFTER title',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill any missing slug values for existing records.
UPDATE posts
SET slug = CONCAT('legacy-ad-', id)
WHERE slug IS NULL OR slug = '';

-- Enforce NOT NULL once data is backfilled.
SET @slug_is_nullable := (
    SELECT IS_NULLABLE = 'YES'
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'posts'
      AND COLUMN_NAME = 'slug'
    LIMIT 1
);

SET @sql := IF(
    @slug_is_nullable = 1,
    'ALTER TABLE posts MODIFY COLUMN slug VARCHAR(320) NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure unique index exists for slug lookups and uniqueness guarantees.
SET @slug_index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'posts'
      AND INDEX_NAME = 'ux_posts_slug'
);

SET @sql := IF(
    @slug_index_exists = 0,
    'CREATE UNIQUE INDEX ux_posts_slug ON posts (slug)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
