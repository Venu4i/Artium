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
        res.status(201).json(community);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all communities
export const getAllCommunities = async (req, res) => {
    try {
        const communities = await Community.find();
        res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get communities where the user is a member
export const getMyCommunities = async (req, res) => {
    try {
        const communities = await Community.find({ members: req.user._id });
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
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ error: "Community not found" });

        if (community.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only admin can handle requests" });
        }

        const requestIndex = community.pendingRequests.indexOf(userId);
        if (requestIndex === -1) return res.status(404).json({ error: "Request not found" });

        community.pendingRequests.splice(requestIndex, 1);
        community.members.push(userId);
        await community.save();
        res.status(200).json({ message: "Request approved" });
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

        const inviteLink = `${req.protocol}://${req.get("host")}/api/communities/invite/${token}`;
        res.status(200).json({ inviteLink });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Accept invite link
export const acceptInviteLink = async (req, res) => {
    try {
        const { token } = req.params;
        const community = await Community.findOne({ "invites.token": token });
        if (!community) return res.status(404).json({ error: "Invalid or expired invite" });

        const invite = community.invites.find((i) => i.token === token);
        if (!invite || invite.status !== "pending") {
            return res.status(400).json({ error: "Invite already used or expired" });
        }

        invite.status = "accepted";
        community.members.push(req.user._id);
        await community.save();
        res.status(200).json({ message: "Joined community successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
