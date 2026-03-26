import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const chatService = {
  // Matches your backend route: router.get("/discovery", getDiscoveryUsers)
  getDiscoveryUsers: async () => {
    const response = await apiClient.get("/conversations/discovery");
    return response.data; // Returns { success: true, data: [...] }
  },

  getMyConversations: async () => {
    const res = await apiClient.get("/conversations");
    return res.data; // Consistency: return the whole response object
  },

  getMessages: async (conversationId) => {
    const res = await apiClient.get(`/messages?conversationId=${conversationId}`);
    return res.data; 
  },

  // Matches your message router: router.post("/read", markAsRead)
  markAsRead: async (conversationId) => {
    const res = await apiClient.post("/messages/read", { conversationId });
    return res.data;
  },

  // Added this for your Discovery section logic
  getOrCreateConversation: async (userId) => {
    const res = await apiClient.post("/conversations", { userId });
    return res.data;
  }
};