package com.thegamersstation.marketplace.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    
    @NotNull(message = "Post ID is required")
    private Long postId;
    
    @NotBlank(message = "Shipping name is required")
    @Size(max = 100, message = "Shipping name must not exceed 100 characters")
    private String shippingName;
    
    @NotBlank(message = "Shipping phone is required")
    @Pattern(regexp = "^05\\d{8}$", message = "Phone number must be a valid Saudi mobile number (05XXXXXXXX)")
    private String shippingPhone;
    
    @NotBlank(message = "Shipping city is required")
    @Size(max = 100, message = "Shipping city must not exceed 100 characters")
    private String shippingCity;
    
    @NotBlank(message = "Shipping district is required")
    @Size(max = 100, message = "Shipping district must not exceed 100 characters")
    private String shippingDistrict;
}
