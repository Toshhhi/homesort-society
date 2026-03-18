import express from "express";
import passport from "passport";
import pool from "../config/db.js";

const router = express.Router();

router.get(
  "/googleAuth",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/googleAuth/callback", (req, res, next) => {
  passport.authenticate("google", async (err, googleUser) => {
    try {
      if (err || !googleUser) {
        return res.redirect(
          "http://localhost:3000/login?error=Google login failed",
        );
      }

      const email = googleUser.email;

      // check DB
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND role = $2",
        [email, "admin"],
      );

      const admin = result.rows[0];

      if (!admin) {
        return res.redirect("http://localhost:3000/login?error=User not found");
      }

      // set login cookie here
      res.cookie("role", "admin", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      res.cookie("email", admin.email, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      // then redirect
      return res.redirect("http://localhost:3000/admin/dashboard");
    } catch (err) {
      return res.redirect("http://localhost:3000/login?error=Server error");
    }
  })(req, res, next);
});

router.get("/me", (req, res) => {
  res.json(req.user || null);
});

export default router;
