import Community from "../models/Community.model.js";
import JoinRequest from "../models/JoinRequest.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";

/**
 * @desc Create a new community
 * @route POST /api/community/create
 */
export const createCommunity = asyncHandler(async (req, res) => {
    const { name, description, isPrivate } = req.body;

    if (!name) throw new ApiError(400, "Community name is required");

    const community = await Community.create({
        name,
        description,
        isPrivate,
        admin: req.user._id,
        members: [req.user._id],
    });

    res.status(201).json(new ApiResponse(201, community, "Community created successfully"));
});


/**
 * @desc Send join request to community
 * @route POST /api/community/:id/join
 */
export const sendJoinRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const community = await Community.findById(id);

    if (!community) throw new ApiError(404, "Community not found");

    // CASE 1: Public Community (Direct Join)
    if (!community.isPrivate) {
        if (!community.members.includes(req.user._id)) {
            community.members.push(req.user._id);
            await community.save();

            // 🔔 Emit to Community Room
            req.io.to(id).emit("new_member_joined", {
                userId: req.user._id,
                username: req.user.username
            });
        }
        return res.status(200).json(new ApiResponse(200, community, "Joined successfully"));
    }

    // CASE 2: Private Community (Request needed)
    const existing = await JoinRequest.findOne({ community: id, user: req.user._id });
    if (existing) throw new ApiError(400, "Request already sent");

    const request = await JoinRequest.create({ community: id, user: req.user._id });

    // 🔔 Emit to Admin's Private Room
    req.io.to(community.admin.toString()).emit("notification", {
        type: "JOIN_REQUEST",
        message: `${req.user.username} wants to join ${community.name}`,
        data: { requestId: request._id, communityId: id }
    });

    res.status(201).json(new ApiResponse(201, request, "Request sent"));
});


/**
 * @desc View all pending join requests (admin only)
 * @route GET /api/community/:id/requests
 */
export const viewPendingRequests = asyncHandler(async (req, res) => {
    const { id } = req.params; // communityId

    const community = await Community.findById(id);
    if (!community) throw new ApiError(404, "Community not found");

    if (community.admin.toString() !== req.user._id.toString())
        throw new ApiError(403, "Not authorized");

    const requests = await JoinRequest.find({ community: id, status: "pending" })
        .populate("user", "name email");

    res.json(new ApiResponse(200, requests, "Pending requests fetched"));
});


/**
 * @desc Approve or reject join request
 * @route PUT /api/community/:id/requests/:reqId
 */
export const handleJoinRequest = asyncHandler(async (req, res) => {
    const { id, reqId } = req.params; // communityId, requestId
    const { action } = req.body; // "approve" or "reject"

    const community = await Community.findById(id);
    const request = await JoinRequest.findById(reqId);

    if (!community) throw new ApiError(404, "Community not found");
    if (community.admin.toString() !== req.user._id.toString())
        throw new ApiError(403, "Not authorized");
    if (!request || request.community.toString() !== id)
        throw new ApiError(404, "Request not found");

    if (action === "approve") {
        if (!community.members.includes(request.user._id)) {
            community.members.push(request.user._id);
        }
        request.status = "approved";

        // 🔔 Notify User: Request Approved
        req.io.to(request.user._id.toString()).emit("notification", {
            type: "REQUEST_APPROVED",
            message: `Welcome! You have been added to ${community.name}`,
            data: { communityId: id }
        });

        // 🔔 Notify Community: New Member
        req.io.to(id).emit("new_member_joined", {
            userId: request.user._id,
            username: request.user.username
        });

    } else if (action === "reject") {
        request.status = "rejected";
        // 🔔 Notify User: Request Rejected
        req.io.to(request.user._id.toString()).emit("notification", {
            type: "REQUEST_REJECTED",
            message: `Your request to join ${community.name} was rejected`,
        });
    }

    await request.save();
    await community.save();

    res.json(new ApiResponse(200, null, `Request ${action}ed successfully`));
});


/**
 * @desc Send invite link to user (admin only)
 * @route POST /api/community/:id/invite
 */
export const sendInvite = async (req, res) => {
    const { id } = req.params; // communityId
    const { email } = req.body;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    //  Allow all members, not just admin
    if (!community.members.map(m => m.toString()).includes(req.user.id)) {
        return res.status(403).json({ message: "You must be a community member to send invites." });
    }

    // Generate a unique token
    const token = crypto.randomBytes(20).toString("hex");

    community.invites.push({ email, token, invitedBy: req.user.id });
    await community.save();

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;

    // Optional: send via email
    // await sendInviteEmail(email, community.name, inviteLink);

    res.json({
        success: true,
        message: "Invite link generated successfully.",
        inviteLink
    });
};



/**
 * @desc Accept invite and join community
 * @route GET /api/community/invite/:token
 */
export const acceptInvite = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const community = await Community.findOne({ "invites.token": token });
    if (!community) throw new ApiError(404, "Invalid or expired invite");

    const invite = community.invites.find(i => i.token === token);
    if (invite.status === "accepted")
        throw new ApiError(400, "Invite already used");

    invite.status = "accepted";

    if (!community.members.includes(req.user._id)) {
        community.members.push(req.user._id);
        await community.save();

        // 🔔 Notify Community: New Member
        req.io.to(community._id.toString()).emit("new_member_joined", {
            userId: req.user._id,
            username: req.user.username
        });
    }

    res.json(new ApiResponse(200, null, "Joined via invite"));
});
