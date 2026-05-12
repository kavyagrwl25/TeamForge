import { AsyncHandler } from "../utils/AsyncHandler.js"            
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"       
import { Project } from "../models/project.model.js"
import { Request } from "../models/request.model.js"         
import { isValidFullName, isValidEmail, isValidPassword, isValidUserName, isValidBio, isValidSkills, isValidSocialLinks } from "../utils/validators.js"
import jwt from "jsonwebtoken"

const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
};

const accessTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
};

const refreshTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateTokens =  async(userId) => {
    try {
        const user = await User.findById( userId )
        if(!user){
            throw new ApiError(404, "User not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens")
    }
}

// controllers

const register = AsyncHandler( async (req, res) => {
    const { fullName, userName, email, password } = req.body 
    const normalizedEmail = email?.trim().toLowerCase()
    if(!isValidFullName(fullName)){
        throw new ApiError(400, "Full name is required, Please enter valid full name")
    }
    if(!isValidUserName(userName)){
        throw new ApiError(400, "User name is required, Please enter valid user name")
    }
    if(!isValidEmail(normalizedEmail)){
        throw new ApiError(400, "Email is required, Please enter valid email")
    }
    if(!isValidPassword(password)){
        throw new ApiError(400, "Password is required, Please enter valid password")
    }
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { userName }] })
    if(existingUser){
        if(existingUser.email === normalizedEmail){
            throw new ApiError(409, "Email already in use, Please login or use different email")
        }
        if(existingUser.userName === userName){
            throw new ApiError(409, "User name already in use, Please choose a different user name")
        }
    }
    const userCreated = await User.create({ fullName, userName, email: normalizedEmail, password })
    const userData = await User.findById(userCreated._id).select("-password -refreshToken") // exclude sensitive fields

    return res
    .status(201)
    .json(new ApiResponse(201, userData, "User registered successfully"))
})


const login = AsyncHandler(async (req, res) => {
    const { email, password } = req.body
    const normalizedEmail = email?.trim().toLowerCase()
    const requestId = req.headers["x-debug-request-id"] || "missing-request-id"

    console.log("[auth][login] request received", {
        requestId,
    })
    if (!isValidEmail(normalizedEmail)) {
        console.log("[auth][login] response", {
            requestId,
            status: 400,
            message: "Please use a valid email",
        })
        throw new ApiError(400, "Please use a valid email")
    }
    if (!isValidPassword(password)) {
        console.log("[auth][login] response", {
            requestId,
            status: 400,
            message: "Please enter a valid password",
        })
        throw new ApiError(400, "Please enter a valid password")
    }
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
        console.log("[auth][login] response", {
            requestId,
            status: 401,
            message: "Invalid credentials",
        })
        throw new ApiError(401, "Invalid credentials")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        console.log("[auth][login] response", {
            requestId,
            status: 401,
            message: "Invalid credentials",
        })
        throw new ApiError(401, "Invalid credentials")
    }
    const { accessToken, refreshToken } = await generateTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    console.log("[auth][login] response", {
        requestId,
        status: 200,
        message: "Login successful",
    })

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser },
                "Login successful"
            )
        )
})

const logout = AsyncHandler( async(req, res) => {
    const userId = req.user._id
    if(!userId){
        throw new ApiError(404, "User not found")
    }
    await User.findByIdAndUpdate( userId, {
        $unset: {
            refreshToken: 1
        }
    }, {
        returnDocument: "after"
    })

    return res
    .status(200)
    .clearCookie("accessToken", baseCookieOptions)   
    .clearCookie("refreshToken", baseCookieOptions)   
    .json(new ApiResponse(200, {}, "User logged out successfully"))
}) 

const refreshTokens = AsyncHandler( async(req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "")
    if(!refreshToken){
        throw new ApiError(401, "Refresh token not found, Please login again")
    }
    let decodedPayload
    try {
        decodedPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token, Please login again")
    }
    const user = await User.findById(decodedPayload._id)
    if(!user || user.refreshToken !== refreshToken){
        throw new ApiError(401, "Invalid refresh token, Please login again")
    }
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", newAccessToken, accessTokenCookieOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(200, {}, "Tokens refreshed successfully"))
})

const changePassword = AsyncHandler( async(req, res) => {
    const userId = req.user?._id
    const { currentPassword, newPassword } = req.body
    if(!isValidPassword(currentPassword) || !isValidPassword(newPassword)){
        throw new ApiError(400, "Invalid password")
    }
    if(currentPassword === newPassword){
        throw new ApiError(400, "New password cannot be same as current password")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404, "User not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "Current Password is not correct")
    }
    user.password = newPassword
    await user.save()
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(userId)

    return res
    .status(200)
    .cookie("accessToken", newAccessToken, accessTokenCookieOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(200, {}, "Changed password successfully"))
})

const updateProfile = AsyncHandler (async (req, res) => {
    const { fullName, userName, bio, skills, socialLinks } = req.body
    if (
        fullName === undefined &&
        userName === undefined &&
        bio === undefined &&
        skills === undefined &&
        socialLinks === undefined
    ) {
        throw new ApiError(400, "Nothing to update");
    }
    if (userName !== undefined) {
        const existingUser = await User.findOne({ userName });

        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
            throw new ApiError(400, "Username already taken");
        }
    }
    if (fullName !== undefined && !isValidFullName(fullName)) {
        throw new ApiError(400, "Invalid full name");
    }

    if (userName !== undefined && !isValidUserName(userName)) {
        throw new ApiError(400, "Invalid username");
    }

    if (bio !== undefined && !isValidBio(bio)) {
        throw new ApiError(400, "Invalid bio");
    }

    if (skills !== undefined && !isValidSkills(skills)) {
        throw new ApiError(400, "Invalid skills");
    }

    if (socialLinks !== undefined && !isValidSocialLinks(socialLinks)) {
        throw new ApiError(400, "Invalid social links");
    }
    const updateFields = {};
        if (fullName !== undefined) updateFields.fullName = fullName;
        if (userName !== undefined) updateFields.userName = userName;
        if (bio !== undefined) updateFields.bio = bio;
        if (skills !== undefined) updateFields.skills = skills;
        if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: updateFields  
    }, {
        returnDocument: "after",
        runValidators: true
    }).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"))
})

const getCurrentUser = AsyncHandler(async(req, res) => {
    const user = await User.findById(req.user?._id).select("-password -refreshToken").lean()
    if(!user){
        throw new ApiError(404, "User not exist")
    }

    return res.status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"))
})

const deleteUser = AsyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!isValidPassword(password)) {
        throw new ApiError(400, "Invalid password");
    }

    const user = await User.findById(req.user?._id).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }

    const userId = user._id;

    // find all projects created by this user
    const userProjects = await Project.find({ createdBy: userId }).select("_id");
    const projectIds = userProjects.map((project) => project._id);

    // delete:
    // 1) requests sent by this user
    // 2) requests received on this user's projects
    await Request.deleteMany({
        $or: [
            { requestedBy: userId },
            { project: { $in: projectIds } }
        ]
    });

    // delete all projects created by this user
    await Project.deleteMany({ createdBy: userId });

    // finally delete user
    await User.findByIdAndDelete(userId);

    return res
        .status(200)
        .clearCookie("accessToken", baseCookieOptions)
        .clearCookie("refreshToken", baseCookieOptions)
        .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export { register, login, logout, refreshTokens, changePassword, updateProfile, getCurrentUser, deleteUser }





// register     :done
// login        :done
// logout       :done
// change password      :done 
// refresh token        :done
// update userProfile   :done
// get user             :done
// delete user          :done
// profile picture update
