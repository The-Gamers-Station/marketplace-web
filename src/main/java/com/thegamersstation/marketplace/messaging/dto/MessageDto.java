package com.thegamersstation.marketplace.messaging.dto;

import com.thegamersstation.marketplace.messaging.entity.Message.MessageType;
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
@Schema(description = "Message details")
public class MessageDto {
    
    @Schema(description = "Message ID", example = "123")
    private Long id;
    
    @Schema(description = "Conversation ID", example = "1")
    private Long conversationId;
    
    @Schema(description = "Message sender")
    private PublicUserProfileDto sender;
    
    @Schema(description = "Message content", example = "Hello, is the item still available?")
    private String content;
    
    @Schema(description = "Message type", example = "TEXT")
    private MessageType messageType;
    
    @Schema(description = "Whether message has been read", example = "false")
    private Boolean isRead;
    
    @Schema(description = "Read timestamp", example = "2024-01-15T10:35:00")
    private LocalDateTime readAt;
    
    @Schema(description = "Created timestamp", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "Whether current user sent this message", example = "true")
    private Boolean isOwnMessage;
    
    @Schema(description = "Message status for UI display", example = "sent")
    private MessageStatus status;
    
    public enum MessageStatus {
        SENDING, SENT, READ, FAILED
    }
}