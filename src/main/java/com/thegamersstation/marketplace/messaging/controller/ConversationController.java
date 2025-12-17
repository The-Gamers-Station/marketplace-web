package com.thegamersstation.marketplace.messaging.controller;

import com.thegamersstation.marketplace.messaging.dto.*;
import com.thegamersstation.marketplace.messaging.service.ConversationService;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Conversations", description = "Chat conversation management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class ConversationController {
    
    private final ConversationService conversationService;
    
    @PostMapping
    @Operation(summary = "Start a new conversation", description = "Start a conversation about a post with the seller")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Conversation created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or cannot message yourself"),
        @ApiResponse(responseCode = "404", description = "Post not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ConversationDto> startConversation(
            @Valid @RequestBody StartConversationRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ConversationDto conversation = conversationService.startConversation(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }
    
    @GetMapping
    @Operation(summary = "Get user's conversations", description = "Get paginated list of user's conversations")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Conversations retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ConversationsPageDto> getUserConversations(
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        Long userId = SecurityUtil.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        ConversationsPageDto conversations = conversationService.getUserConversations(userId, pageable);
        return ResponseEntity.ok(conversations);
    }
    
    @GetMapping("/{conversationId}")
    @Operation(summary = "Get conversation details", description = "Get details of a specific conversation")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Conversation retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Conversation not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ConversationDto> getConversation(
            @Parameter(description = "Conversation ID", required = true)
            @PathVariable Long conversationId) {
        Long userId = SecurityUtil.getCurrentUserId();
        ConversationDto conversation = conversationService.getConversation(conversationId, userId);
        return ResponseEntity.ok(conversation);
    }
    
    @PutMapping("/{conversationId}/mute")
    @Operation(summary = "Mute/unmute conversation", description = "Toggle mute status for conversation notifications")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Mute status updated successfully"),
        @ApiResponse(responseCode = "404", description = "Conversation not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> updateMuteStatus(
            @PathVariable Long conversationId,
            @Parameter(description = "Mute status", required = true)
            @RequestParam boolean muted) {
        Long userId = SecurityUtil.getCurrentUserId();
        conversationService.updateMuteStatus(conversationId, userId, muted);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{conversationId}/archive")
    @Operation(summary = "Archive/unarchive conversation", description = "Toggle archive status for conversation")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Archive status updated successfully"),
        @ApiResponse(responseCode = "404", description = "Conversation not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> updateArchiveStatus(
            @PathVariable Long conversationId,
            @Parameter(description = "Archive status", required = true)
            @RequestParam boolean archived) {
        Long userId = SecurityUtil.getCurrentUserId();
        conversationService.updateArchiveStatus(conversationId, userId, archived);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{conversationId}/block")
    @Operation(summary = "Block/unblock user", description = "Toggle block status for the other participant")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Block status updated successfully"),
        @ApiResponse(responseCode = "404", description = "Conversation not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> updateBlockStatus(
            @PathVariable Long conversationId,
            @Parameter(description = "Block status", required = true)
            @RequestParam boolean blocked) {
        Long userId = SecurityUtil.getCurrentUserId();
        conversationService.updateBlockStatus(conversationId, userId, blocked);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{conversationId}/seen")
    @Operation(summary = "Mark conversation as seen", description = "Update last seen timestamp for conversation")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Last seen updated successfully"),
        @ApiResponse(responseCode = "404", description = "Conversation not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> markAsSeen(@PathVariable Long conversationId) {
        Long userId = SecurityUtil.getCurrentUserId();
        conversationService.updateLastSeenAt(conversationId, userId);
        return ResponseEntity.noContent().build();
    }
}