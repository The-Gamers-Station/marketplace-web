-- Create system_config table for storing application-wide configuration
CREATE TABLE system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    value_type VARCHAR(50) NOT NULL DEFAULT 'STRING', -- STRING, INTEGER, DECIMAL, BOOLEAN, JSON
    description VARCHAR(500),
    is_editable BOOLEAN NOT NULL DEFAULT TRUE,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- GENERAL, SHIPPING, PAYMENT, ORDER, NOTIFICATION, etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on category for faster queries
CREATE INDEX idx_system_config_category ON system_config(category);

-- Insert initial configuration values
INSERT INTO system_config (config_key, config_value, value_type, description, is_editable, category) VALUES
-- Shipping Configuration
('shipping.default_fee', '30.00', 'DECIMAL', 'Default shipping fee in SAR', TRUE, 'SHIPPING'),
('shipping.free_threshold', '500.00', 'DECIMAL', 'Order amount threshold for free shipping', TRUE, 'SHIPPING'),
('shipping.enabled', 'true', 'BOOLEAN', 'Enable/disable shipping', TRUE, 'SHIPPING'),
('shipping.estimated_days_min', '2', 'INTEGER', 'Minimum estimated delivery days', TRUE, 'SHIPPING'),
('shipping.estimated_days_max', '5', 'INTEGER', 'Maximum estimated delivery days', TRUE, 'SHIPPING'),

-- Order/Payment Configuration
('order.service_fee_percent', '4.0', 'DECIMAL', 'Service fee percentage applied to orders', TRUE, 'ORDER'),
('order.min_order_amount', '10.00', 'DECIMAL', 'Minimum order amount in SAR', TRUE, 'ORDER'),
('order.max_order_amount', '50000.00', 'DECIMAL', 'Maximum order amount in SAR', TRUE, 'ORDER'),
('order.auto_cancel_hours', '48', 'INTEGER', 'Hours after which unpaid orders are auto-cancelled', TRUE, 'ORDER'),

-- Waffy Integration
('waffy.enabled', 'true', 'BOOLEAN', 'Enable/disable Waffy escrow integration', TRUE, 'PAYMENT'),
('waffy.return_policy', 'NO_RETURN', 'STRING', 'Default Waffy return policy', TRUE, 'PAYMENT'),
('waffy.contract_type', 'MILESTONE_CONTRACT', 'STRING', 'Default Waffy contract type', FALSE, 'PAYMENT'),

-- Platform Settings
('platform.currency', 'SAR', 'STRING', 'Platform currency code', FALSE, 'GENERAL'),
('platform.country_code', 'SA', 'STRING', 'Platform country code', FALSE, 'GENERAL'),
('platform.phone_prefix', '+966', 'STRING', 'Country phone prefix', FALSE, 'GENERAL'),
('platform.timezone', 'Asia/Riyadh', 'STRING', 'Platform timezone', FALSE, 'GENERAL'),

-- Limits and Restrictions
('product.max_images', '10', 'INTEGER', 'Maximum images per product', TRUE, 'PRODUCT'),
('product.max_title_length', '200', 'INTEGER', 'Maximum product title length', TRUE, 'PRODUCT'),
('product.max_description_length', '5000', 'INTEGER', 'Maximum product description length', TRUE, 'PRODUCT'),
('user.max_active_posts', '50', 'INTEGER', 'Maximum active posts per user', TRUE, 'USER'),

-- Notification Settings
('notification.email_enabled', 'true', 'BOOLEAN', 'Enable email notifications', TRUE, 'NOTIFICATION'),
('notification.sms_enabled', 'true', 'BOOLEAN', 'Enable SMS notifications', TRUE, 'NOTIFICATION'),
('notification.order_status_change', 'true', 'BOOLEAN', 'Notify users on order status change', TRUE, 'NOTIFICATION'),

-- Maintenance
('maintenance.mode', 'false', 'BOOLEAN', 'Enable maintenance mode', TRUE, 'GENERAL'),
('maintenance.message_ar', 'الموقع تحت الصيانة', 'STRING', 'Maintenance message in Arabic', TRUE, 'GENERAL'),
('maintenance.message_en', 'Site under maintenance', 'STRING', 'Maintenance message in English', TRUE, 'GENERAL');
