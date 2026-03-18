import express from "express";
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

    //if no user found
    if (result.rows.length == 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Password!" });
    }

    //login success
    return res.json({
      message: "login successful",
      role: user.role,
      userId: user.id,
    });
  } catch (error) {
    console.log("Login error :", error);

    //some other unexpected happened
    return res.status(300).json({ message: "server error" });
  }
});

export default router;
