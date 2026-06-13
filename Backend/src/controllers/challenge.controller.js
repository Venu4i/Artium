import Challenge from "../models/Challenge.model.js";
import Community from "../models/Community.model.js";
import User from "../models/User.model.js";
import Submission from "../models/Submission.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// 1. Admin Creates Challenge
export const createChallenge = async (req, res) => {
    const { communityId } = req.params;
    const { title, description, deadline, maxPoints, mediaTypeAccepted } = req.body;

    if (!title || !description || !deadline) {
        throw new ApiError(400, "Title, description, and deadline are required");
    }

    const community = await Community.findById(communityId);
    if (!community) throw new ApiError(404, "Community not found");

    if (community.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized: Only the admin can create challenges");
    }

    const challenge = await Challenge.create({
        title,
        description,
        community: communityId,
        createdBy: req.user._id,
        deadline: new Date(deadline),
        mediaTypeAccepted: mediaTypeAccepted || "any",
        maxPoints: Number(maxPoints) || 100,
        status: "ACTIVE"
    });

    if (req.io) {
        req.io.to(communityId.toString()).emit("challenge:new", challenge);
    }

    return res.status(201).json(new ApiResponse(201, challenge, "Challenge created successfully"));
};

// 2. Members Submit
export const submitToChallenge = async (req, res) => {
    const { challengeId } = req.params;
    const userId = req.user._id;
    const { mediaUrl, contentId } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new ApiError(404, "Challenge not found");

    if (challenge.status !== "ACTIVE" || new Date() > new Date(challenge.deadline)) {
        throw new ApiError(400, "Submissions are closed for this challenge");
    }

    const existingSubmission = await Submission.findOne({
        challengeId,
        submittedBy: userId
    });

    if (existingSubmission) {
        throw new ApiError(400, "You have already submitted to this challenge");
    }

    const submission = await Submission.create({
        submittedBy: userId,
        communityId: challenge.community,
        challengeId,
        mediaUrl: mediaUrl || "",
        content: contentId || null,
        status: "pending"
    });

    return res.status(201).json(new ApiResponse(201, submission, "Submission successful"));
};

// 3. Admin Closes Submissions Manually
export const closeSubmissions = async (req, res) => {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new ApiError(404, "Challenge not found");

    const community = await Community.findById(challenge.community);
    if (community.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    challenge.status = "SUBMISSION_CLOSED";
    await challenge.save();

    return res.status(200).json(new ApiResponse(200, challenge, "Submissions closed, review can begin"));
};

// 4. Admin Reviews a Submission
export const reviewSubmission = async (req, res) => {
    const { submissionId } = req.params;
    const { status, pointsAwarded, rejectionNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        throw new ApiError(400, "Status must be 'approved' or 'rejected'");
    }

    const submission = await Submission.findById(submissionId).populate("challengeId");
    if (!submission) throw new ApiError(404, "Submission not found");

    const community = await Community.findById(submission.communityId);
    if (community.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    const oldStatus = submission.status;
    const oldPoints = submission.pointsAwarded || 0;

    submission.status = status;
    
    if (status === "approved") {
        const maxPoints = submission.challengeId.maxPoints;
        const awarded = Number(pointsAwarded) || 0;
        submission.pointsAwarded = awarded > maxPoints ? maxPoints : awarded;
        submission.rejectionNote = "";
    } else {
        submission.pointsAwarded = 0;
        submission.rejectionNote = rejectionNote || "";
    }

    await submission.save();

    // Instant point adjustment
    const diffPoints = submission.pointsAwarded - oldPoints;
    let updateQuery = {};

    if (diffPoints !== 0) {
        updateQuery.$inc = {
            "points.global": diffPoints,
            [`points.communities.${submission.communityId}`]: diffPoints
        };
    }

    if (status === "approved" && oldStatus !== "approved") {
        updateQuery.$addToSet = { completedChallenges: submission.challengeId._id };
    } else if (status !== "approved" && oldStatus === "approved") {
        updateQuery.$pull = { completedChallenges: submission.challengeId._id };
    }

    if (Object.keys(updateQuery).length > 0) {
        await User.findByIdAndUpdate(submission.submittedBy, updateQuery);
    }

    if (req.io) {
        req.io.to(submission.submittedBy.toString()).emit("submission:reviewed", submission);
    }

    // Auto-finalize if all submissions are reviewed
    const pendingCount = await Submission.countDocuments({ challengeId: submission.challengeId._id, status: "pending" });
    if (pendingCount === 0) {
        const challenge = await Challenge.findById(submission.challengeId._id);
        if (challenge && challenge.status !== "FINALIZED") {
            challenge.status = "FINALIZED";
            await challenge.save();
            if (req.io) {
                req.io.to(community._id.toString()).emit("challenge:finalized", challenge);
            }
        }
    }

    return res.status(200).json(new ApiResponse(200, submission, "Submission reviewed"));
};

// 5. Admin Finalizes Challenge
export const finalizeChallenge = async (req, res) => {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new ApiError(404, "Challenge not found");

    if (challenge.status === "FINALIZED") {
        throw new ApiError(400, "Challenge is already finalized");
    }

    const community = await Community.findById(challenge.community);
    if (community.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    const pendingSubmissions = await Submission.find({ challengeId, status: "pending" });
    if (pendingSubmissions.length > 0) {
        throw new ApiError(400, "All submissions must be reviewed before finalizing");
    }

    try {
        challenge.status = "FINALIZED";
        await challenge.save();

        if (req.io) {
            req.io.to(community._id.toString()).emit("challenge:finalized", challenge);
        }

        return res.status(200).json(new ApiResponse(200, challenge, "Challenge finalized and points awarded"));

    } catch (error) {
        throw new ApiError(500, "Failed to finalize challenge: " + error.message);
    }
};

export const getChallengeDetails = async (req, res) => {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId)
        .populate("createdBy", "username profilePicture");

    if (!challenge) throw new ApiError(404, "Challenge not found");
    
    const submissions = await Submission.find({ challengeId }).populate("submittedBy", "username profilePicture");

    return res.status(200).json(new ApiResponse(200, { challenge, submissions }, "Challenge details retrieved"));
};

export const getCommunityChallenges = async (req, res) => {
    const { communityId } = req.params;

    const challenges = await Challenge.find({ community: communityId })
        .sort({ createdAt: -1 })
        .lean();

    // Attach submission counts
    const enrichedChallenges = await Promise.all(
        challenges.map(async (challenge) => {
            const count = await Submission.countDocuments({ challengeId: challenge._id });
            return { ...challenge, submissionsCount: count };
        })
    );

    return res.status(200).json(new ApiResponse(200, enrichedChallenges, "Challenges retrieved successfully"));
};

export const getUserSubmissions = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.user._id;

    const submissions = await Submission.find({ 
        communityId, 
        submittedBy: userId 
    }).lean();

    return res.status(200).json(new ApiResponse(200, submissions, "User submissions retrieved"));
};