import { AsyncHandler } from "../utils/AsyncHandler"
import User from "../models/user.model.js"
import { isValidFullName, isValidEmail, isValidPassword, isValidUserName } from "../utils/validators"

const register = AsyncHandler( (req, res) => {
    // 1. POST /users
    // 2. get details from user
    // 3. validate them and also check if user already exists with userName and email
    // 4. create a document in db and store the user 
    // 5. store this in an obj userCreated without selecting userPassword/RefreshToken
    // 6. return this object in data field in response

    const { fullName, userName, email, password } = req.body 
    
    // validate all essential entities
})