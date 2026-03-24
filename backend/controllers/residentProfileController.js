import pool from "../config/db.js";

export const getResidentProfile = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Resident email is required" });
    }

    const result = await pool.query(
      `
      SELECT id, username, email, phone, role, flat_id, created_at
      FROM users
      WHERE email = $1 AND role = 'resident'
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resident not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET RESIDENT PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch resident profile",
    });
  }
};

export const updateResidentProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const { phone, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Resident email is required" });
    }

    const existingUserResult = await pool.query(
      `
      SELECT id, email
      FROM users
      WHERE email = $1 AND role = 'resident'
      `,
      [email],
    );

    if (existingUserResult.rows.length === 0) {
      return res.status(404).json({ message: "Resident not found" });
    }

    let result;

    if (phone && password) {
      result = await pool.query(
        `
        UPDATE users
        SET phone = $1,
            password = $2
        WHERE email = $3 AND role = 'resident'
        RETURNING id, username, email, phone, role, flat_id
        `,
        [phone, password, email],
      );
    } else if (phone) {
      result = await pool.query(
        `
        UPDATE users
        SET phone = $1
        WHERE email = $2 AND role = 'resident'
        RETURNING id, username, email, phone, role, flat_id
        `,
        [phone, email],
      );
    } else if (password) {
      result = await pool.query(
        `
        UPDATE users
        SET password = $1
        WHERE email = $2 AND role = 'resident'
        RETURNING id, username, email, phone, role, flat_id
        `,
        [password, email],
      );
    } else {
      return res.status(400).json({
        message: "At least one field (phone or password) is required",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE RESIDENT PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Failed to update resident profile",
    });
  }
};
