package com.thegamersstation.marketplace.order;

import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.common.exception.ResourceNotFoundException;
import com.thegamersstation.marketplace.order.dto.CreateOrderRequest;
import com.thegamersstation.marketplace.order.dto.OrderDto;
import com.thegamersstation.marketplace.post.Post;
import com.thegamersstation.marketplace.post.PostRepository;
import com.thegamersstation.marketplace.sysconfig.SystemConfigService;
import com.thegamersstation.marketplace.user.repository.User;
import com.thegamersstation.marketplace.user.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;
    private final WaffyService waffyService;
    private final OrderMapper orderMapper;
    private final SystemConfigService configService;
    
    /**
     * Create a new order
     */
    @Transactional
    public OrderDto createOrder(CreateOrderRequest request, Long buyerId) {
        log.info("Creating order for buyer {} on post {}", buyerId, request.getPostId());
        
        // Validate post exists and is active
        Post post = postRepository.findById(request.getPostId())
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        
        if (post.getStatus() != Post.PostStatus.ACTIVE) {
            throw new BusinessRuleException(
                "Cannot create order for inactive post",
                "لا يمكن إنشاء طلب لإعلان غير نشط"
            );
        }
        
        // Get buyer and seller
        User buyer = usersRepository.findById(buyerId)
            .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
        
        User seller = post.getOwner();
        
        // Validate buyer != seller
        if (buyer.getId().equals(seller.getId())) {
            throw new BusinessRuleException(
                "Cannot buy your own product",
                "لا يمكنك شراء منتجك الخاص"
            );
        }
        
        // Calculate pricing
        BigDecimal productPrice = post.getPrice();
        if (productPrice == null) {
            throw new BusinessRuleException(
                "Product does not have a fixed price",
                "المنتج ليس له سعر محدد"
            );
        }
        
        // Get shipping fee and service fee from config
        BigDecimal shippingFee = configService.getShippingDefaultFee();
        BigDecimal serviceFeePercent = configService.getServiceFeePercent();
        BigDecimal serviceFee = configService.calculateServiceFee(productPrice);
        BigDecimal totalAmount = productPrice.add(shippingFee).add(serviceFee);
        
        // Build and save order (Waffy contract will be created when seller accepts)
        Order order = Order.builder()
            .buyer(buyer)
            .seller(seller)
            .post(post)
            .waffyContractId(null) // Will be set when seller accepts
            .status(Order.OrderStatus.REQUESTED)
            .productPrice(productPrice)
            .shippingFee(shippingFee)
            .serviceFeePercent(serviceFeePercent)
            .totalAmount(totalAmount)
            .shippingName(request.getShippingName())
            .shippingPhone(request.getShippingPhone())
            .shippingCity(request.getShippingCity())
            .shippingDistrict(request.getShippingDistrict())
            .build();
        
        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {}", savedOrder.getId());
        
        return orderMapper.toDto(savedOrder);
    }
    
    /**
     * Accept an order (seller action)
     */
    @Transactional
    public OrderDto acceptOrder(Long orderId, Long sellerId) {
        log.info("Seller {} accepting order {}", sellerId, orderId);
        
        Order order = orderRepository.findByIdAndSellerId(orderId, sellerId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found or you are not the seller"));
        
        if (order.getStatus() != Order.OrderStatus.REQUESTED) {
            throw new BusinessRuleException(
                "Order cannot be accepted in current status",
                "لا يمكن قبول الطلب في حالته الحالية"
            );
        }
        
        // Create Waffy contract when seller accepts
        WaffyService.WaffyContractResponse waffyResponse = waffyService.createContract(
            order.getPost().getTitle(),
            order.getPost().getDescription(),
            order.getTotalAmount()
        );
        
        // Store Waffy contract ID
        order.setWaffyContractId(waffyResponse.getContractId());
        
        // Accept the Waffy contract (as broker)
        waffyService.acceptContract(waffyResponse.getContractId());
        
        // Update order status
        order.setStatus(Order.OrderStatus.ACCEPTED);
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order {} accepted", orderId);
        return orderMapper.toDto(savedOrder);
    }
    
    /**
     * Reject an order (seller action)
     */
    @Transactional
    public OrderDto rejectOrder(Long orderId, Long sellerId) {
        log.info("Seller {} rejecting order {}", sellerId, orderId);
        
        Order order = orderRepository.findByIdAndSellerId(orderId, sellerId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found or you are not the seller"));
        
        if (order.getStatus() != Order.OrderStatus.REQUESTED) {
            throw new BusinessRuleException(
                "Order cannot be rejected in current status",
                "لا يمكن رفض الطلب في حالته الحالية"
            );
        }
        
        // No need to call Waffy API for rejection since contract was never created
        // (Contract is only created when seller accepts)
        
        order.setStatus(Order.OrderStatus.REJECTED);
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order {} rejected", orderId);
        return orderMapper.toDto(savedOrder);
    }
    
    /**
     * Get buyer's purchases
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getMyPurchases(Long buyerId) {
        log.info("Fetching purchases for buyer {}", buyerId);
        
        List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        return orders.stream()
            .map(orderMapper::toDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get seller's customer orders
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getCustomerOrders(Long sellerId) {
        log.info("Fetching customer orders for seller {}", sellerId);
        
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        return orders.stream()
            .map(orderMapper::toDto)
            .collect(Collectors.toList());
    }
}
