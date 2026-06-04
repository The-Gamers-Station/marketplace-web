-- Add verification attempt counter to prevent OTP brute-force attacks
ALTER TABLE otp_logs ADD COLUMN verification_attempts INT NOT NULL DEFAULT 0;
