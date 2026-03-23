import express from "express";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { getMe } from "../controllers/authController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Working route get1" });
});

router.get("/me", getMe);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.json({
      message: "Login successful",
      role: user.role,
      userId: user.id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/fcm-token", async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ message: "Email and token are required" });
    }

    await pool.query(
      "UPDATE users SET fcm_token = $1 WHERE LOWER(TRIM(email)) = LOWER(TRIM($2))",
      [token, email],
    );

    return res.status(200).json({ message: "Token saved" });
  } catch (error) {
    console.error("FCM TOKEN ERROR:", error);
    return res.status(500).json({ message: "Failed to save token" });
  }
});

export default router;