import { Router } from "express";
import { register, login, logout } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/register", register) //Authentication endpoints represent actions like login or logout rather than CRUD operations on resources. So verb-based routes improve clarity and align better with their purpose.
router.post("/login", login)

router.post("/logout", verifyToken, logout)
export default router