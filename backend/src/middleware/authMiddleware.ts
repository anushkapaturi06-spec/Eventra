import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// VERIFY JWT TOKEN
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.role !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();

  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// CHECK USER ROLE
export const authorize = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource"
      });
      return;
    }

    next();
  };
};
