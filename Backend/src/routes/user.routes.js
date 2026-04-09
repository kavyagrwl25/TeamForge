import { Router } from "express";
import { register, login, logout, refreshTokens, changePassword, updateProfile, getCurrentUser, deleteUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/register", register) //Authentication endpoints represent actions like login or logout rather than CRUD operations on resources. So verb-based routes improve clarity and align better with their purpose.
router.post("/login", login)

router.post("/logout", verifyToken, logout)
router.post("/refresh-tokens", refreshTokens) // Refresh tokens are used to obtain new access tokens without requiring the user to log in again. This endpoint allows clients to request new access tokens using a valid refresh token, enhancing security and user experience.
router.patch("/change-password", verifyToken, changePassword)
router.patch("/me", verifyToken, updateProfile)
router.get("/me", verifyToken, getCurrentUser)
router.delete("/me", verifyToken, deleteUser)
export default router