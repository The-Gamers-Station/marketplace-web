package com.thegamersstation.marketplace.sysconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for order pricing information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPricingDto {
    private BigDecimal productPrice;
    private BigDecimal shippingFee;
    private BigDecimal serviceFeePercent;
    private BigDecimal serviceFee;
    private BigDecimal totalAmount;
    private String currency;
}
