import Community from "../models/Community.model.js";
import crypto from "crypto";

// Create a new community
export const createCommunity = async (req, res) => {
    try {
        const { name, description, isPrivate } = req.body;
        const community = new Community({
            name,
            description,
            isPrivate,
            admin: req.user._id,
            members: [req.user._id],
        });
        await community.save();
        const populatedCommunity = await community.populate("admin", "username avatar");
        res.status(201).json(community);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all communities
export const getAllCommunities = async (req, res) => {
    try {
        const communities = await Community.find({
            admin: { $ne: req.user._id },
            members: { $ne: req.user._id }
        }).populate("admin", "username avatar");
                res.status(200).json(communities);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        };

export const getMyCommunities = async (req, res) => {
    try {
        const userId = req.user._id;

        const communities = await Community.find({
            $or: [
                { admin: userId },
                { members: userId },
                { pendingRequests: userId }
            ]
        })
        .populate("admin", "username avatar") // Populating makes your frontend UI look better
        .populate("pendingRequests", "username avatar"); // Essential for the Admin Panel to show names

        // Since your frontend expects a raw array based on our recent debug
        res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Request to join a community
export const requestToJoin = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ error: "Community not found" });

        if (community.pendingRequests.includes(req.user._id) || community.members.includes(req.user._id)) {
            return res.status(400).json({ error: "Already requested or a member" });
        }

        community.pendingRequests.push(req.user._id);
        await community.save();
        res.status(200).json({ message: "Request sent" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle join request (Admin only)
export const handleJoinRequest = async (req, res) => {
    try {
        const { communityId, userId } = req.params;
        const { status } = req.body; // Expect 'approve' or 'reject' from frontend

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ error: "Community not found" });

        if (community.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only admin can handle requests" });
        }

        const requestIndex = community.pendingRequests.indexOf(userId);
        if (requestIndex === -1) return res.status(404).json({ error: "Request not found" });

        // Remove them from pending requests regardless of approval/rejection
        community.pendingRequests.splice(requestIndex, 1);

        // Only add to members if approved
        if (status === 'approve') {
            community.members.push(userId);
        }

        await community.save();
        res.status(200).json({ 
            success: true, 
            message: `Request ${status === 'approve' ? 'approved' : 'rejected'}` 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate invite link
export const generateInviteLink = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ error: "Community not found" });

        if (!community.members.includes(req.user._id)) {
            return res.status(403).json({ error: "Only members can generate invites" });
        }

        const token = crypto.randomBytes(16).toString("hex");
        const invite = {
            email: req.body.email,
            token,
            invitedBy: req.user._id,
        };

        community.invites.push(invite);
        await community.save();

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const inviteLink = `${clientUrl}/community/invite/${token}`;
        res.status(200).json({ inviteLink });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Accept invite link
export const acceptInviteLink = async (req, res) => {
    try {
        // NOTE: If your route is POST /community/invite/accept and sends token in body, use req.body.
        // If your route is GET /community/invite/:token, use req.params.
        const { token } = req.params; 

        const community = await Community.findOne({ "invites.token": token });
        if (!community) return res.status(404).json({ error: "Invalid or expired invite" });

        const invite = community.invites.find((i) => i.token === token);
        if (!invite || invite.status !== "pending") {
            return res.status(400).json({ error: "Invite already used or expired" });
        }

        // FIX 1: Prevent duplicate members
        if (community.members.includes(req.user._id)) {
            return res.status(400).json({ error: "You are already a member of this community" });
        }

        // Update the invite status
        invite.status = "accepted";
        community.members.push(req.user._id);

        // BONUS FIX: If they were waiting for approval, remove them from the pending list
        community.pendingRequests = community.pendingRequests.filter(
            (id) => id.toString() !== req.user._id.toString()
        );

        await community.save();

        // FIX 2: Return the community._id so React can redirect them to the chat!
        res.status(200).json({ 
            success: true,
            message: "Joined community successfully",
            communityId: community._id 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
            .populate("admin", "username avatar")
            .populate("members", "username avatar")
            .populate("pendingRequests", "username avatar"); // 👈 CRITICAL

        if (!community) return res.status(404).json({ error: "Not found" });
        res.status(200).json(community);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};