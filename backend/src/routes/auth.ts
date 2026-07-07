import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, refreshTokens } from "../db/schema";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "FACULTY", "HOD", "ADMIN", "SUPER_ADMIN"]),
  departmentId: z.string().uuid().optional(),
});

async function issueTokens(user: {
  id: string;
  role: string;
  email: string;
}) {
  const payload = { userId: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

// Register — Admin/Super Admin only (per spec: "Register (Admin only)")
router.post(
  "/register",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });
      if (existing) throw new AppError("Email already registered", 409);

      const hashed = await bcrypt.hash(data.password, 10);
      const [user] = await db
        .insert(users)
        .values({ ...data, password: hashed })
        .returning();

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });
    if (!user) throw new AppError("Invalid credentials", 401);
    if (!user.isActive) throw new AppError("Account disabled", 403);

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const tokens = await issueTokens(user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError("Refresh token required", 400);

    const payload = verifyRefreshToken(refreshToken);

    const stored = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, refreshToken),
    });
    if (!stored) throw new AppError("Invalid refresh token", 401);
    if (stored.expiresAt < new Date()) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
      throw new AppError("Refresh token expired", 401);
    }

    const accessToken = signAccessToken({
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        avatarUrl: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
