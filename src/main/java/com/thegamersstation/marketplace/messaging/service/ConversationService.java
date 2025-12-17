package com.thegamersstation.marketplace.messaging.service;

import com.thegamersstation.marketplace.common.exception.BusinessRuleException;
import com.thegamersstation.marketplace.common.exception.ResourceNotFoundException;
import com.thegamersstation.marketplace.messaging.dto.*;
import com.thegamersstation.marketplace.messaging.entity.Conversation;
import com.thegamersstation.marketplace.messaging.entity.ConversationParticipantStatus;
import com.thegamersstation.marketplace.messaging.mapper.ConversationMapper;
import com.thegamersstation.marketplace.messaging.repository.ConversationParticipantStatusRepository;
import com.thegamersstation.marketplace.messaging.repository.ConversationRepository;
import com.thegamersstation.marketplace.post.Post;
import com.thegamersstation.marketplace.post.PostRepository;
import com.thegamersstation.marketplace.user.repository.User;
import com.thegamersstation.marketplace.user.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConversationService {
    
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantStatusRepository participantStatusRepository;
    private final PostRepository postRepository;
    private final UsersRepository userRepository;
    private final ConversationMapper conversationMapper;
    private final MessageService messageService;
    
    public ConversationDto startConversation(StartConversationRequest request, Long buyerId) {
        // Validate post exists and is active
        Post post = postRepository.findById(request.getPostId())
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        
        if (post.getStatus() != Post.PostStatus.ACTIVE) {
            throw new BusinessRuleException("Cannot start conversation on inactive post");
        }
        
        // Get buyer
        User buyer = userRepository.findById(buyerId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Prevent seller from messaging themselves
        if (post.getOwner().getId().equals(buyerId)) {
            throw new BusinessRuleException("Cannot start conversation with yourself");
        }
        
        // Check if conversation already exists
        Optional<Conversation> existingConversation = conversationRepository
            .findByPostAndSellerAndBuyer(post, post.getOwner(), buyer);
        
        if (existingConversation.isPresent()) {
            // Send message to existing conversation
            messageService.sendMessage(
                existingConversation.get().getId(),
                SendMessageRequest.builder().content(request.getInitialMessage()).build(),
                buyerId
            );
            return getConversation(existingConversation.get().getId(), buyerId);
        }
        
        // Create new conversation
        Conversation conversation = Conversation.builder()
            .post(post)
            .seller(post.getOwner())
            .buyer(buyer)
            .lastMessageAt(LocalDateTime.now())
            .lastMessagePreview(truncateMessage(request.getInitialMessage()))
            .build();
        
        conversation = conversationRepository.save(conversation);
        
        // Create participant statuses
        createParticipantStatuses(conversation);
        
        // Send initial message
        messageService.sendMessage(
            conversation.getId(),
            SendMessageRequest.builder().content(request.getInitialMessage()).build(),
            buyerId
        );
        
        return conversationMapper.toDto(conversation, buyerId);
    }
    
    @Transactional(readOnly = true)
    public ConversationDto getConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository
            .findByIdAndParticipantId(conversationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        
        ConversationDto dto = conversationMapper.toDto(conversation, userId);
        
        // Add unread count
        long unreadCount = conversationRepository.countUnreadMessages(conversationId, userId);
        dto.setUnreadCount(unreadCount);
        
        return dto;
    }
    
    @Transactional(readOnly = true)
    public ConversationsPageDto getUserConversations(Long userId, Pageable pageable) {
        Page<Conversation> conversationsPage = conversationRepository.findByParticipantId(userId, pageable);
        
        Page<ConversationDto> dtoPage = conversationsPage.map(conversation -> {
            ConversationDto dto = conversationMapper.toDto(conversation, userId);
            long unreadCount = conversationRepository.countUnreadMessages(conversation.getId(), userId);
            dto.setUnreadCount(unreadCount);
            return dto;
        });
        
        long totalUnreadConversations = conversationRepository.countConversationsWithUnreadMessages(userId);
        
        return ConversationsPageDto.of(dtoPage, totalUnreadConversations);
    }
    
    public void updateMuteStatus(Long conversationId, Long userId, boolean muted) {
        validateParticipant(conversationId, userId);
        
        ConversationParticipantStatus status = getOrCreateParticipantStatus(conversationId, userId);
        participantStatusRepository.updateMuteStatus(conversationId, userId, muted);
        
        log.info("Updated mute status for conversation {} user {} to {}", conversationId, userId, muted);
    }
    
    public void updateArchiveStatus(Long conversationId, Long userId, boolean archived) {
        validateParticipant(conversationId, userId);
        
        ConversationParticipantStatus status = getOrCreateParticipantStatus(conversationId, userId);
        participantStatusRepository.updateArchiveStatus(conversationId, userId, archived);
        
        log.info("Updated archive status for conversation {} user {} to {}", conversationId, userId, archived);
    }
    
    public void updateBlockStatus(Long conversationId, Long userId, boolean blocked) {
        validateParticipant(conversationId, userId);
        
        ConversationParticipantStatus status = getOrCreateParticipantStatus(conversationId, userId);
        participantStatusRepository.updateBlockStatus(conversationId, userId, blocked);
        
        log.info("Updated block status for conversation {} user {} to {}", conversationId, userId, blocked);
    }
    
    public void updateLastSeenAt(Long conversationId, Long userId) {
        validateParticipant(conversationId, userId);
        participantStatusRepository.updateLastSeenAt(conversationId, userId, LocalDateTime.now());
    }
    
    void updateLastMessage(Long conversationId, String messagePreview, LocalDateTime timestamp) {
        conversationRepository.updateLastMessage(conversationId, timestamp, truncateMessage(messagePreview));
    }
    
    private void createParticipantStatuses(Conversation conversation) {
        // Create for seller
        ConversationParticipantStatus sellerStatus = ConversationParticipantStatus.builder()
            .conversation(conversation)
            .user(conversation.getSeller())
            .build();
        participantStatusRepository.save(sellerStatus);
        
        // Create for buyer
        ConversationParticipantStatus buyerStatus = ConversationParticipantStatus.builder()
            .conversation(conversation)
            .user(conversation.getBuyer())
            .build();
        participantStatusRepository.save(buyerStatus);
    }
    
    private ConversationParticipantStatus getOrCreateParticipantStatus(Long conversationId, Long userId) {
        return participantStatusRepository
            .findByConversationIdAndUserId(conversationId, userId)
            .orElseGet(() -> {
                Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
                
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
                ConversationParticipantStatus status = ConversationParticipantStatus.builder()
                    .conversation(conversation)
                    .user(user)
                    .build();
                
                return participantStatusRepository.save(status);
            });
    }
    
    private void validateParticipant(Long conversationId, Long userId) {
        conversationRepository.findByIdAndParticipantId(conversationId, userId)
            .orElseThrow(() -> new BusinessRuleException("User is not a participant in this conversation"));
    }
    
    private String truncateMessage(String message) {
        if (message == null) return null;
        return message.length() > 200 ? message.substring(0, 197) + "..." : message;
    }
}