package com.thegamersstation.marketplace.order;

import com.thegamersstation.marketplace.order.dto.CreateOrderRequest;
import com.thegamersstation.marketplace.order.dto.OrderDto;
import com.thegamersstation.marketplace.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints with Waffy escrow integration")
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new order", description = "Buyer creates an order request for a product")
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Long buyerId = SecurityUtil.getCurrentUserId();
        OrderDto order = orderService.createOrder(request, buyerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
    
    @PostMapping("/{id}/accept")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Accept an order", description = "Seller accepts a pending order")
    public ResponseEntity<OrderDto> acceptOrder(@PathVariable Long id) {
        Long sellerId = SecurityUtil.getCurrentUserId();
        OrderDto order = orderService.acceptOrder(id, sellerId);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Reject an order", description = "Seller rejects a pending order")
    public ResponseEntity<OrderDto> rejectOrder(@PathVariable Long id) {
        Long sellerId = SecurityUtil.getCurrentUserId();
        OrderDto order = orderService.rejectOrder(id, sellerId);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/my-purchases")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get my purchases", description = "Get all orders where the current user is the buyer")
    public ResponseEntity<List<OrderDto>> getMyPurchases() {
        Long buyerId = SecurityUtil.getCurrentUserId();
        List<OrderDto> orders = orderService.getMyPurchases(buyerId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/customer-orders")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get customer orders", description = "Get all orders where the current user is the seller")
    public ResponseEntity<List<OrderDto>> getCustomerOrders() {
        Long sellerId = SecurityUtil.getCurrentUserId();
        List<OrderDto> orders = orderService.getCustomerOrders(sellerId);
        return ResponseEntity.ok(orders);
    }
}
