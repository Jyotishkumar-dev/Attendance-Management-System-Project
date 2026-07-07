import jwt from "jsonwebtoken";

export type JwtPayload = {
  userId: string;
  role: string;
  email: string;
};

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRES as any) || "15m",
  });
}

export function signRefreshToken(payload: JwtPayload) {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: `${days}d` });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
