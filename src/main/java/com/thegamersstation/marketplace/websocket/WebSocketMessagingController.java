package com.thegamersstation.marketplace.websocket;

import com.thegamersstation.marketplace.messaging.dto.MessageDto;
import com.thegamersstation.marketplace.messaging.dto.SendMessageRequest;
import com.thegamersstation.marketplace.messaging.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessagingController {
    
    private final MessageService messageService;
    
    @MessageMapping("/conversations/{conversationId}/send")
    @SendToUser("/queue/messages")
    public MessageDto handleMessage(
            @DestinationVariable Long conversationId,
            @Payload SendMessageRequest request,
            Principal principal) {
        
        Long userId = extractUserId(principal);
        log.debug("WebSocket message received from user {} for conversation {}", userId, conversationId);
        
        try {
            // Send message through service (which handles persistence and broadcasting)
            return messageService.sendMessage(conversationId, request, userId);
        } catch (Exception e) {
            log.error("Error handling WebSocket message: ", e);
            throw e;
        }
    }
    
    @MessageMapping("/messages/{messageId}/read")
    public void markAsRead(
            @DestinationVariable Long messageId,
            Principal principal) {
        
        Long userId = extractUserId(principal);
        log.debug("Message {} marked as read by user {}", messageId, userId);
        
        // Note: This is handled via REST API for now
        // Could implement WebSocket-based read receipts here
    }
    
    @MessageMapping("/conversations/{conversationId}/typing")
    @SendTo("/topic/conversation.{conversationId}.typing")
    public TypingStatusDto handleTyping(
            @DestinationVariable Long conversationId,
            @Payload TypingStatusDto typingStatus,
            Principal principal) {
        
        Long userId = extractUserId(principal);
        typingStatus.setUserId(userId);
        
        log.debug("User {} typing status: {} in conversation {}", 
            userId, typingStatus.isTyping(), conversationId);
        
        return typingStatus;
    }
    
    @SubscribeMapping("/conversations/{conversationId}/status")
    public ConversationStatusDto getConversationStatus(
            @DestinationVariable Long conversationId,
            Principal principal) {
        
        Long userId = extractUserId(principal);
        log.debug("User {} subscribed to conversation {} status", userId, conversationId);
        
        // Return initial conversation status
        return ConversationStatusDto.builder()
            .conversationId(conversationId)
            .isOnline(true)
            .build();
    }
    
    private Long extractUserId(Principal principal) {
        if (principal != null && principal.getName() != null) {
            try {
                return Long.parseLong(principal.getName());
            } catch (NumberFormatException e) {
                log.error("Failed to parse user ID from principal: {}", principal.getName());
            }
        }
        throw new IllegalStateException("User not authenticated");
    }
    
    // DTOs for WebSocket communication
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class TypingStatusDto {
        private Long userId;
        private boolean typing;
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class ConversationStatusDto {
        private Long conversationId;
        private boolean isOnline;
    }
}