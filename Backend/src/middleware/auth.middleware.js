import { ApiError } from "../utils/ApiError.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import jwt from "jsonwebtoken"

const verifyToken = AsyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decodedPayload;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
});

export { verifyToken }