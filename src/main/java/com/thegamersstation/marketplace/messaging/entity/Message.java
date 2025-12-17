package com.thegamersstation.marketplace.messaging.entity;

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

@Entity
@Table(name = "messages",
    indexes = {
        @Index(name = "idx_messages_conversation_created", columnList = "conversation_id, created_at DESC"),
        @Index(name = "idx_messages_unread", columnList = "conversation_id, is_read, sender_id"),
        @Index(name = "idx_messages_sender", columnList = "sender_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    @Builder.Default
    private MessageType messageType = MessageType.TEXT;
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "deleted_by_sender", nullable = false)
    @Builder.Default
    private Boolean deletedBySender = false;
    
    @Column(name = "deleted_by_recipient", nullable = false)
    @Builder.Default
    private Boolean deletedByRecipient = false;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum MessageType {
        TEXT, SYSTEM
    }
    
    // Helper methods
    public User getRecipient() {
        return sender.getId().equals(conversation.getSeller().getId()) 
            ? conversation.getBuyer() 
            : conversation.getSeller();
    }
    
    public boolean isVisibleToUser(Long userId) {
        boolean isSender = sender.getId().equals(userId);
        boolean isRecipient = getRecipient().getId().equals(userId);
        
        if (isSender && deletedBySender) return false;
        if (isRecipient && deletedByRecipient) return false;
        
        return isSender || isRecipient;
    }
}