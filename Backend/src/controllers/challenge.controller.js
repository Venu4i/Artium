import Challenge from "../models/Challenge.model.js";
import Community from "../models/Community.model.js";
import User from "../models/User.model.js";
import Submission from "../models/Submission.model.js";
import Notification from "../models/Notification.model.js";
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

    const bannerImage = req.file?.path;

    const challenge = await Challenge.create({
        title,
        description,
        community: communityId,
        createdBy: req.user._id,
        bannerImage: bannerImage || "",
        deadline: new Date(deadline),
        mediaTypeAccepted: mediaTypeAccepted || "any",
        maxPoints: Number(maxPoints) || 100,
        status: "ACTIVE"
    });

    if (req.io) {
        req.io.to(communityId.toString()).emit("challenge:new", challenge);
    }

    // Notify community members
    const members = community.members.filter(m => m.toString() !== req.user._id.toString());
    for (const memberId of members) {
        const notif = await Notification.create({
            user: memberId,
            type: "challenge",
            owner: req.user._id,
            community: communityId,
            message: `New challenge uploaded in ${community.name}: ${title}`
        });
        const populatedNotif = await Notification.findById(notif._id).populate("owner", "username profilePicture");
        if (req.io) {
            req.io.to(memberId.toString()).emit("new-notification", populatedNotif);
        }
    }

    return res.status(201).json(new ApiResponse(201, challenge, "Challenge created successfully"));
};

// 2. Members Submit
export const submitToChallenge = async (req, res) => {
    const { challengeId } = req.params;
    const userId = req.user._id;
    const { contentId, description } = req.body;
    
    // If a file was uploaded using our upload middleware, its Cloudinary URL is in req.file.path
    // Otherwise fallback to mediaUrl from body (if they somehow pass a direct link)
    const mediaUrl = req.file?.path || req.body.mediaUrl;

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

    // Determine Early Bonus (e.g., if submitted more than 48 hours before deadline)
    // Or if the challenge duration is short, maybe half-way. Let's just use >24h for a nice generic "early" window,
    // or as per UI: "Submit within the next 2 hours" implying there's a specific earlyBonusDeadline.
    // If challenge has no earlyBonusDeadline, let's create a dynamic rule: if time remaining > 24 hours.
    // Wait, let's just make it if they submit > 24 hours before the deadline they get it, 
    // or just checking against a static rule for the sake of the feature.
    const hoursRemaining = (new Date(challenge.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    const earlyBonus = hoursRemaining > 24;

    const submission = await Submission.create({
        submittedBy: userId,
        communityId: challenge.community,
        challengeId,
        mediaUrl: mediaUrl || "",
        content: contentId || null,
        description: description || "",
        earlyBonus: earlyBonus,
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
        let awarded = Number(pointsAwarded) || 0;
        
        // Apply 1.2x early bonus multiplier
        if (submission.earlyBonus) {
            awarded = Math.round(awarded * 1.2);
        }
        
        // If bonus pushes it over maxPoints, cap it or let it exceed? 
        // The prompt says "if an admin gives 1000 points, the user gets exactly 1000 points regardless of earlyBonus. We need to add * 1.2". 
        // Let's cap at maxPoints * 1.2 if we want to be safe, or just let the bonus push it slightly over.
        // Actually, let's clamp the base awarded first, THEN apply the multiplier so the bonus is a true bonus above max.
        let baseAwarded = Number(pointsAwarded) || 0;
        if (baseAwarded > maxPoints) baseAwarded = maxPoints;
        
        if (submission.earlyBonus) {
            submission.pointsAwarded = Math.round(baseAwarded * 1.2);
        } else {
            submission.pointsAwarded = baseAwarded;
        }
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

    // Notify submitter if approved
    if (status === "approved" && oldStatus !== "approved") {
        const notif = await Notification.create({
            user: submission.submittedBy,
            type: "submission_accepted",
            owner: req.user._id,
            community: submission.communityId,
            message: `Your submission for a challenge was accepted! You earned ${submission.pointsAwarded} points.`
        });
        const populatedNotif = await Notification.findById(notif._id).populate("owner", "username profilePicture");
        if (req.io) {
            req.io.to(submission.submittedBy.toString()).emit("new-notification", populatedNotif);
        }
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