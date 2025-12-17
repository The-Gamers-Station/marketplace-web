-- Add social media fields to users table
ALTER TABLE users 
ADD COLUMN profile_image VARCHAR(500),
ADD COLUMN background_image VARCHAR(500),
ADD COLUMN facebook_link VARCHAR(200),
ADD COLUMN twitter_link VARCHAR(200),
ADD COLUMN instagram_link VARCHAR(200),
ADD COLUMN youtube_link VARCHAR(200),
ADD COLUMN linkedin_link VARCHAR(200),
ADD COLUMN github_link VARCHAR(200),
ADD COLUMN website_link VARCHAR(200);