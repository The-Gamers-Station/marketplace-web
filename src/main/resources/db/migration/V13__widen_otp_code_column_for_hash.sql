-- OTP codes are now stored as SHA-256 hashes (64 hex chars) instead of plaintext.
ALTER TABLE otp_logs MODIFY COLUMN code VARCHAR(64);
