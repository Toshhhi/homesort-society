import pool from "../config/db.js";

export const getAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT id, username, email, phone, role, created_at
      FROM users
      WHERE id = $1 AND LOWER(TRIM(role)) = 'admin'
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET ADMIN PROFILE ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        message: "username and email are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET username = $1,
          email = $2,
          phone = $3
      WHERE id = $4
        AND LOWER(TRIM(role)) = 'admin'
      RETURNING id, username, email, phone, role, created_at
      `,
      [username, email, phone || null, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE ADMIN PROFILE ERROR:", error);
    return res.status(500).json({ message: "Failed to update admin profile" });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    const userResult = await pool.query(
      `
      SELECT id, password
      FROM users
      WHERE id = $1
        AND LOWER(TRIM(role)) = 'admin'
      `,
      [id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const admin = userResult.rows[0];

    if (admin.password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [newPassword, id],
    );

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("UPDATE ADMIN PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Failed to update password" });
  }
};
