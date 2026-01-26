import { Artwork } from "../models/Artwork.model.js";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 1. Upload Artwork
const uploadArtwork = asyncHandler(async (req, res) => {
    const { title, description, tags, communityId } = req.body;

    if (!req.file) {
        throw new ApiError(400, "Image file is required");
    }

    // Create the Artwork
    const artwork = await Artwork.create({
        title,
        description,
        image: req.file.path,        // Cloudinary URL
        imagePublicId: req.file.filename, // Cloudinary ID
        owner: req.user._id,
        community: communityId || null,
        tags: tags ? tags.split(",").map(tag => tag.trim()) : []
    });

    // Add to User's posts array
    await User.findByIdAndUpdate(req.user._id, {
        $push: { posts: artwork._id }
    });

    return res
        .status(201)
        .json(new ApiResponse(201, artwork, "Artwork uploaded successfully"));
});

// 2. Get Feed (Recent Artworks)
const getFeed = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const artworks = await Artwork.find()
        .sort({ createdAt: -1 }) // Newest first
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "username profilePicture"); // Get author details

    return res
        .status(200)
        .json(new ApiResponse(200, artworks, "Feed fetched successfully"));
});

export { uploadArtwork, getFeed };