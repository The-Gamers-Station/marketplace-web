package com.thegamersstation.marketplace.messaging.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Paginated messages response")
public class MessagesPageDto {
    
    @Schema(description = "List of messages")
    private List<MessageDto> messages;
    
    @Schema(description = "Total number of messages", example = "50")
    private Long totalMessages;
    
    @Schema(description = "Whether there are more messages to load", example = "true")
    private Boolean hasMore;
    
    @Schema(description = "Cursor for next page (ID of last message)", example = "100")
    private Long nextCursor;
    
    @Schema(description = "Number of messages returned", example = "20")
    private Integer count;
}