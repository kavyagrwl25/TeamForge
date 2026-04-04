import { AsyncHandler } from "../utils/AsyncHandler.js"             // for named export, import with braces
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"                
import { isValidFullName, isValidEmail, isValidPassword, isValidUserName } from "../utils/validators.js"

const register = AsyncHandler( async (req, res) => {
    // 1. POST /users
    // 2. get details from user
    // 3. validate them and also check if user already exists with userName and email
    // 4. create a document in db and store the user 
    // 5. store this in an obj userCreated without selecting userPassword/RefreshToken
    // 6. return this object in data field in response
    const { fullName, userName, email, password } = req.body 
    if(!fullName || !isValidFullName(fullName)){
        throw new ApiError(400, "Full name is required, Please enter valid full name")
    }
    if(!userName || !isValidUserName(userName)){
        throw new ApiError(400, "User name is required, Please enter valid user name")
    }
    if(!email || !isValidEmail(email)){
        throw new ApiError(400, "Email is required, Please enter valid email")
    }
    if(!password || !isValidPassword(password)){
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









export { register }