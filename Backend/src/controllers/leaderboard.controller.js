import User from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Global Leaderboard
export const getGlobalLeaderboard = async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;

    const users = await User.find()
        .sort({ "points.global": -1 })
        .limit(limit)
        .select("username profilePicture points completedChallenges");

    return res.status(200).json(new ApiResponse(200, users, "Global leaderboard retrieved"));
};

// Community Leaderboard (Pantheon)
export const getCommunityLeaderboard = async (req, res) => {
    const { communityId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const sortKey = `points.communities.${communityId}`;
    
    const query = {};
    query[sortKey] = { $exists: true };

    const sortConfig = {};
    sortConfig[sortKey] = -1;
    // Tie-break by completed challenges count (more challenges completed = higher rank)
    // Unfortunately Mongoose doesn't allow sorting by array length directly in find().sort() without aggregation.
    // We can do an aggregation pipeline for perfect sorting.

    const users = await User.aggregate([
        { $match: query },
        { 
            $addFields: { 
                challengesCount: { $size: "$completedChallenges" } 
            } 
        },
        { 
            $sort: { 
                [sortKey]: -1, 
                challengesCount: -1 
            } 
        },
        { $limit: limit },
        { 
            $project: { 
                username: 1, 
                profilePicture: 1, 
                points: 1, 
                challengesCount: 1 
            } 
        }
    ]);

    return res.status(200).json(new ApiResponse(200, users, "Community leaderboard retrieved"));
};
