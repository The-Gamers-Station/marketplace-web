package com.thegamersstation.marketplace.messaging.mapper;

import com.thegamersstation.marketplace.messaging.dto.MessageDto;
import com.thegamersstation.marketplace.messaging.entity.Message;
import com.thegamersstation.marketplace.user.mapper.UserMapper;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(
    componentModel = "spring",
    uses = {UserMapper.class},
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public abstract class MessageMapper {
    
    @Autowired
    private UserMapper userMapper;
    
    @Mapping(target = "conversationId", source = "conversation.id")
    @Mapping(target = "sender", source = "sender")
    @Mapping(target = "isOwnMessage", expression = "java(message.getSender().getId().equals(currentUserId))")
    @Mapping(target = "status", ignore = true)
    public abstract MessageDto toDto(Message message, @Context Long currentUserId);
    
    @AfterMapping
    protected void afterMapping(@MappingTarget MessageDto dto, Message message, @Context Long currentUserId) {
        // Set message status based on read state and ownership
        if (dto.getIsOwnMessage()) {
            if (message.getIsRead()) {
                dto.setStatus(MessageDto.MessageStatus.READ);
            } else {
                dto.setStatus(MessageDto.MessageStatus.SENT);
            }
        } else {
            // For received messages, always show as READ
            dto.setStatus(MessageDto.MessageStatus.READ);
        }
    }
}