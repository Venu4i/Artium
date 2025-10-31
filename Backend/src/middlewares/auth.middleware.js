import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const bearerToken = req.header("Authorization");
  const token =
    req.cookies?.accessToken ||
    (bearerToken && bearerToken.startsWith("Bearer ")
      ? bearerToken.replace("Bearer ", "")
      : null);

  if (!token) {
    throw new ApiError(401, "Unauthorized access. Token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded?._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = user; // or req.userId = user._id for lighter requests
  next();
});
