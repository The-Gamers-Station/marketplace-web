package com.thegamersstation.marketplace.messaging.dto;

import com.thegamersstation.marketplace.common.dto.PageResponseDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Paginated conversations response")
public class ConversationsPageDto extends PageResponseDto<ConversationDto> {
    
    @Schema(description = "Total unread conversations count", example = "5")
    private Long totalUnreadConversations;
    
    public ConversationsPageDto(List<ConversationDto> content, int page, int size,
                                long totalElements, int totalPages, boolean first,
                                boolean last, Long totalUnreadConversations) {
        super(content, page, size, totalElements, totalPages, first, last);
        this.totalUnreadConversations = totalUnreadConversations;
    }
    
    public static ConversationsPageDto of(Page<ConversationDto> page, Long totalUnreadConversations) {
        return new ConversationsPageDto(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast(),
            totalUnreadConversations
        );
    }
}