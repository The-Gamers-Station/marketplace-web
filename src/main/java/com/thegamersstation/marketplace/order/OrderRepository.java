package com.thegamersstation.marketplace.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find all orders where the user is the buyer
     */
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    
    /**
     * Find all orders where the user is the seller
     */
    List<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    
    /**
     * Find an order by ID where the user is the seller (for seller actions)
     */
    Optional<Order> findByIdAndSellerId(Long id, Long sellerId);
}
