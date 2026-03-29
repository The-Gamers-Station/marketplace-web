package com.thegamersstation.marketplace.sysconfig;

import lombok.Getter;

/**
 * Enum for type-safe configuration keys
 */
@Getter
public enum ConfigKey {
    
    // Shipping Configuration
    SHIPPING_DEFAULT_FEE("shipping.default_fee", "30.00"),
    SHIPPING_FREE_THRESHOLD("shipping.free_threshold", "500.00"),
    SHIPPING_ENABLED("shipping.enabled", "true"),
    SHIPPING_ESTIMATED_DAYS_MIN("shipping.estimated_days_min", "2"),
    SHIPPING_ESTIMATED_DAYS_MAX("shipping.estimated_days_max", "5"),
    
    // Order/Payment Configuration
    ORDER_SERVICE_FEE_PERCENT("order.service_fee_percent", "4.0"),
    ORDER_MIN_AMOUNT("order.min_order_amount", "10.00"),
    ORDER_MAX_AMOUNT("order.max_order_amount", "50000.00"),
    ORDER_AUTO_CANCEL_HOURS("order.auto_cancel_hours", "48"),
    
    // Waffy Integration
    WAFFY_ENABLED("waffy.enabled", "true"),
    WAFFY_RETURN_POLICY("waffy.return_policy", "NO_RETURN"),
    WAFFY_CONTRACT_TYPE("waffy.contract_type", "MILESTONE_CONTRACT"),
    
    // Platform Settings
    PLATFORM_CURRENCY("platform.currency", "SAR"),
    PLATFORM_COUNTRY_CODE("platform.country_code", "SA"),
    PLATFORM_PHONE_PREFIX("platform.phone_prefix", "+966"),
    PLATFORM_TIMEZONE("platform.timezone", "Asia/Riyadh"),
    
    // Product Limits
    PRODUCT_MAX_IMAGES("product.max_images", "10"),
    PRODUCT_MAX_TITLE_LENGTH("product.max_title_length", "200"),
    PRODUCT_MAX_DESCRIPTION_LENGTH("product.max_description_length", "5000"),
    
    // User Limits
    USER_MAX_ACTIVE_POSTS("user.max_active_posts", "50"),
    
    // Notifications
    NOTIFICATION_EMAIL_ENABLED("notification.email_enabled", "true"),
    NOTIFICATION_SMS_ENABLED("notification.sms_enabled", "true"),
    NOTIFICATION_ORDER_STATUS_CHANGE("notification.order_status_change", "true"),
    
    // Maintenance
    MAINTENANCE_MODE("maintenance.mode", "false"),
    MAINTENANCE_MESSAGE_AR("maintenance.message_ar", "الموقع تحت الصيانة"),
    MAINTENANCE_MESSAGE_EN("maintenance.message_en", "Site under maintenance");
    
    private final String key;
    private final String defaultValue;
    
    ConfigKey(String key, String defaultValue) {
        this.key = key;
        this.defaultValue = defaultValue;
    }
}
