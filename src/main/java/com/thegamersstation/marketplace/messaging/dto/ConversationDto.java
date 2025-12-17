package com.thegamersstation.marketplace.messaging.dto;

import com.thegamersstation.marketplace.post.dto.PostDto;
import com.thegamersstation.marketplace.user.dto.PublicUserProfileDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Conversation details with participants and post information")
public class ConversationDto {
    
    @Schema(description = "Conversation ID", example = "1")
    private Long id;
    
    @Schema(description = "Post being discussed")
    private PostDto post;
    
    @Schema(description = "Seller (post owner)")
    private PublicUserProfileDto seller;
    
    @Schema(description = "Buyer (interested user)")
    private PublicUserProfileDto buyer;
    
    @Schema(description = "Last message timestamp", example = "2024-01-15T10:30:00")
    private LocalDateTime lastMessageAt;
    
    @Schema(description = "Preview of last message", example = "Hello, is this still available?")
    private String lastMessagePreview;
    
    @Schema(description = "Number of unread messages for current user", example = "3")
    private Long unreadCount;
    
    @Schema(description = "Participant status for current user")
    private ParticipantStatusDto participantStatus;
    
    @Schema(description = "Whether current user is the seller", example = "true")
    private Boolean isCurrentUserSeller;
    
    @Schema(description = "Other participant (depends on current user)")
    private PublicUserProfileDto otherParticipant;
    
    @Schema(description = "Created timestamp", example = "2024-01-15T09:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "Updated timestamp", example = "2024-01-15T10:30:00")
    private LocalDateTime updatedAt;
}