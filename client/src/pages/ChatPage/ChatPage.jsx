import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Search,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  File,
  X
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './ChatPage.css';

const ChatPage = () => {
  const { t, i18n } = useTranslation();
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Get current user
  // const currentUser = authService.getCurrentUser();
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Mock data for demonstration
  // Initialize chat data
  useEffect(() => {
    // Use a small delay to avoid synchronous setState
    const timer = setTimeout(() => {
      // Set chat info from location state or mock data
      setChatInfo({
        productId: location.state?.productId || chatId,
        productName: location.state?.productName || 'PlayStation 5',
        sellerName: location.state?.sellerName || 'أحمد محمد',
        sellerId: location.state?.sellerId || '123',
        sellerAvatar: null,
        lastSeen: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isOnline: true
      });
      
      // Mock messages
      setMessages([
        {
          id: 1,
          text: 'مرحباً، هل المنتج متوفر؟',
          sender: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'read'
        },
        {
          id: 2,
          text: 'نعم متوفر، هل تريد المزيد من المعلومات؟',
          sender: 'seller',
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          status: 'read'
        },
        {
          id: 3,
          text: 'نعم، ما هي حالة الجهاز بالضبط؟',
          sender: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          status: 'read'
        },
        {
          id: 4,
          text: 'الجهاز جديد تماماً، لم يتم فتحه من قبل. يأتي مع جميع الملحقات الأصلية والضمان.',
          sender: 'seller',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          status: 'read'
        }
      ]);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [chatId, location.state]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;
    
    setSending(true);
    
    // Create new message
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      attachments: attachments
    };
    
    // Add message to list
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setAttachments([]);
    
    // Simulate sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
      
      // Simulate read after 2 seconds
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      }, 2000);
      
      setSending(false);
      
      // Simulate seller typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate seller response
        const sellerResponse = {
          id: messages.length + 2,
          text: 'شكراً لك، سأتواصل معك قريباً بخصوص التفاصيل.',
          sender: 'seller',
          timestamp: new Date(),
          status: 'read'
        };
        setMessages(prev => [...prev, sellerResponse]);
      }, 3000);
    }, 1000);
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };
  
  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };
  
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
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
  
  const MessageStatus = ({ status }) => {
    switch (status) {
      case 'sending':
        return <Clock size={14} className="message-status sending" />;
      case 'sent':
        return <Check size={14} className="message-status sent" />;
      case 'read':
        return <CheckCheck size={14} className="message-status read" />;
      case 'failed':
        return <AlertCircle size={14} className="message-status failed" />;
      default:
        return null;
    }
  };
  
  
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
                  <span>{chatInfo?.sellerName?.charAt(0)}</span>
                )}
                {chatInfo?.isOnline && <span className="online-indicator"></span>}
              </div>
              
              <div className="chat-user-details">
                <h3>{chatInfo?.sellerName}</h3>
                <p className="chat-user-status">
                  {chatInfo?.isOnline
                    ? t('chat.online')
                    : t('chat.lastSeen', { time: formatLastSeen(chatInfo?.lastSeen) })
                  }
                </p>
              </div>
            </div>
          </div>
          
         
        </div>
        
        {/* Product Info Bar */}
        {chatInfo?.productName && (
          <div className="chat-product-info">
            <div className="product-info-content">
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
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.sender === 'user' ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  {msg.text && <p className="message-text">{msg.text}</p>}
                  
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
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'user' && <MessageStatus status={msg.status} />}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
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
        
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((att) => (
              <div key={att.id} className="attachment-preview">
                {att.type === 'image' ? (
                  <img src={att.preview} alt="Preview" />
                ) : (
                  <div className="file-preview">
                    <File size={20} />
                  </div>
                )}
                <button 
                  className="remove-attachment"
                  onClick={() => removeAttachment(att.id)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Message Input */}
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <div className="chat-input-wrapper">
            <button 
              type="button"
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={20} />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,.pdf,.doc,.docx"
              hidden
            />
            
            <input
              type="text"
              className="message-input"
              placeholder={t('chat.typeMessage')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
            />
            
             
            
            <button 
              type="submit"
              className="send-btn"
              disabled={!message.trim() && attachments.length === 0 || sending}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
      
     
    </div>
  );
};

export default ChatPage;