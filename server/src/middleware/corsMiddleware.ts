import { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  cors(corsOptions)(req, res, next);
};
