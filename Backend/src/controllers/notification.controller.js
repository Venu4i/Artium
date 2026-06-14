import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Notification from "../models/Notification.model.js";

// 1. Get user notifications
export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const notifications = await Notification.find({ user: userId })
        .populate("owner", "username profilePicture")
        .sort({ createdAt: -1 })
        .limit(50); // Get last 50 notifications
        
    return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

// 2. Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    );
    
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }
    
    return res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
});

// 3. Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
    );
    
    return res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"));
});
