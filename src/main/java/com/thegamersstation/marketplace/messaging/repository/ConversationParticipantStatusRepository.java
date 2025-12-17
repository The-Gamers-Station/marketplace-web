package com.thegamersstation.marketplace.messaging.repository;

import com.thegamersstation.marketplace.messaging.entity.ConversationParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationParticipantStatusRepository extends JpaRepository<ConversationParticipantStatus, Long> {
    
    @Query("SELECT cps FROM ConversationParticipantStatus cps " +
           "WHERE cps.conversation.id = :conversationId AND cps.user.id = :userId")
    Optional<ConversationParticipantStatus> findByConversationIdAndUserId(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );
    
    @Query("SELECT cps FROM ConversationParticipantStatus cps " +
           "WHERE cps.user.id = :userId AND cps.isArchived = false")
    List<ConversationParticipantStatus> findActiveByUserId(@Param("userId") Long userId);
    
    @Query("SELECT cps FROM ConversationParticipantStatus cps " +
           "WHERE cps.user.id = :userId AND cps.isMuted = true")
    List<ConversationParticipantStatus> findMutedByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE ConversationParticipantStatus cps " +
           "SET cps.lastSeenAt = :lastSeenAt " +
           "WHERE cps.conversation.id = :conversationId AND cps.user.id = :userId")
    void updateLastSeenAt(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId,
        @Param("lastSeenAt") LocalDateTime lastSeenAt
    );
    
    @Modifying
    @Query("UPDATE ConversationParticipantStatus cps " +
           "SET cps.isMuted = :isMuted " +
           "WHERE cps.conversation.id = :conversationId AND cps.user.id = :userId")
    void updateMuteStatus(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId,
        @Param("isMuted") Boolean isMuted
    );
    
    @Modifying
    @Query("UPDATE ConversationParticipantStatus cps " +
           "SET cps.isArchived = :isArchived " +
           "WHERE cps.conversation.id = :conversationId AND cps.user.id = :userId")
    void updateArchiveStatus(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId,
        @Param("isArchived") Boolean isArchived
    );
    
    @Modifying
    @Query("UPDATE ConversationParticipantStatus cps " +
           "SET cps.isBlocked = :isBlocked " +
           "WHERE cps.conversation.id = :conversationId AND cps.user.id = :userId")
    void updateBlockStatus(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId,
        @Param("isBlocked") Boolean isBlocked
    );
    
    @Query("SELECT cps FROM ConversationParticipantStatus cps " +
           "WHERE cps.conversation.id = :conversationId")
    List<ConversationParticipantStatus> findByConversationId(@Param("conversationId") Long conversationId);
    
    @Query("SELECT COUNT(cps) FROM ConversationParticipantStatus cps " +
           "WHERE cps.user.id = :userId AND cps.isBlocked = true")
    long countBlockedByUserId(@Param("userId") Long userId);
}