import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Search,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  File,
  Loader2,
  MessageCircle,
  MapPin,
  Package
} from 'lucide-react';
import Header from '../../components/Header/Header';
import messagingService from '../../services/messagingService';
import authService from '../../services/authService';
import './ChatPage.css';

const ChatPage = () => {
  console.log('[ChatPage] Component initializing');
  
  const { t, i18n } = useTranslation();
  const { chatId: conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(true); // Default to true (online)
  const [error, setError] = useState(null);
  
  // Get current user
  const currentUser = authService.getCurrentUser();
  console.log('[ChatPage] Current user:', currentUser);

  // Auth guard: ensure user is logged in before accessing chat
  useEffect(() => {
    console.log('[ChatPage] Auth check:', {
      isAuthenticated: authService.isAuthenticated(),
      pathname: location.pathname,
      conversationId,
      currentUser,
      accessToken: authService.getAccessToken() ? 'Present' : 'Missing'
    });
    if (!authService.isAuthenticated()) {
      console.log('[ChatPage] Not authenticated, redirecting to login');
      navigate('/login', { state: { redirectTo: location.pathname + location.search } });
    }
  }, [navigate, location, conversationId]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Initialize chat data
  useEffect(() => {
    const initializeChat = async () => {
      console.log('[ChatPage] Initializing chat:', {
        conversationId,
        locationState: location.state,
        currentUser
      });
      
      try {
        setLoading(true);
        setError(null);
        
        // If we have a conversation ID, load it
        if (conversationId) {
          const conversation = await messagingService.getConversation(conversationId);
          
          setChatInfo({
            conversationId: conversation.id,
            productId: conversation.post?.id,
            productName: conversation.post?.localizedTitle?.[i18n.language] || conversation.post?.title,
            productImage: conversation.post?.images?.[0]?.url,
            sellerName: conversation.otherParticipant?.username,
            sellerId: conversation.otherParticipant?.id,
            sellerAvatar: conversation.otherParticipant?.profileImage,
            lastSeen: conversation.otherParticipant?.lastSeen,
            isOnline: conversation.otherParticipant?.isOnline,
            isCurrentUserSeller: conversation.isCurrentUserSeller,
            post: conversation.post,
            otherParticipant: conversation.otherParticipant
          });
          
          // Load initial messages
          await loadMessages();
          
          // Mark messages as read
          await messagingService.markMessagesAsRead(conversationId);
          
          // Mark conversation as seen
          await messagingService.markConversationAsSeen(conversationId);
        } else {
          // No conversation ID, check if we're starting a new chat
          if (location.state?.productId) {
            console.log('[ChatPage] Starting new chat with product:', location.state);
            // We'll create the conversation when sending the first message
            setChatInfo({
              productId: location.state.productId,
              productName: location.state.productName,
              sellerName: location.state.sellerName,
              sellerId: location.state.sellerId,
              isOnline: true
            });
          } else {
            // No conversation and no product info
            // Show empty chat state instead of redirecting
            console.log('[ChatPage] No conversation ID or product info, showing empty state');
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('[ChatPage] Error initializing chat:', {
          error: err,
          message: err.message,
          response: err.response,
          conversationId
        });
        
        // Handle specific error cases
        if (err.message.includes('[403]')) {
          // Log more details about the 403 error
          console.error('[ChatPage] 403 Forbidden - Possible causes:', {
            currentUser,
            token: authService.getAccessToken() ? 'Present' : 'Missing',
            tokenPrefix: authService.getAccessToken()?.substring(0, 20) + '...'
          });
          
          // Check if it's a token issue or a business rule violation
          if (err.message.includes('token') || err.message.includes('expired')) {
            authService.clearTokens();
            navigate('/login', { state: { redirectTo: location.pathname } });
            return;
          }
        } else if (err.message.includes('[401]')) {
          // Authentication issue - redirect to login
          authService.clearTokens();
          navigate('/login', { state: { redirectTo: location.pathname } });
          return;
        }
        
        setError(t('chat.loadError'));
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
  }, [conversationId, location.state, i18n.language, navigate, t]);
  
  // Load messages
  const loadMessages = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      }
      
      const response = await messagingService.getMessages(
        conversationId,
        loadMore ? cursor : null
      );
      
      if (loadMore) {
        setMessages(prev => [...response.messages, ...prev]);
      } else {
        setMessages(response.messages);
      }
      
      setHasMore(response.hasMore);
      setCursor(response.nextCursor);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Set up WebSocket subscriptions
  useEffect(() => {
    if (!conversationId) return;
    
    let unsubscribeConvMessages;
    let unsubscribeReceipts;
    let unsubscribeTyping;
    let unsubscribeStatus;
    
    const setupSubscriptions = async () => {
      try {
        // Subscribe to per-conversation messages topic to update both sides instantly
        unsubscribeConvMessages = await messagingService.subscribeToConversationMessages(
          conversationId,
          (messageData) => {
            // Normalize ownership relative to current user so incoming messages render correctly
            const senderId = messageData?.sender?.id ?? messageData?.sender?.userId;
            const myId = currentUser?.userId ?? currentUser?.id;
            const normalized = {
              ...messageData,
              // use loose equality to tolerate string/number mismatch across platforms
              isOwnMessage: senderId == myId
            };

            // Dedupe by id to avoid double-add when sender also receives topic echo
            setMessages(prev => {
              if (prev.some(m => m.id === normalized.id)) return prev;
              return [...prev, normalized];
            });

            // Mark as read if this chat is open
            messagingService.markMessagesAsRead(conversationId);
          }
        );
        
        // Subscribe to read receipts
        unsubscribeReceipts = await messagingService.subscribeToReadReceipts((receiptData) => {
          if (receiptData.conversationId === parseInt(conversationId)) {
            // Update message statuses
            setMessages(prev => prev.map(msg => {
              if (msg.isOwnMessage && !msg.isRead) {
                return { ...msg, isRead: true, readAt: receiptData.readAt, status: 'read' };
              }
              return msg;
            }));
          }
        });
        
        // Subscribe to typing status
        unsubscribeTyping = await messagingService.subscribeToTypingStatus(conversationId, (typingData) => {
          if (typingData.userId !== currentUser?.userId) {
            setOtherUserTyping(typingData.typing);
          }
        });
        
        // Connection status
        unsubscribeStatus = messagingService.onConnectionStatusChange(setConnectionStatus);
      } catch (error) {
        console.error('Failed to setup subscriptions:', error);
      }
    };
    
    setupSubscriptions();
    
    return () => {
      // Cleanup subscriptions
      if (typeof unsubscribeConvMessages === 'function') unsubscribeConvMessages();
      if (typeof unsubscribeReceipts === 'function') unsubscribeReceipts();
      if (typeof unsubscribeTyping === 'function') unsubscribeTyping();
      if (typeof unsubscribeStatus === 'function') unsubscribeStatus();
    };
  }, [conversationId, currentUser?.userId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Require authentication
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { redirectTo: location.pathname + location.search } });
      return;
    }
    
    if (!message.trim()) return;
    if (sending) return;
    
    setSending(true);
    setError(null);
    
    try {
      let activeConversationId = conversationId;
      
      // If no conversation exists, start one
      if (!activeConversationId) {
        const conversation = await messagingService.startConversation(
          chatInfo.productId,
          message
        );
        
        // Navigate to the new conversation
        navigate(`/chat/${conversation.id}`, { replace: true });
        return;
      }
      
      // Send message
      const sentMessage = await messagingService.sendMessage(activeConversationId, message);
      
      // Add to messages if not already received via WebSocket
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === sentMessage.id);
        if (!exists) {
          return [...prev, sentMessage];
        }
        return prev;
      });
      
      setMessage('');
      
      // Stop typing indicator
      handleTypingStop();
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Handle specific error cases
      if (err.message.includes('[403]')) {
        // Authentication issue - redirect to login
        authService.clearTokens();
        navigate('/login', { state: { redirectTo: location.pathname } });
        return;
      } else if (err.message.includes('[400]') && err.message.includes('yourself')) {
        setError(t('chat.cannotMessageYourself') || 'You cannot message yourself');
      } else if (err.message.includes('[404]')) {
        setError(t('chat.productNotFound') || 'Product not found');
      } else {
        // Show the actual error message from backend if available
        const errorMatch = err.message.match(/\[\d+\]\s*(.+)/);
        setError(errorMatch ? errorMatch[1] : t('chat.sendError'));
      }
    } finally {
      setSending(false);
    }
  };
  
  const handleTyping = () => {
    if (!isTyping && conversationId) {
      setIsTyping(true);
      messagingService.sendTypingStatus(conversationId, true).catch(console.error);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };
  
  const handleTypingStop = () => {
    if (isTyping && conversationId) {
      setIsTyping(false);
      messagingService.sendTypingStatus(conversationId, false).catch(console.error);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
  
  const formatTime = (date) => {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return messageDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        day: 'numeric',
        month: 'short'
      });
    }
  };
  
  const formatLastSeen = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const lastSeenDate = new Date(date);
    const diffInMinutes = (now - lastSeenDate) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return t('chat.justNow');
    } else if (diffInMinutes < 60) {
      return t('chat.minutesAgo', { minutes: Math.floor(diffInMinutes) });
    } else if (diffInMinutes < 1440) {
      return t('chat.hoursAgo', { hours: Math.floor(diffInMinutes / 60) });
    } else {
      return t('chat.daysAgo', { days: Math.floor(diffInMinutes / 1440) });
    }
  };
  
  const MessageStatus = ({ status, isRead }) => {
    if (status === 'sending') {
      return <Clock size={14} className="message-status sending" />;
    } else if (isRead || status === 'read') {
      return <CheckCheck size={14} className="message-status read" />;
    } else if (status === 'sent') {
      return <Check size={14} className="message-status sent" />;
    } else if (status === 'failed') {
      return <AlertCircle size={14} className="message-status failed" />;
    }
    return null;
  };
  
  if (loading) {
    console.log('[ChatPage] Rendering loading state');
    return (
      <div className="chat-page">
        <Header />
        <div className="loading-container">
          <Loader2 className="spinner" size={48} />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  // Show empty state when no conversation is selected
  if (!conversationId && !chatInfo) {
    console.log('[ChatPage] Rendering empty state:', { conversationId, chatInfo });
    return (
      <div className="chat-page">
        <Header />
        
        <div className="chat-empty-state">
          <div className="empty-state-content">
            <MessageCircle size={64} className="empty-state-icon" />
            <h2>{t('chat.noConversation')}</h2>
            <p>{t('chat.selectConversationOrStartNew')}</p>
            <button
              className="browse-products-btn"
              onClick={() => navigate('/products')}
            >
              {t('chat.browseProducts')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat-page">
      <Header />
      
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="chat-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={24} />
            </button>
            
            <div className="chat-user-info">
              <div className="chat-user-avatar">
                {chatInfo?.sellerAvatar ? (
                  <img src={chatInfo.sellerAvatar} alt={chatInfo.sellerName} />
                ) : (
                  <span>{chatInfo?.sellerName?.charAt(0) || '?'}</span>
                )}
              </div>
              
              <div className="chat-user-details">
                <h3>{chatInfo?.sellerName}</h3>
              </div>
            </div>
          </div>
          
          <div className="chat-header-right">
          </div>
        </div>
        
        {/* Product Info Bar */}
        {chatInfo?.productName && (
          <div className="chat-product-info">
            <div className="product-info-content">
              {chatInfo?.productImage && (
                <img 
                  src={chatInfo.productImage} 
                  alt={chatInfo.productName} 
                  className="product-thumbnail"
                />
              )}
              <span className="product-label">{t('chat.regarding')}:</span>
              <span className="product-name">{chatInfo.productName}</span>
            </div>
            <button 
              className="view-product-btn"
              onClick={() => navigate(`/product/${chatInfo.productId}`)}
            >
              {t('chat.viewProduct')}
            </button>
          </div>
        )}
        
        {/* Messages Area */}
        <div className="chat-messages">
          <div className="messages-container">
            {/* Load more button */}
            {hasMore && !loadingMore && (
              <button 
                className="load-more-btn" 
                onClick={() => loadMessages(true)}
              >
                {t('chat.loadEarlierMessages')}
              </button>
            )}
            
            {loadingMore && (
              <div className="loading-more">
                <Loader2 className="spinner" size={20} />
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="chat-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            {/* Messages */}
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.isOwnMessage ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  {msg.content && <p className="message-text">{msg.content}</p>}
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="message-attachments">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="attachment-item">
                          {att.type === 'image' ? (
                            <img src={att.preview} alt="Attachment" />
                          ) : (
                            <div className="file-attachment">
                              <File size={24} />
                              <span>{att.file.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="message-meta">
                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                    {msg.isOwnMessage && <MessageStatus status={msg.status} isRead={msg.isRead} />}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {otherUserTyping && (
              <div className="message received typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Message Input */}
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="message-input"
              placeholder={conversationId ? t('chat.typeMessage') : t('chat.typeFirstMessage')}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onBlur={handleTypingStop}
              disabled={sending}
            />
            
            <button
              type="submit"
              className="send-btn"
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <Loader2 size={20} className="spinner" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;