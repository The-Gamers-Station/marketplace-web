package com.thegamersstation.marketplace.messaging.controller;

import com.thegamersstation.marketplace.messaging.dto.*;
import com.thegamersstation.marketplace.messaging.service.MessageService;
import com.thegamersstation.marketplace.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/conversations/{conversationId}/messages")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Messages", description = "Chat message management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class MessageController {
    
    private final MessageService messageService;
    
    @PostMapping
    @Operation(summary = "Send a message", description = "Send a message in a conversation")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Message sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid message content"),
        @ApiResponse(responseCode = "403", description = "User is blocked"),
        @ApiResponse(responseCode = "404", description = "Conversation not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<MessageDto> sendMessage(
            @Parameter(description = "Conversation ID", required = true)
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        MessageDto message = messageService.sendMessage(conversationId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
    
    @GetMapping
    @Operation(summary = "Get messages", description = "Get paginated messages in a conversation")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Conversation not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<MessagesPageDto> getMessages(
            @Parameter(description = "Conversation ID", required = true)
            @PathVariable Long conversationId,
            @Parameter(description = "Cursor for pagination (message ID)", example = "100")
            @RequestParam(required = false) Long cursor,
            @Parameter(description = "Number of messages to retrieve", example = "20")
            @RequestParam(defaultValue = "20") Integer size) {
        Long userId = SecurityUtil.getCurrentUserId();
        MessagesPageDto messages = messageService.getMessages(conversationId, userId, cursor, size);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/{messageId}")
    @Operation(summary = "Get a specific message", description = "Get details of a specific message")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Message retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Message not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<MessageDto> getMessage(
            @Parameter(description = "Conversation ID", required = true)
            @PathVariable Long conversationId,
            @Parameter(description = "Message ID", required = true)
            @PathVariable Long messageId) {
        Long userId = SecurityUtil.getCurrentUserId();
        MessageDto message = messageService.getMessage(messageId, userId);
        return ResponseEntity.ok(message);
    }
    
    @PostMapping("/read")
    @Operation(summary = "Mark messages as read", description = "Mark all unread messages in conversation as read")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Messages marked as read"),
        @ApiResponse(responseCode = "404", description = "Conversation not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> markAsRead(
            @Parameter(description = "Conversation ID", required = true)
            @PathVariable Long conversationId) {
        Long userId = SecurityUtil.getCurrentUserId();
        messageService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{messageId}")
    @Operation(summary = "Delete a message", description = "Soft delete a message (only for the current user)")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Message deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Message not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteMessage(
            @Parameter(description = "Conversation ID", required = true)
            @PathVariable Long conversationId,
            @Parameter(description = "Message ID", required = true)
            @PathVariable Long messageId) {
        Long userId = SecurityUtil.getCurrentUserId();
        messageService.deleteMessage(messageId, userId);
        return ResponseEntity.noContent().build();
    }
}