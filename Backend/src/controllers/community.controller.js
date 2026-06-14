import Community from "../models/Community.model.js";
import crypto from "crypto";
import Notification from "../models/Notification.model.js";

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

        if (community.isPrivate) {
            return res.status(403).json({ error: "This community is private and invite-only." });
        }

        if (community.pendingRequests.includes(req.user._id) || community.members.includes(req.user._id)) {
            return res.status(400).json({ error: "Already requested or a member" });
        }

        community.pendingRequests.push(req.user._id);
        await community.save();

        // Notify the community admin
        const notif = await Notification.create({
            user: community.admin,
            type: "join_request",
            owner: req.user._id,
            community: communityId,
            message: `${req.user.username} requested to join ${community.name}.`
        });
        
        const populatedNotif = await Notification.findById(notif._id).populate("owner", "username profilePicture");
        if (req.io) {
            req.io.to(community.admin.toString()).emit("new-notification", populatedNotif);
        }

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

        if (status === 'approve') {
            const notif = await Notification.create({
                user: request.user,
                type: "request_accepted",
                owner: req.user._id,
                community: communityId,
                message: `Your request to join ${community.name} has been accepted.`
            });
            const populatedNotif = await Notification.findById(notif._id).populate("owner", "username profilePicture");
            if (req.io) {
                req.io.to(request.user.toString()).emit("new-notification", populatedNotif);
            }
        }

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

// Get leaderboard for a community
export const getLeaderboard = async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId)
            .populate("members", "username profilePicture points completedChallenges");

        if (!community) return res.status(404).json({ error: "Community not found" });

        // Calculate rankings
        let membersData = community.members
            .filter(member => member._id.toString() !== community.admin.toString()) // Admin doesn't participate
            .map(member => {
                const points = member.points?.communities?.get(community._id.toString()) || 0;
                // For simplicity, we just count their global completed challenges or filter by community if needed
                // It's fine to just return length for MVP
                const challengesCount = member.completedChallenges ? member.completedChallenges.length : 0;

                return {
                    id: member._id,
                    name: member.username,
                    avatar: member.profilePicture,
                    points: points,
                    challenges: challengesCount,
                    isCurrentUser: member._id.toString() === req.user._id.toString()
                };
            });

        // Sort by points descending
        membersData.sort((a, b) => b.points - a.points);

        // Assign ranks
        membersData = membersData.map((member, index) => ({
            ...member,
            rank: index + 1
        }));

        res.status(200).json({ leaderboard: membersData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get recent activity (notifications) for a community
export const getCommunityActivity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ error: "Community not found" });

        // Fetch notifications related to this community
        const activity = await Notification.find({ community: communityId })
            .sort({ createdAt: -1 })
            .populate("owner", "username profilePicture")
            .limit(20);

        res.status(200).json({ activity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a community
export const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        const community = await Community.findById(id);
        if (!community) return res.status(404).json({ error: "Community not found" });

        // Verify admin
        if (community.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the admin can edit this community" });
        }

        // Handle uploaded files (avatar, coverImage)
        let avatarUrl = community.avatar;
        let coverImageUrl = community.coverImage;

        if (req.files) {
            if (req.files.avatar && req.files.avatar.length > 0) {
                avatarUrl = req.files.avatar[0].path;
            }
            if (req.files.coverImage && req.files.coverImage.length > 0) {
                coverImageUrl = req.files.coverImage[0].path;
            }
        }

        community.name = name || community.name;
        community.description = description !== undefined ? description : community.description;
        community.avatar = avatarUrl;
        community.coverImage = coverImageUrl;

        await community.save();

        res.status(200).json({ success: true, community });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};