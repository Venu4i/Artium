import api from "../api/axios";

const userService = {
    getGlobalLeaderboard: async () => {
        try {
            const response = await api.get('/user/leaderboard');
            return response.data;
        } catch (error) {
            console.error("Error fetching global leaderboard:", error);
            throw error;
        }
    }
};

export default userService;
