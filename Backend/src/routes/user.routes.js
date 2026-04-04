import { Router } from "express";
import { register } from "../controllers/user.controller.js";
const router = Router();

router.post("/register", register) //Authentication endpoints represent actions like login or logout rather than CRUD operations on resources. So verb-based routes improve clarity and align better with their purpose.

export default router