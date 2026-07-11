import { Router } from "express";
import { db } from "../db";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/errors";
import { faculty, users, departments, students, subjects } from "../db/schema";
import { eq } from "drizzle-orm"; 
const router = Router();
export default router;