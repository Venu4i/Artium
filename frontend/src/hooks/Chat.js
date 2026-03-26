import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useChat = (conversationId, receiverId) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    // Listen for incoming messages from your handlers.js
    socket.on("new-message", (message) => {
      // Only add if it belongs to this active conversation
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("new-message");
  }, [socket, conversationId]);

  const sendMessage = (content) => {
    if (socket && content.trim()) {
      const payload = {
        content,
        receiver: receiverId,
        conversationId,
        attachments: []
      };
      console.log("📤 Emitting send-message:", payload);
      socket.emit("send-message", payload);
    }
  };

  return { messages, setMessages, sendMessage };
};