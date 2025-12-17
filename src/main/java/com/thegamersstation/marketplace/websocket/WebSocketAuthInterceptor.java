package com.thegamersstation.marketplace.websocket;

import com.thegamersstation.marketplace.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    
    private final JwtUtil jwtUtil;
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractToken(accessor);
            
            if (token != null) {
                try {
                    // Validate token
                    if (jwtUtil.validateAccessToken(token)) {
                        Long userId = jwtUtil.extractUserId(token);
                        
                        // Create authentication
                        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_USER")
                        );
                        
                        Authentication auth = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities
                        );
                        
                        // Set user in WebSocket session
                        accessor.setUser(auth);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        
                        log.debug("WebSocket authentication successful for user: {}", userId);
                        return message;
                    }
                } catch (Exception e) {
                    log.error("WebSocket authentication failed: {}", e.getMessage());
                }
            }
            
            log.warn("WebSocket connection rejected - invalid or missing token");
            return null; // Reject connection
        }
        
        return message;
    }
    
    private String extractToken(StompHeaderAccessor accessor) {
        // Try to extract from Authorization header
        String authHeader = accessor.getFirstNativeHeader(AUTHORIZATION_HEADER);
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }
        
        // Try to extract from query parameter (for SockJS)
        String token = accessor.getFirstNativeHeader("token");
        if (token != null) {
            return token;
        }
        
        // Try to extract from connection URL (for browsers that don't support headers)
        // This would be passed as ws://localhost:8080/ws?token=JWT_TOKEN
        Object rawMessage = accessor.getHeader("simpConnectMessage");
        if (rawMessage != null) {
            String messageStr = rawMessage.toString();
            int tokenIndex = messageStr.indexOf("token=");
            if (tokenIndex != -1) {
                int tokenStart = tokenIndex + 6;
                int tokenEnd = messageStr.indexOf("&", tokenStart);
                if (tokenEnd == -1) {
                    tokenEnd = messageStr.indexOf(" ", tokenStart);
                }
                if (tokenEnd == -1) {
                    tokenEnd = messageStr.length();
                }
                return messageStr.substring(tokenStart, tokenEnd);
            }
        }
        
        return null;
    }
}