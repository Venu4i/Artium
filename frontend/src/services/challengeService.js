import api from '../api/axios';

const challengeService = {
    // Get all challenges for a specific community
    getCommunityChallenges: async (communityId) => {
        try {
            const response = await api.get(`/challenges/community/${communityId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching community challenges:", error);
            throw error;
        }
    },

    // Get all submissions by the current user for a specific community
    getUserSubmissions: async (communityId) => {
        try {
            const response = await api.get(`/challenges/community/${communityId}/user-submissions`);
            return response.data;
        } catch (error) {
            console.error("Error fetching user submissions:", error);
            throw error;
        }
    },

    // Submit work to a challenge
    submitToChallenge: async (challengeId, submissionData) => {
        try {
            const response = await api.post(`/challenges/${challengeId}/submit`, submissionData);
            return response.data;
        } catch (error) {
            console.error("Error submitting to challenge:", error);
            throw error;
        }
    },

    // Admin: Create Challenge
    createChallenge: async (communityId, challengeData) => {
        try {
            const isFormData = challengeData instanceof FormData;
            const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
            const response = await api.post(`/challenges/${communityId}`, challengeData, { headers });
            return response.data;
        } catch (error) {
            console.error("Error creating challenge:", error);
            throw error;
        }
    },

    generateArtChallenge: async (data) => {
        const res = await api.post("/ai/art-challenge", data);
        return res.data;
    },

    // Admin: Get Challenge Details (includes submissions for Review Queue)
    getChallengeDetails: async (challengeId) => {
        try {
            const response = await api.get(`/challenges/${challengeId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching challenge details:", error);
            throw error;
        }
    },

    // Admin: Review Submission (approve or reject with remarks)
    reviewSubmission: async (submissionId, reviewData) => {
        try {
            const response = await api.put(`/challenges/submission/${submissionId}/review`, reviewData);
            return response.data;
        } catch (error) {
            console.error("Error reviewing submission:", error);
            throw error;
        }
    },

    // Admin: Finalize Challenge
    finalizeChallenge: async (challengeId) => {
        try {
            const response = await api.put(`/challenges/${challengeId}/finalize`);
            return response.data;
        } catch (error) {
            console.error("Error finalizing challenge:", error);
            throw error;
        }
    }
};

export default challengeService;
