import express from "express";
import { check } from "express-validator";
import { signup, login, protectedRoute } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);

router.post(
  "/login",
  [
    check("email", "Invalid email").isEmail().isLength({ min: 10, max: 30 }),
    check("password", "Password must be 8-10 characters").isLength({
      min: 8,
      max: 10,
    }),
  ],
  login
);

// Example protected route
router.get("/protected", authenticateToken, protectedRoute);

export default router;
