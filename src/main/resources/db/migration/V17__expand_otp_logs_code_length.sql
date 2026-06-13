-- Increase otp_logs.code length to support SHA-256 hashed OTP values.
-- Defensive checks are included for environments where manual changes may already exist.

SET @otp_code_column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'otp_logs'
      AND COLUMN_NAME = 'code'
);

SET @sql := IF(
    @otp_code_column_exists = 0,
    'ALTER TABLE otp_logs ADD COLUMN code VARCHAR(64) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @otp_code_length := (
    SELECT CHARACTER_MAXIMUM_LENGTH
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'otp_logs'
      AND COLUMN_NAME = 'code'
    LIMIT 1
);

SET @sql := IF(
    @otp_code_length < 64,
    'ALTER TABLE otp_logs MODIFY COLUMN code VARCHAR(64) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
