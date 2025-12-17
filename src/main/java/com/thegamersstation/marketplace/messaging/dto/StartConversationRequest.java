package com.thegamersstation.marketplace.messaging.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to start a conversation about a post")
public class StartConversationRequest {
    
    @NotNull(message = "Post ID is required")
    @Positive(message = "Post ID must be positive")
    @Schema(description = "ID of the post being discussed", example = "123", required = true)
    private Long postId;
    
    @NotBlank(message = "Initial message is required")
    @Size(min = 1, max = 5000, message = "Message must be between 1 and 5000 characters")
    @Schema(description = "Initial message content", example = "Hello, is the item still available?", required = true)
    private String initialMessage;
}