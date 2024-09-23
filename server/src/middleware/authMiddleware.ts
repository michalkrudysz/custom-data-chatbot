import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Zmienna środowiskowa JWT_SECRET jest wymagana.");
}

interface JwtPayload {
  username: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.warn("Brak nagłówka Authorization.");
    return res.status(401).json({ message: "Brak tokena autoryzacyjnego." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.warn("Brak tokena w nagłówku Authorization.");
    return res.status(401).json({ message: "Brak tokena autoryzacyjnego." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.warn("Nieprawidłowy token JWT:", err.message);
      return res.status(403).json({ message: "Nieprawidłowy token." });
    }

    // @ts-ignore
    req.user = (decoded as JwtPayload).username;
    console.log(
      `Użytkownik ${
        (decoded as JwtPayload).username
      } został pomyślnie uwierzytelniony.`
    );
    next();
  });
};
