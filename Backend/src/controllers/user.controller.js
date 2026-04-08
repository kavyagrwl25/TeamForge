import { AsyncHandler } from "../utils/AsyncHandler.js"             // for named export, import with braces
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"                
import { isValidFullName, isValidEmail, isValidPassword, isValidUserName, isValidBio } from "../utils/validators.js"
import jwt from "jsonwebtoken"

const accessTokenOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000 // 15 min
};

const refreshTokenOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
    if(!isValidFullName(fullName)){
        throw new ApiError(400, "Full name is required, Please enter valid full name")
    }
    if(!isValidUserName(userName)){
        throw new ApiError(400, "User name is required, Please enter valid user name")
    }
    if(!isValidEmail(email)){
        throw new ApiError(400, "Email is required, Please enter valid email")
    }
    if(!isValidPassword(password)){
        throw new ApiError(400, "Password is required, Please enter valid password")
    }
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] })
    if(existingUser){
        if(existingUser.email === email){
            throw new ApiError(409, "Email already in use, Please login or use different email")
        }
        if(existingUser.userName === userName){
            throw new ApiError(409, "User name already in use, Please choose a different user name")
        }
    }
    const userCreated = await User.create({ fullName, userName, email, password })
    const userData = await User.findById(userCreated._id).select("-password -refreshToken") // exclude sensitive fields

    return res
    .status(201)
    .json(new ApiResponse(201, userData, "User registered successfully"))
})


const login = AsyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!isValidEmail(email)) {
        throw new ApiError(400, "Please use a valid email")
    }
    if (!isValidPassword(password)) {
        throw new ApiError(400, "Please enter a valid password")
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(401, "Invalid credentials")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials")
    }
    const { accessToken, refreshToken } = await generateTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
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
    .clearCookie("accessToken", accessTokenOptions)   
    .clearCookie("refreshToken", refreshTokenOptions)   
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
    .cookie("accessToken", newAccessToken, accessTokenOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
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
    .cookie("accessToken", newAccessToken, accessTokenOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
    .json(new ApiResponse(200, {}, "Changed password successfully"))
})

const updateProfile = AsyncHandler (async (req, res) => {
    // 1. PUT /api/users/profile
    // 2. get all details from user, it has to update
    // 3. validate all the fields
    // 4. save all the fields in db
    const { fullName, userName, email, bio, skills, githubLink, linkedinLink, role } = req.body
    if(!fullName && !userName && !bio && !email && !skills && !githubLink && !linkedinLink && !role){
        throw new ApiError(400, "Nothing to update")
    }
    if(!isValidFullName(fullName)){
        throw new ApiError(400, "Invalid full name");
    }
    if(!isValidUserName(userName)){
        throw new ApiError(400, "Invalid full name");
    }
    if(!isValidBio(bio)){
        throw new ApiError(400, "Invalid full name");
    }
    if(!isValidEmail(email)){
        throw new ApiError(400, "Invalid full name");
    }
    if(!isValidSkills(skills)){
        throw new ApiError(400, "Invalid full name");
    }
    if(!isValidFullName(githubLink)){
        throw new ApiError(400, "Invalid full name");
    }
    if(!isValidFullName(linkedinLink)){
        throw new ApiError(400, "Invalid full name");
    }
})

export { register, login, logout, refreshTokens, changePassword }





// register     :done
// login        :done
// logout       :done
// change password      :done 
// refresh token        :done
// update userProfile   :done
// get user
// profile picture update
// delete user