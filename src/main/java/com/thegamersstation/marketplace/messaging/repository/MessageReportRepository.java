package com.thegamersstation.marketplace.messaging.repository;

import com.thegamersstation.marketplace.messaging.entity.MessageReport;
import com.thegamersstation.marketplace.messaging.entity.MessageReport.ReportReason;
import com.thegamersstation.marketplace.messaging.entity.MessageReport.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReportRepository extends JpaRepository<MessageReport, Long> {
    
    @Query("SELECT mr FROM MessageReport mr WHERE mr.message.id = :messageId AND mr.reportedByUser.id = :userId")
    Optional<MessageReport> findByMessageIdAndReportedByUserId(
        @Param("messageId") Long messageId,
        @Param("userId") Long userId
    );
    
    @Query("SELECT mr FROM MessageReport mr " +
           "LEFT JOIN FETCH mr.message m " +
           "LEFT JOIN FETCH m.conversation c " +
           "LEFT JOIN FETCH mr.reportedByUser " +
           "WHERE mr.status = :status " +
           "ORDER BY mr.createdAt DESC")
    Page<MessageReport> findByStatus(@Param("status") ReportStatus status, Pageable pageable);
    
    @Query("SELECT mr FROM MessageReport mr WHERE mr.status = 'PENDING' ORDER BY mr.createdAt ASC")
    List<MessageReport> findPendingReports(Pageable pageable);
    
    @Query("SELECT COUNT(mr) FROM MessageReport mr WHERE mr.status = 'PENDING'")
    long countPendingReports();
    
    @Query("SELECT mr FROM MessageReport mr WHERE mr.reportedByUser.id = :userId ORDER BY mr.createdAt DESC")
    Page<MessageReport> findByReportedByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT mr FROM MessageReport mr WHERE mr.reviewedByAdmin.id = :adminId ORDER BY mr.reviewedAt DESC")
    Page<MessageReport> findByReviewedByAdminId(@Param("adminId") Long adminId, Pageable pageable);
    
    @Query("SELECT mr.reason, COUNT(mr) FROM MessageReport mr " +
           "WHERE mr.createdAt >= :since " +
           "GROUP BY mr.reason")
    List<Object[]> countByReasonSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT mr FROM MessageReport mr WHERE mr.message.sender.id = :userId " +
           "AND mr.status IN ('ACTION_TAKEN', 'REVIEWED') " +
           "ORDER BY mr.createdAt DESC")
    Page<MessageReport> findReportsAgainstUser(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(mr) FROM MessageReport mr WHERE mr.message.sender.id = :userId " +
           "AND mr.status = 'ACTION_TAKEN'")
    long countActionsAgainstUser(@Param("userId") Long userId);
    
    @Query("SELECT mr FROM MessageReport mr WHERE mr.message.conversation.id = :conversationId " +
           "ORDER BY mr.createdAt DESC")
    List<MessageReport> findByConversationId(@Param("conversationId") Long conversationId);
    
    boolean existsByMessageIdAndReportedByUserId(Long messageId, Long userId);
}