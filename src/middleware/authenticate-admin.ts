
import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const authenticateAdmin: RequestHandler = (
  req,
  res,
  next,
) => {
  const authorization = req.header("authorization");

  if (!authorization) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match?.[1]) {
    res.status(401).json({
      success: false,
      message: "Invalid authorization header.",
    });
    return;
  }

  const jwtSecret = process.env["JWT_SECRET"];

  if (!jwtSecret) {
    next(new Error("JWT_SECRET is not configured."));
    return;
  }

  try {
    const decoded = jwt.verify(match[1], jwtSecret, {
      algorithms: ["HS256"],
      issuer: "lzzy-tech-api",
      audience: "lzzy-tech-admin",
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof (decoded as JwtPayload).adminId !== "string" ||
      (decoded as JwtPayload).role !== "ADMIN"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
      return;
    }

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};
