import { ApiError } from "../utils/ApiError.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

const verifyToken = AsyncHandler( async(req, res, next) => {            // used asyncHandler to catch db errors
    // 1. get the accessToken from cookie
    // 2. verify it with the jwt.verify giving access secret key
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "")  
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        let decodedPayload
        try {                                                                             // using it just for custom message
            decodedPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)           //returns decoded PAYLOAD  
        } catch (error) {
            throw new ApiError(401, "Invalid or expired access token")
        }             
        const user = await User.findById( decodedPayload._id ).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "User not found for this token")
        }
        req.user = user
        next();
})

export { verifyToken }