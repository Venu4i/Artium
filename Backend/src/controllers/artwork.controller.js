import { Artwork } from "../models/Artwork.model.js";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 1. Upload Artwork
const uploadArtwork = asyncHandler(async (req, res) => {
    console.log('Upload started');
    const { title, description, tags, communityId } = req.body;

    if (!req.file) {
        throw new ApiError(400, "Image file is required");
    }

    const artwork = await Artwork.create({
        title,
        description,
        image: req.file.path,
        imagePublicId: req.file.filename,
        owner: req.user._id,
        community: communityId || null,
        tags: tags ? tags.split(",").map(tag => tag.trim()) : []
    });
    console.log('Upload process');
    await User.findByIdAndUpdate(req.user._id, {
        $push: { posts: artwork._id }
    });
    console.log('Upload completed');
    return res
        .status(201)
        .json(new ApiResponse(201, artwork, "Artwork uploaded successfully"));
});

// 2. Get Feed (Recent Artworks) – includes likedByMe when user is logged in
const getFeed = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?._id;

    const artworks = await Artwork.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "username profilePicture");

    const list = artworks.map((a) => {
        const plain = a.toObject();
        plain.likedByMe = userId ? a.likes.some((id) => id.toString() === userId.toString()) : false;
        return plain;
    });

    return res
        .status(200)
        .json(new ApiResponse(200, list, "Feed fetched successfully"));
});

// 3. Get single artwork (for modal, with comments populated)
const getArtworkById = asyncHandler(async (req, res) => {
    const { artworkId } = req.params;
    
    const userId = req.user?._id;

    const artwork = await Artwork.findById(artworkId)
        .populate("owner", "username profilePicture")
        .populate("comments.user", "username profilePicture");

    if (!artwork) throw new ApiError(404, "Artwork not found");

    const plain = artwork.toObject();
    plain.likedByMe = userId ? artwork.likes.some((id) => id.toString() === userId.toString()) : false;
    return res
        .status(200)
        .json(new ApiResponse(200, plain, "Artwork fetched successfully"));
});

// 4. Toggle like on artwork (like ↔ dislike)
const toggleLikeArtwork = asyncHandler(async (req, res) => {
    const { artworkId } = req.params;
    const userId = req.user._id;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new ApiError(404, "Artwork not found");

    const hasLiked = artwork.likes.some((id) => id.toString() === userId.toString());

    if (hasLiked) {
        await Artwork.findByIdAndUpdate(artworkId, { $pull: { likes: userId } });
        await User.findByIdAndUpdate(userId, { $pull: { likedPosts: artworkId } });
    } else {
        await Artwork.findByIdAndUpdate(artworkId, { $push: { likes: userId } });
        await User.findByIdAndUpdate(userId, { $push: { likedPosts: artworkId } });
    }

    const updated = await Artwork.findById(artworkId)
        .populate("owner", "username profilePicture")
        .lean();
    updated.likedByMe = !hasLiked;

    return res
        .status(200)
        .json(new ApiResponse(200, { artwork: updated, liked: !hasLiked }, "Like toggled"));
});

// 5. Add comment on artwork
const addComment = asyncHandler(async (req, res) => {
    const { artworkId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) throw new ApiError(400, "Comment text is required");

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) throw new ApiError(404, "Artwork not found");

    artwork.comments.push({ user: userId, text: text.trim() });
    await artwork.save();

    const populated = await Artwork.findById(artworkId)
        .populate("owner", "username profilePicture")
        .populate("comments.user", "username profilePicture")
        .lean();
    const likedByMe = populated.likes.some((id) => id.toString() === userId.toString());
    populated.likedByMe = likedByMe;

    return res
        .status(201)
        .json(new ApiResponse(201, populated, "Comment added"));
});

// 6. Get artworks by owner (for profile "Artworks" tab)
const getArtworksByOwner = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const artworks = await Artwork.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate("owner", "username profilePicture")
        .lean();
    const uid = req.user?._id?.toString();
    const list = artworks.map((a) => ({
        ...a,
        likedByMe: uid ? a.likes.some((id) => id.toString() === uid) : false,
    }));
    return res.status(200).json(new ApiResponse(200, list, "Artworks by owner"));
});

// 7. Get current user's liked artworks (for profile "Liked" tab)
const getMyLikedArtworks = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("likedPosts").lean();
    const ids = user?.likedPosts || [];
    if (ids.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "Liked artworks"));
    }
    const artworks = await Artwork.find({ _id: { $in: ids } })
        .sort({ createdAt: -1 })
        .populate("owner", "username profilePicture")
        .lean();
    const list = artworks.map((a) => ({ ...a, likedByMe: true }));
    return res.status(200).json(new ApiResponse(200, list, "Liked artworks"));
});

// 8. Increment Share count
const incrementShare = asyncHandler(async (req, res) => {
    const { artworkId } = req.params;
    const artwork = await Artwork.findByIdAndUpdate(
        artworkId,
        { $inc: { shares: 1 } },
        { new: true }
    );
    if (!artwork) throw new ApiError(404, "Artwork not found");
    
    return res.status(200).json(new ApiResponse(200, { shares: artwork.shares }, "Share count incremented"));
});

export {
    uploadArtwork,
    getFeed,
    getArtworkById,
    toggleLikeArtwork,
    addComment,
    getArtworksByOwner,
    getMyLikedArtworks,
    incrementShare,
};