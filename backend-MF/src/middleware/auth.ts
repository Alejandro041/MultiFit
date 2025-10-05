import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { createSupabaseClient } from "../config/supabase";

type SupabaseJwtPayload = jwt.JwtPayload & {
  sub: string;
  email?: string;
  role?: string;
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, env.supabaseJwtSecret) as SupabaseJwtPayload;

    if (!payload.sub) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.authUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    req.accessToken = token;
    req.supabase = createSupabaseClient(token);

    return next();
  } catch (error) {
    logger.warn({ error }, "Token verification failed");
    return res.status(401).json({ message: "Unauthorized" });
  }
};
