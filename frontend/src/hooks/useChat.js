import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useSelector } from 'react-redux';
import { chatService } from '../services/chatService';

export const useChat = (conversationId, receiverId) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Get current user from Redux to identify "me" vs "them"
  const { user: currentUser } = useSelector((state) => state.auth);

  /**
   * 1. Load History
   * Fetches past messages from the DB when the conversation changes
   */
  useEffect(() => {
    const loadHistory = async () => {
      if (!conversationId) return;
      try {
        console.log(`📂 Loading history for canvas: ${conversationId}`);
        const historyResponse = await chatService.getMessages(conversationId);
        setMessages(historyResponse.data || []);
      } catch (err) {
        console.error("❌ Failed to load Chroma history:", err.message);
      }
    };

    loadHistory();
  }, [conversationId]);

  /**
   * 2. Real-time Listeners
   * Handles incoming messages and typing indicators
   */
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Listen for "new-message" from your backend socket/handlers.js
    const handleNewMessage = (message) => {
      // Logic: Only update state if the message belongs to THIS active chat
      if (message.conversationId === conversationId || message.sender === receiverId) {
        console.log("📩 New Chroma Message:", message.content);
        setMessages((prev) => [...prev, message]);
        
        // Mark as read automatically if we are looking at the chat
        chatService.markAsRead(conversationId);
      }
    };

    socket.on("new-message", handleNewMessage);

    // Cleanup listeners on unmount or chat change
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, conversationId, receiverId]);

  /**
   * 3. Send Message
   * Matches the payload structure in your socket/handlers.js
   */
  const sendMessage = useCallback((content, attachments = []) => {
    if (!socket || !content.trim()) return;

    const messageData = {
      content,
      receiver: receiverId,
      conversationId,
      attachments,
    };

    console.log("📤 Emitting send-message:", messageData);
    socket.emit("send-message", messageData);

    // Note: We don't manually push to 'messages' here because 
    // your backend emits 'new-message' back to the sender too.
  }, [socket, receiverId, conversationId]);

  return {
    messages,
    sendMessage,
    isTyping,
    isConnected: !!socket?.connected
  };
};