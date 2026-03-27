import api from "../api/axios";

export const chatService = {
  getDiscoveryUsers: async () => {
    const response = await api.get("/conversations/discovery");
    return response.data; // Returns { success: true, data: [...] }
  },

  getMyConversations: async () => {
    const res = await api.get("/conversations");
    return res.data; // Consistency: return the whole response object
  },

  async getMessages(conversationId, communityId) {
    const response = await api.get("/messages", {
        params: {
            conversationId: conversationId || undefined,
            communityId: communityId || undefined
        }
    });
    return response.data;
},

  markAsRead: async (conversationId) => {
    const res = await api.post("/messages/read", { conversationId });
    return res.data;
  },

  getOrCreateConversation: async (userId) => {
    const res = await api.post("/conversations", { userId });
    return res.data;
  }
};
