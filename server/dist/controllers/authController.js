import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!JWT_SECRET || !JWT_EXPIRES_IN || !adminUsername || !adminPassword) {
        return res.status(500).json({ message: "Błędna konfiguracja serwera." });
    }
    if (username !== adminUsername) {
        return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }
    if (password !== adminPassword) {
        return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }
    const token = jwt.sign({ username }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
    res.json({ token });
};
