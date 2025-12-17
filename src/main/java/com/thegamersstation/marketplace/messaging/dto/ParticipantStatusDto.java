package com.thegamersstation.marketplace.messaging.dto;

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
@Schema(description = "User's status and preferences for a conversation")
public class ParticipantStatusDto {
    
    @Schema(description = "Whether notifications are muted", example = "false")
    private Boolean isMuted;
    
    @Schema(description = "Whether conversation is archived", example = "false")
    private Boolean isArchived;
    
    @Schema(description = "Whether other user is blocked", example = "false")
    private Boolean isBlocked;
    
    @Schema(description = "ID of last read message", example = "456")
    private Long lastReadMessageId;
    
    @Schema(description = "Last time user viewed this conversation", example = "2024-01-15T10:30:00")
    private LocalDateTime lastSeenAt;
}