import { Request, Response, NextFunction } from "express";
import session from "express-session";

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
  return email.toLowerCase() === ADMIN_EMAIL && adminPassword === password;
};

export const getAdminEmail = (): string => {
  return ADMIN_EMAIL;
};
