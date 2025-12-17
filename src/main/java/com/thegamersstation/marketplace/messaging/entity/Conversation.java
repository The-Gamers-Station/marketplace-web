package com.thegamersstation.marketplace.messaging.entity;

import com.thegamersstation.marketplace.post.Post;
import com.thegamersstation.marketplace.user.repository.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_id", "seller_id", "buyer_id"})
    },
    indexes = {
        @Index(name = "idx_conversations_seller", columnList = "seller_id, updated_at DESC"),
        @Index(name = "idx_conversations_buyer", columnList = "buyer_id, updated_at DESC"),
        @Index(name = "idx_conversations_post", columnList = "post_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;
    
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
    
    @Column(name = "last_message_preview", length = 200)
    private String lastMessagePreview;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Bidirectional relationships
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();
    
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConversationParticipantStatus> participantStatuses = new ArrayList<>();
    
    // Helper methods
    public boolean isParticipant(Long userId) {
        return seller.getId().equals(userId) || buyer.getId().equals(userId);
    }
    
    public User getOtherParticipant(Long currentUserId) {
        return seller.getId().equals(currentUserId) ? buyer : seller;
    }
}