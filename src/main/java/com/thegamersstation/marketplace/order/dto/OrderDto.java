package com.thegamersstation.marketplace.order.dto;

import com.thegamersstation.marketplace.order.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    
    private Long id;
    
    // Nested buyer object for frontend compatibility
    private UserSummary buyer;
    
    // Nested seller object for frontend compatibility
    private UserSummary seller;
    
    // Nested post object for frontend compatibility
    private PostSummary post;
    
    private String waffyContractId;
    private String trackingNumber;
    private Order.OrderStatus status;
    private BigDecimal productPrice;
    private BigDecimal shippingFee;
    private BigDecimal serviceFeePercent;
    private BigDecimal totalAmount;
    private String recipientName;
    private String recipientPhone;
    private String recipientCity;
    private String recipientDistrict;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String username;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostSummary {
        private Long id;
        private String title;
        private List<ImageDto> images;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageDto {
        private String url;
    }
}
