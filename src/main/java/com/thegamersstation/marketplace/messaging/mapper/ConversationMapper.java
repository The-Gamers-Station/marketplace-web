package com.thegamersstation.marketplace.messaging.mapper;

import com.thegamersstation.marketplace.messaging.dto.ConversationDto;
import com.thegamersstation.marketplace.messaging.dto.ParticipantStatusDto;
import com.thegamersstation.marketplace.messaging.entity.Conversation;
import com.thegamersstation.marketplace.messaging.entity.ConversationParticipantStatus;
import com.thegamersstation.marketplace.post.PostMapper;
import com.thegamersstation.marketplace.user.mapper.UserMapper;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(
    componentModel = "spring",
    uses = {PostMapper.class, UserMapper.class},
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public abstract class ConversationMapper {
    
    @Autowired
    private PostMapper postMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Mapping(target = "unreadCount", ignore = true)
    @Mapping(target = "participantStatus", ignore = true)
    @Mapping(target = "isCurrentUserSeller", expression = "java(conversation.getSeller().getId().equals(currentUserId))")
    @Mapping(target = "otherParticipant", expression = "java(userMapper.toPublicProfileDto(conversation.getOtherParticipant(currentUserId)))")
    public abstract ConversationDto toDto(Conversation conversation, @Context Long currentUserId);
    
    @AfterMapping
    protected void afterMapping(@MappingTarget ConversationDto dto, Conversation conversation, @Context Long currentUserId) {
        // Set participant status if available
        conversation.getParticipantStatuses().stream()
            .filter(status -> status.getUser().getId().equals(currentUserId))
            .findFirst()
            .ifPresent(status -> dto.setParticipantStatus(toParticipantStatusDto(status)));
    }
    
    protected abstract ParticipantStatusDto toParticipantStatusDto(ConversationParticipantStatus status);
}