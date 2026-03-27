import api from "../api/axios";

const communityService = {
    async createCommunity(data) {
        // Correctly hits router.post("/")
        const response = await api.post("/community", data);
        return response.data;
    },

    async getAllCommunities() {
        const response = await api.get("/community");
        return response.data;
    },

    async getCommunity(id) {
        const response = await api.get(`/community/${id}`);
        return response.data;
    },

    async getMyCommunities() {
        const response = await api.get("/community/my");
        return response.data;
    },
    
    async requestToJoin(communityId) {
        // CHANGED: Matches router.post("/:communityId/request")
        const response = await api.post(`/community/${communityId}/request`);
        return response.data;
    },

    async handleJoinRequest(communityId, userId, status) {
        // CHANGED: Matches router.post("/:communityId/handle/:userId") 
        // Note: status is passed in the body
        const response = await api.post(`/community/${communityId}/handle/${userId}`, { status });
        return response.data;
    },

    async generateInviteLink(communityId, email) {
        // Matches router.post("/:communityId/invite")
        const response = await api.post(`/community/${communityId}/invite`, { email });
        return response.data;
    },

    async acceptInviteLink(token) {
        // CHANGED: Matches router.post("/invite/:token")
        // No body needed because token is in the URL
        const response = await api.post(`/community/invite/${token}`);
        return response.data;
    },
};

export default communityService;