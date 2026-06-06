-- Add refreshed_at column to posts table for post refresh/bump feature
ALTER TABLE posts ADD COLUMN refreshed_at DATETIME NULL;

-- Initialize refreshed_at with created_at for existing posts so sorting works correctly
UPDATE posts SET refreshed_at = created_at WHERE refreshed_at IS NULL;
