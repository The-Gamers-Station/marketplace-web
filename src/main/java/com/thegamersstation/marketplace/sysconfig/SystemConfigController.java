package com.thegamersstation.marketplace.sysconfig;

import com.thegamersstation.marketplace.sysconfig.dto.ConfigDto;
import com.thegamersstation.marketplace.sysconfig.dto.OrderPricingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for system configuration
 */
@RestController
@RequestMapping("/config")
@RequiredArgsConstructor
public class SystemConfigController {
    
    private final SystemConfigService configService;
    
    /**
     * Get all public configurations
     */
    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublicConfigs() {
        Map<String, String> configs = Map.of(
            "currency", configService.getPlatformCurrency(),
            "phonePrefix", configService.getString(ConfigKey.PLATFORM_PHONE_PREFIX),
            "countryCode", configService.getString(ConfigKey.PLATFORM_COUNTRY_CODE),
            "maintenanceMode", String.valueOf(configService.isMaintenanceMode())
        );
        return ResponseEntity.ok(configs);
    }
    
    /**
     * Get order pricing configuration
     */
    @GetMapping("/order-pricing")
    public ResponseEntity<OrderPricingDto> getOrderPricing() {
        OrderPricingDto pricing = OrderPricingDto.builder()
            .shippingFee(configService.getShippingDefaultFee())
            .serviceFeePercent(configService.getServiceFeePercent())
            .currency(configService.getPlatformCurrency())
            .build();
        
        return ResponseEntity.ok(pricing);
    }
    
    /**
     * Calculate order total
     */
    @PostMapping("/calculate-total")
    public ResponseEntity<OrderPricingDto> calculateTotal(@RequestParam BigDecimal productPrice) {
        BigDecimal shippingFee = configService.getShippingDefaultFee();
        BigDecimal serviceFeePercent = configService.getServiceFeePercent();
        BigDecimal serviceFee = configService.calculateServiceFee(productPrice);
        BigDecimal total = configService.calculateTotal(productPrice, shippingFee);
        
        OrderPricingDto pricing = OrderPricingDto.builder()
            .productPrice(productPrice)
            .shippingFee(shippingFee)
            .serviceFeePercent(serviceFeePercent)
            .serviceFee(serviceFee)
            .totalAmount(total)
            .currency(configService.getPlatformCurrency())
            .build();
        
        return ResponseEntity.ok(pricing);
    }
    
    /**
     * Get configurations by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ConfigDto>> getConfigsByCategory(@PathVariable String category) {
        SystemConfig.ConfigCategory configCategory;
        try {
            configCategory = SystemConfig.ConfigCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        
        List<ConfigDto> configs = configService.getConfigsByCategory(configCategory)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(configs);
    }
    
    /**
     * Get specific configuration value
     */
    @GetMapping("/{key}")
    public ResponseEntity<String> getConfigValue(@PathVariable String key) {
        try {
            String value = configService.getString(key, null);
            if (value == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(value);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private ConfigDto toDto(SystemConfig config) {
        return ConfigDto.builder()
            .key(config.getConfigKey())
            .value(config.getConfigValue())
            .valueType(config.getValueType().name())
            .description(config.getDescription())
            .category(config.getCategory().name())
            .isEditable(config.getIsEditable())
            .build();
    }
}
