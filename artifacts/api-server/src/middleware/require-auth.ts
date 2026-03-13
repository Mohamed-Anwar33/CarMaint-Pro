import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
}

/**
 * Validates the Supabase JWT from the Authorization header.
 * Sets req.userId and req.userEmail on success.
 * Returns 401 on invalid or missing token.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing or malformed" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    (req as AuthenticatedRequest).userId = data.user.id;
    (req as AuthenticatedRequest).userEmail = data.user.email ?? "";
    next();
  } catch {
    res.status(401).json({ error: "Token validation failed" });
  }
}

/**
 * Require admin role — must be called AFTER requireAuth.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = (req as AuthenticatedRequest).userId;

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !user || user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}
