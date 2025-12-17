package com.thegamersstation.marketplace.messaging.repository;

import com.thegamersstation.marketplace.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m " +
           "LEFT JOIN FETCH m.sender s " +
           "WHERE m.conversation.id = :conversationId " +
           "AND (m.deletedBySender = false OR m.sender.id != :userId) " +
           "AND (m.deletedByRecipient = false OR m.sender.id = :userId) " +
           "AND (:cursor IS NULL OR m.id < :cursor) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findByConversationIdAndUserId(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId,
        @Param("cursor") Long cursor,
        Pageable pageable
    );
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId AND m.isRead = false")
    List<Message> findUnreadMessages(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );
    
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.readAt = :readAt " +
           "WHERE m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId AND m.isRead = false")
    int markMessagesAsRead(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId,
        @Param("readAt") LocalDateTime readAt
    );
    
    @Modifying
    @Query("UPDATE Message m SET m.deletedBySender = CASE WHEN m.sender.id = :userId THEN true ELSE m.deletedBySender END, " +
           "m.deletedByRecipient = CASE WHEN m.sender.id != :userId THEN true ELSE m.deletedByRecipient END " +
           "WHERE m.id = :messageId")
    void softDeleteMessage(@Param("messageId") Long messageId, @Param("userId") Long userId);
    
    @Query("SELECT m FROM Message m WHERE m.id = :messageId " +
           "AND (m.conversation.seller.id = :userId OR m.conversation.buyer.id = :userId)")
    Optional<Message> findByIdAndParticipantId(
        @Param("messageId") Long messageId,
        @Param("userId") Long userId
    );
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId")
    long countByConversationId(@Param("conversationId") Long conversationId);
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.createdAt DESC")
    Optional<Message> findLatestMessage(@Param("conversationId") Long conversationId);
    
    @Query("SELECT m FROM Message m " +
           "WHERE m.conversation.id IN :conversationIds " +
           "AND m.createdAt > :since " +
           "ORDER BY m.createdAt DESC")
    List<Message> findRecentMessagesByConversationIds(
        @Param("conversationIds") List<Long> conversationIds,
        @Param("since") LocalDateTime since
    );
}