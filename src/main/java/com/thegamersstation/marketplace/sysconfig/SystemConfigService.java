package com.thegamersstation.marketplace.sysconfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing system-wide configuration
 */
@Service
@RequiredArgsConstructor
@Slf4j
@EnableCaching
public class SystemConfigService {
    
    private final SystemConfigRepository repository;
    
    /**
     * Get configuration value as String with caching
     */
    @Cacheable(value = "systemConfig", key = "#configKey.key")
    public String getString(ConfigKey configKey) {
        return repository.findById(configKey.getKey())
                .map(SystemConfig::getConfigValue)
                .orElse(configKey.getDefaultValue());
    }
    
    /**
     * Get configuration value as String by key string
     */
    @Cacheable(value = "systemConfig", key = "#key")
    public String getString(String key, String defaultValue) {
        return repository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }
    
    /**
     * Get configuration value as Integer
     */
    @Cacheable(value = "systemConfig", key = "#configKey.key")
    public Integer getInt(ConfigKey configKey) {
        String value = getString(configKey);
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            log.warn("Could not parse config {} as integer: {}", configKey.getKey(), value);
            try {
                return Integer.parseInt(configKey.getDefaultValue());
            } catch (NumberFormatException ex) {
                return 0;
            }
        }
    }
    
    /**
     * Get configuration value as BigDecimal
     */
    @Cacheable(value = "systemConfig", key = "#configKey.key")
    public BigDecimal getDecimal(ConfigKey configKey) {
        String value = getString(configKey);
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            log.warn("Could not parse config {} as decimal: {}", configKey.getKey(), value);
            try {
                return new BigDecimal(configKey.getDefaultValue());
            } catch (NumberFormatException ex) {
                return BigDecimal.ZERO;
            }
        }
    }
    
    /**
     * Get configuration value as Boolean
     */
    @Cacheable(value = "systemConfig", key = "#configKey.key")
    public Boolean getBoolean(ConfigKey configKey) {
        String value = getString(configKey);
        return Boolean.parseBoolean(value);
    }
    
    /**
     * Get configuration value as Double
     */
    @Cacheable(value = "systemConfig", key = "#configKey.key")
    public Double getDouble(ConfigKey configKey) {
        String value = getString(configKey);
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            log.warn("Could not parse config {} as double: {}", configKey.getKey(), value);
            try {
                return Double.parseDouble(configKey.getDefaultValue());
            } catch (NumberFormatException ex) {
                return 0.0;
            }
        }
    }
    
    /**
     * Update configuration value and evict cache
     */
    @Transactional
    @CacheEvict(value = "systemConfig", key = "#key")
    public void updateConfig(String key, String value) {
        SystemConfig config = repository.findById(key)
                .orElseThrow(() -> new IllegalArgumentException("Configuration key not found: " + key));
        
        if (!config.getIsEditable()) {
            throw new IllegalStateException("Configuration " + key + " is not editable");
        }
        
        config.setConfigValue(value);
        repository.save(config);
        log.info("Updated configuration: {} = {}", key, value);
    }
    
    /**
     * Update configuration using ConfigKey enum
     */
    @CacheEvict(value = "systemConfig", key = "#configKey.key")
    public void updateConfig(ConfigKey configKey, String value) {
        updateConfig(configKey.getKey(), value);
    }
    
    /**
     * Get all configurations by category
     */
    public List<SystemConfig> getConfigsByCategory(SystemConfig.ConfigCategory category) {
        return repository.findByCategory(category);
    }
    
    /**
     * Get all editable configurations
     */
    public List<SystemConfig> getEditableConfigs() {
        return repository.findByIsEditableTrue();
    }
    
    /**
     * Get all configurations as a map
     */
    public Map<String, String> getAllConfigsAsMap() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(
                        SystemConfig::getConfigKey,
                        SystemConfig::getConfigValue
                ));
    }
    
    /**
     * Clear all configuration cache
     */
    @CacheEvict(value = "systemConfig", allEntries = true)
    public void clearCache() {
        log.info("Cleared all system configuration cache");
    }
    
    /**
     * Refresh a specific configuration from database
     */
    @CacheEvict(value = "systemConfig", key = "#configKey.key")
    public void refreshConfig(ConfigKey configKey) {
        log.info("Refreshed configuration: {}", configKey.getKey());
    }
    
    // ========== Convenience methods for common configs ==========
    
    /**
     * Get shipping default fee
     */
    public BigDecimal getShippingDefaultFee() {
        return getDecimal(ConfigKey.SHIPPING_DEFAULT_FEE);
    }
    
    /**
     * Get shipping free threshold
     */
    public BigDecimal getShippingFreeThreshold() {
        return getDecimal(ConfigKey.SHIPPING_FREE_THRESHOLD);
    }
    
    /**
     * Check if shipping is enabled
     */
    public boolean isShippingEnabled() {
        return getBoolean(ConfigKey.SHIPPING_ENABLED);
    }
    
    /**
     * Get service fee percentage
     */
    public BigDecimal getServiceFeePercent() {
        return getDecimal(ConfigKey.ORDER_SERVICE_FEE_PERCENT);
    }
    
    /**
     * Calculate service fee for given amount
     */
    public BigDecimal calculateServiceFee(BigDecimal amount) {
        BigDecimal feePercent = getServiceFeePercent();
        return amount.multiply(feePercent).divide(new BigDecimal("100"));
    }
    
    /**
     * Calculate total with shipping and service fee
     */
    public BigDecimal calculateTotal(BigDecimal productPrice, BigDecimal shippingFee) {
        BigDecimal serviceFee = calculateServiceFee(productPrice);
        return productPrice.add(shippingFee).add(serviceFee);
    }
    
    /**
     * Check if maintenance mode is enabled
     */
    public boolean isMaintenanceMode() {
        return getBoolean(ConfigKey.MAINTENANCE_MODE);
    }
    
    /**
     * Get platform currency
     */
    public String getPlatformCurrency() {
        return getString(ConfigKey.PLATFORM_CURRENCY);
    }
    
    /**
     * Check if Waffy integration is enabled
     */
    public boolean isWaffyEnabled() {
        return getBoolean(ConfigKey.WAFFY_ENABLED);
    }
}
