import pool from "../config/db.js";

export const getMe = async (req, res) => {
  try {
    const email = req.cookies.email;

    if (!email) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const result = await pool.query(
      `
      SELECT id, username, email, role, phone
      FROM users
      WHERE email = $1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};
