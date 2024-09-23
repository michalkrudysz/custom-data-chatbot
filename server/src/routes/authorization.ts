import express from "express";
import { login } from "../controllers/authController";
import { body } from "express-validator";

const router = express.Router();

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Nazwa użytkownika jest wymagana."),
    body("password").notEmpty().withMessage("Hasło jest wymagane."),
  ],
  login
);

export default router;
