import API_BASE_URL, { apiRequest, buildApiUrl } from "../config/api";
import authService from "./authService";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class MessagingService {
  constructor() {
    this.stompClient = null;
    this.connectPromise = null;
    this.subscriptions = new Map();
    this.connectionRetryCount = 0;
    this.maxRetryCount = 5;
    this.reconnectDelay = 5000;
    this.messageHandlers = new Map();
    this.connectionStatusHandlers = new Set();
  }

  // REST API Methods

  // Start a new conversation
  async startConversation(postId, initialMessage) {
    const response = await apiRequest("/conversations", {
      method: "POST",
      body: JSON.stringify({
        postId,
        initialMessage,
      }),
    });
    return response;
  }

  // Get user's conversations
  async getConversations(page = 0, size = 20) {
    const queryParams = new URLSearchParams({ page, size });
    const response = await apiRequest(`/conversations?${queryParams}`, {
      method: "GET",
    });
    return response;
  }

  // Get single conversation
  async getConversation(conversationId) {
    const response = await apiRequest(`/conversations/${conversationId}`, {
      method: "GET",
    });
    return response;
  }

  // Get messages in a conversation
  async getMessages(conversationId, cursor = null, size = 20) {
    const queryParams = new URLSearchParams({ size });
    if (cursor) queryParams.append("cursor", cursor);

    const response = await apiRequest(
      `/conversations/${conversationId}/messages?${queryParams}`,
      {
        method: "GET",
      }
    );
    return response;
  }

  // Send a message
  async sendMessage(conversationId, content) {
    const response = await apiRequest(
      `/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      }
    );
    return response;
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId) {
    await apiRequest(`/conversations/${conversationId}/messages/read`, {
      method: "POST",
    });
  }

  // Update conversation status
  async updateMuteStatus(conversationId, muted) {
    const queryParams = new URLSearchParams({ muted });
    await apiRequest(`/conversations/${conversationId}/mute?${queryParams}`, {
      method: "PUT",
    });
  }

  async updateArchiveStatus(conversationId, archived) {
    const queryParams = new URLSearchParams({ archived });
    await apiRequest(
      `/conversations/${conversationId}/archive?${queryParams}`,
      {
        method: "PUT",
      }
    );
  }

  async updateBlockStatus(conversationId, blocked) {
    const queryParams = new URLSearchParams({ blocked });
    await apiRequest(`/conversations/${conversationId}/block?${queryParams}`, {
      method: "PUT",
    });
  }

  async markConversationAsSeen(conversationId) {
    await apiRequest(`/conversations/${conversationId}/seen`, {
      method: "POST",
    });
  }

  // Get total unread messages count
  async getUnreadCount() {
    try {
      const response = await apiRequest("/conversations?page=0&size=1", {
        method: "GET",
      });
      return response.totalUnreadConversations || 0;
    } catch (error) {
      // Error fetching unread count: error
      return 0;
    }
  }

  // WebSocket Methods

  // Connect to WebSocket (resolves ONLY after STOMP CONNECT)
  connect() {
    // Already connected
    if (this.stompClient && this.stompClient.connected) {
      return Promise.resolve();
    }

    // In-flight connection attempt
    if (this.connectPromise) {
      return this.connectPromise;
    }

    const token = authService.getAccessToken();
    if (!token) {
      return Promise.reject(new Error("No authentication token available"));
    }

    const wsUrl = `${buildApiUrl("/ws")}?token=${encodeURIComponent(token)}`;

    // Create STOMP client with SockJS factory
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        token: token,
      },
      reconnectDelay: this.reconnectDelay,
      debug: () => {}, // silence logs
    });

    this.connectPromise = new Promise((resolve, reject) => {
      let settled = false;

      this.stompClient.onConnect = () => {
        settled = true;
        // WebSocket connected
        this.connectionRetryCount = 0;
        this.notifyConnectionStatus(true);
        this.connectPromise = null;
        resolve();
      };

      this.stompClient.onStompError = (frame) => {
        // STOMP error: frame.headers?.message, frame.body
        this.notifyConnectionStatus(false);
        if (!settled && this.connectPromise) {
          settled = true;
          const err = new Error(frame.headers?.message || "STOMP error");
          this.connectPromise = null;
          reject(err);
        }
      };

      this.stompClient.onWebSocketError = (event) => {
        // WebSocket error: event
        this.notifyConnectionStatus(false);
        if (!settled && this.connectPromise) {
          settled = true;
          this.connectPromise = null;
          reject(new Error("WebSocket error"));
        }
      };

      this.stompClient.onWebSocketClose = () => {
        this.notifyConnectionStatus(false);
      };

      this.stompClient.activate();
    });

    return this.connectPromise;
  }

  // Disconnect from WebSocket
  async disconnect() {
    if (this.stompClient) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe && subscription.unsubscribe();
        } catch {}
      });
      this.subscriptions.clear();

      try {
        await this.stompClient.deactivate();
      } catch (e) {
        // noop
      } finally {
        this.notifyConnectionStatus(false);
        this.stompClient = null;
        this.connectPromise = null;
      }
    }
  }

  // Subscribe to receive messages
  async subscribeToMessages(onMessageReceived) {
    await this.connect();

    const user = authService.getCurrentUser();
    if (!user) return () => {}; // Return empty cleanup function

    // Subscribe to user's message queue
    const subscription = this.stompClient.subscribe(
      `/user/queue/messages`,
      (message) => {
        const messageData = JSON.parse(message.body);
        onMessageReceived(messageData);
      }
    );

    this.subscriptions.set("messages", subscription);

    // Return cleanup function
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
        this.subscriptions.delete("messages");
      }
    };
  }

  // Subscribe to read receipts
  async subscribeToReadReceipts(onReadReceipt) {
    await this.connect();

    const subscription = this.stompClient.subscribe(
      `/user/queue/read-receipts`,
      (message) => {
        const receiptData = JSON.parse(message.body);
        onReadReceipt(receiptData);
      }
    );

    this.subscriptions.set("read-receipts", subscription);

    // Return cleanup function
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
        this.subscriptions.delete("read-receipts");
      }
    };
  }

  // Subscribe to typing status for a conversation
  async subscribeToTypingStatus(conversationId, onTypingStatus) {
    await this.connect();

    const subscription = this.stompClient.subscribe(
      `/topic/conversation.${conversationId}.typing`,
      (message) => {
        const typingData = JSON.parse(message.body);
        onTypingStatus(typingData);
      }
    );

    const subKey = `typing-${conversationId}`;
    this.subscriptions.set(subKey, subscription);

    // Return cleanup function
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
        this.subscriptions.delete(subKey);
      }
    };
  }
  // Subscribe to per-conversation messages topic
  async subscribeToConversationMessages(conversationId, onMessageReceived) {
    await this.connect();

    const destination = `/topic/conversation.${conversationId}.messages`;
    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const messageData = JSON.parse(message.body);
        onMessageReceived(messageData);
      } catch (e) {
        // Failed to parse conversation message: e
      }
    });

    const subKey = `conv-msg-${conversationId}`;
    this.subscriptions.set(subKey, subscription);

    // Return cleanup function
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
        this.subscriptions.delete(subKey);
      }
    };
  }

  // Send typing status
  async sendTypingStatus(conversationId, typing) {
    await this.connect();
    this.stompClient.publish({
      destination: `/app/conversations/${conversationId}/typing`,
      body: JSON.stringify({ typing }),
    });
  }

  // Send message via WebSocket (alternative to REST)
  async sendMessageViaWebSocket(conversationId, content) {
    await this.connect();
    this.stompClient.publish({
      destination: `/app/conversations/${conversationId}/send`,
      body: JSON.stringify({ content }),
    });
  }

  // Connection status management
  onConnectionStatusChange(handler) {
    this.connectionStatusHandlers.add(handler);
    return () => {
      this.connectionStatusHandlers.delete(handler);
    };
  }

  notifyConnectionStatus(connected) {
    this.connectionStatusHandlers.forEach((handler) => {
      handler(connected);
    });
  }

  // Check if connected
  isConnected() {
    return this.stompClient && this.stompClient.connected;
  }
}

// Create singleton instance
const messagingService = new MessagingService();

// Auto-connect when user is authenticated
if (authService.isAuthenticated()) {
  messagingService.connect().catch(() => {
    // Error connecting messaging service
  });
}

// Disconnect on logout
window.addEventListener("auth:logout", () => {
  messagingService.disconnect();
});

export default messagingService;
