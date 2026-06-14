import User from "../models/User.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import getDataUrl from "../utils/urlGenerator.js";
//import cloudinary from "../config/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: createdUser, accessToken, refreshToken },
      "User registered successfully"
    )
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }
  console.log("incoming", identifier)

  // 1. Normalize the identifier to lowercase to match the registration format
  const normalizedIdentifier = identifier.trim().toLowerCase();

  // 2. Search using the normalized string
  const user = await User.findOne({
    $or: [
      { username: normalizedIdentifier }, 
      { email: normalizedIdentifier }
    ],
  });

  if (!user) {
    // If we still can't find it, let's try a case-insensitive regex search just in case 
    // some old data wasn't lowercased
    const regexUser = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${identifier.trim()}$`, "i") } },
        { email: { $regex: new RegExp(`^${identifier.trim()}$`, "i") } }
      ]
    });

    if (!regexUser) throw new ApiError(404, "User not found");
    // Use regexUser if found
    user = regexUser; 
  }

  if (!user) throw new ApiError(404, "User not found");

  if (user.googleId && !user.password) {
    throw new ApiError(403, "Use Google login for this account");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, googleId, profilePicture } = req.body;

  if (!email || !googleId) {
    throw new ApiError(400, "Google auth data missing");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      username: email.split("@")[0],
      email,
      googleId,
      profilePicture: profilePicture,
      password: null
    });
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Logged in with Google successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Unauthorized");
  }

  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded?._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    return res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "User ID is required");

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "User not found");

  const isValid = await user.isPasswordCorrect(oldPassword);
  if (!isValid) throw new ApiError(401, "Invalid old password");

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});


const editProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // 1. Get all text fields
  const { bio, gender, portfolioLink, instagram, twitter, skills } = req.body;

  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  // 2. Handle Images (Check req.files instead of req.file)
  // Save 'avatar' upload to 'profilePicture' field in DB
  if (req.files && req.files['avatar'] && req.files['avatar'][0]) {
      user.profilePicture = req.files['avatar'][0].path;
  }

  // Save 'coverImage' upload to 'coverImage' field in DB
  if (req.files && req.files['coverImage'] && req.files['coverImage'][0]) {
      user.coverImage = req.files['coverImage'][0].path;
  }

  // 3. Update Text Fields
  if (bio !== undefined) user.bio = bio;
  if (gender !== undefined) user.gender = gender;

  // 4. Update Social Links
  if (!user.socialLinks) user.socialLinks = { instagram: "", twitter: "", portfolio: "" };
  if (instagram !== undefined) user.socialLinks.instagram = instagram;
  if (twitter !== undefined) user.socialLinks.twitter = twitter;
  if (portfolioLink !== undefined) user.socialLinks.portfolio = portfolioLink;

  // 5. Update Skills
  if (skills !== undefined) {
      if (typeof skills === 'string') {
          user.skills = skills.split(',').map(s => s.trim()).filter(s => s !== "");
      }
  }

  await user.save();

  return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
});

const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(200).json(new ApiResponse(200, [], "Empty query"));

  const users = await User.find({
    username: { $regex: query, $options: "i" },
    _id: { $ne: req.user._id }, // Don't show yourself
  }).select("username profilePicture bio");

  return res.status(200).json(new ApiResponse(200, users, "Users found"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  // Compute global rank
  const userPoints = user.points?.global || 0;
  // Count how many users have more points than this user
  const higherRankedCount = await User.countDocuments({ "points.global": { $gt: userPoints } });
  const rank = higherRankedCount + 1;

  return res
    .status(200)
    .json(new ApiResponse(200, { ...user.toObject(), rank }, "User profile fetched successfully"));
});

// Toggle follow / unfollow another user
const toggleFollowUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const targetUserId = req.params.userId;

  if (targetUserId === currentUserId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, "User not found");

  const currentUser = await User.findById(currentUserId);
  const isFollowing = currentUser.following.some(
    (id) => id.toString() === targetUserId
  );

  if (isFollowing) {
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });
  } else {
    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUserId },
    });
  }

  const updatedCurrent = await User.findById(currentUserId)
    .select("following followers")
    .lean();
  const updatedTarget = await User.findById(targetUserId)
    .select("followers following")
    .lean();
  return res.status(200).json(
    new ApiResponse(200, {
      following: !isFollowing,
      myFollowingCount: updatedCurrent.following.length,
      myFollowersCount: updatedCurrent.followers.length,
      targetFollowersCount: updatedTarget.followers.length,
      targetFollowingCount: updatedTarget.following.length,
    }, "Follow toggled")
  );
});

const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find({ "points.global": { $gt: 0 } })
    .sort({ "points.global": -1 })
    .select("username profilePicture points.global completedChallenges points.communities createdAt")
    .lean();

  const leaderboard = users.map((user, index) => {
    // Determine the number of communities they are active in by checking the keys in points.communities
    const communitiesCount = user.points?.communities ? Object.keys(user.points.communities).length : 0;
    
    return {
      _id: user._id,
      rank: index + 1,
      username: user.username,
      avatar: user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      globalPoints: user.points?.global || 0,
      completedChallengesCount: user.completedChallenges?.length || 0,
      communitiesCount: communitiesCount,
      createdAt: user.createdAt,
      isCurrentUser: req.user && req.user._id.toString() === user._id.toString()
    };
  });

  const hasCurrentUser = leaderboard.some(u => u.isCurrentUser);
  if (!hasCurrentUser && req.user) {
    const currentUser = await User.findById(req.user._id).lean();
    if (currentUser) {
      leaderboard.push({
        _id: currentUser._id,
        rank: leaderboard.length + 1,
        username: currentUser.username,
        avatar: currentUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
        globalPoints: currentUser.points?.global || 0,
        completedChallengesCount: currentUser.completedChallenges?.length || 0,
        communitiesCount: currentUser.points?.communities ? Object.keys(currentUser.points.communities).length : 0,
        createdAt: currentUser.createdAt,
        isCurrentUser: true
      });
    }
  }

  return res.status(200).json(
    new ApiResponse(200, leaderboard, "Global leaderboard fetched successfully")
  );
});
export {
  getUserProfile,
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  refreshAccessToken,
  generateAccessAndRefreshTokens,
  getUser,
  changePassword,
  editProfile,
  searchUsers,
  toggleFollowUser,
  getGlobalLeaderboard,
};
