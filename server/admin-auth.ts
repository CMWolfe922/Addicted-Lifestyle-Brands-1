import { Request, Response, NextFunction } from "express";
import session from "express-session";
import crypto from "crypto";

declare module "express-session" {
  interface SessionData {
    isAdminAuthenticated?: boolean;
  }
}

const ADMIN_EMAIL = "addictedlifestylebrands@gmail.com";

export const isAdminSubdomain = (req: Request): boolean => {
  const host = req.get('host') || '';
  return host.startsWith('admin.');
};

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAdminAuthenticated) {
    return res.status(401).json({ error: "Unauthorized - Admin authentication required" });
  }
  next();
};

export const verifyAdminCredentials = (email: string, password: string): boolean => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const emailMatch = email.toLowerCase() === ADMIN_EMAIL;
  const passwordMatch = crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(adminPassword.padEnd(password.length).slice(0, password.length))
  );
  return emailMatch && password.length === adminPassword.length && passwordMatch;
};

export const getAdminEmail = (): string => {
  return ADMIN_EMAIL;
};
