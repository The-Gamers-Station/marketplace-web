package com.thegamersstation.marketplace.order;

import com.thegamersstation.marketplace.post.Post;
import com.thegamersstation.marketplace.user.repository.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Order entity representing purchase orders with Waffy escrow integration.
 */
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @Column(name = "waffy_contract_id")
    private String waffyContractId;
    
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private OrderStatus status = OrderStatus.REQUESTED;
    
    @Column(name = "product_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal productPrice;
    
    @Column(name = "shipping_fee", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = new BigDecimal("30.00");
    
    @Column(name = "service_fee_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal serviceFeePercent = new BigDecimal("4.00");
    
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "shipping_name", nullable = false, length = 100)
    private String shippingName;
    
    @Column(name = "shipping_phone", nullable = false, length = 20)
    private String shippingPhone;
    
    @Column(name = "shipping_city", nullable = false, length = 100)
    private String shippingCity;
    
    @Column(name = "shipping_district", nullable = false, length = 100)
    private String shippingDistrict;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum OrderStatus {
        REQUESTED,
        ACCEPTED,
        REJECTED,
        PAID
    }
}
