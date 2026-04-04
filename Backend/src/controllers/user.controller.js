import { AsyncHandler } from "../utils/AsyncHandler.js"             // for named export, import with braces
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"                
import { isValidFullName, isValidEmail, isValidPassword, isValidUserName } from "../utils/validators.js"

const cookieOptions = {
    httpOnly: true,
    secure: false, // set to true in production with HTTPS
    sameSite: "strict"
}

const generateTokens = ( async(userId) => {
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
})

const register = AsyncHandler( async (req, res) => {
    // 1. POST /users
    // 2. get details from user
    // 3. validate them and also check if user already exists with userName and email
    // 4. create a document in db and store the user 
    // 5. store this in an obj userCreated without selecting userPassword/RefreshToken
    // 6. return this object in data field in response
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
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser },
                "Login successful"
            )
        )
})







export { register, login }





// register
// login
// logout
// change password
// refresh token
// update userProfile
// get user
// profile picture update
// delete user