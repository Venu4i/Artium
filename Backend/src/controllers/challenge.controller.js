import Challenge from "../models/Challenge.model.js";
import Community from "../models/Community.model.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

/**
 * @description Admin creates a new challenge for a community
 * @route POST /api/v1/challenges/:communityId
 */
export const createChallenge = async (req, res) => {
    const { communityId } = req.params;
    const { title, description, deadline, rewardPoints } = req.body;

    if (!title || !description || !deadline) {
        throw new ApiError(400, "Title, description, and deadline are required");
    }

    const community = await Community.findById(communityId);
    if (!community) throw new ApiError(404, "Community not found");

    // Authorization: Only the community admin can create challenges
    if (community.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized: Only the admin can create challenges");
    }

    const challenge = await Challenge.create({
        title,
        description,
        community: communityId,
        createdBy: req.user._id,
        deadline: new Date(deadline),
        rewardPoints: Number(rewardPoints) || 10,
        bannerImage: req.file?.path || "" 
    });

    return res
        .status(201)
        .json(new ApiResponse(201, challenge, "Challenge created successfully"));
};

/**
 * @description User submits content to a challenge and earns points
 * @route POST /api/v1/challenges/:challengeId/submit
 */
export const submitToChallenge = async (req, res) => {
    const { challengeId } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new ApiError(404, "Challenge not found");

    // 1. Check if the challenge is still active
    if (new Date() > new Date(challenge.deadline)) {
        throw new ApiError(400, "This challenge has expired");
    }

    // 2. Check if user already submitted (Prevent point farming)
    const existingSubmission = challenge.submissions.find(
        (s) => s.user.toString() === userId.toString()
    );
    if (existingSubmission) {
        throw new ApiError(400, "You have already completed this challenge");
    }

    // 3. Update the Challenge Submissions 
    // (In a real app, you'd create an Artwork/Post document first and use that ID)
    challenge.submissions.push({
        user: userId,
        content: new mongoose.Types.ObjectId(), // Placeholder for Artwork ID
        submittedAt: new Date()
    });
    await challenge.save();

    // 4. Update User Profile: Add points and track completion
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $inc: { points: challenge.rewardPoints },
            $addToSet: { completedChallenges: challenge._id } 
        },
        { new: true }
    ).select("username points completedChallenges");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Challenge completed! Points awarded."));
};

/**
 * @description Get all challenges for a specific community
 * @route GET /api/v1/challenges/community/:communityId
 */
export const getCommunityChallenges = async (req, res) => {
    const { communityId } = req.params;

    const challenges = await Challenge.find({ community: communityId })
        .sort({ createdAt: -1 })
        .select("-submissions"); // Hide submissions for the list view

    return res
        .status(200)
        .json(new ApiResponse(200, challenges, "Challenges retrieved successfully"));
};

/**
 * @description Get challenge details and current submissions
 * @route GET /api/v1/challenges/:challengeId
 */
export const getChallengeDetails = async (req, res) => {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId)
        .populate("submissions.user", "username profilePicture")
        .populate("createdBy", "username");

    if (!challenge) throw new ApiError(404, "Challenge not found");

    return res
        .status(200)
        .json(new ApiResponse(200, challenge, "Challenge details retrieved"));
};

/**
 * @description Get leaderboard based on total user points
 * @route GET /api/v1/challenges/:challengeId/leaderboard
 */
export const getChallengeLeaderboard = async (req, res) => {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new ApiError(404, "Challenge not found");

    // Fetch users who submitted to this challenge, sorted by their total points
    // Note: You can also sort by a community-specific score if you implemented that
    const participants = await User.find({
        completedChallenges: challengeId
    })
    .sort({ points: -1 })
    .limit(20)
    .select("username avatar points");

    return res
        .status(200)
        .json(new ApiResponse(200, participants, "Leaderboard retrieved successfully"));
};