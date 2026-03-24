import pool from "../config/db.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

async function sendWelcomeEmail(email, owner, flat_no, plainPassword) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Homesort" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Homesort – Your Login Details",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Welcome, ${owner}!</h2>
        <p>Your resident account has been created for flat <strong>${flat_no}</strong>.</p>
        <p>Here are your login details:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Email</td>
            <td style="padding: 8px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Password</td>
            <td style="padding: 8px;">${plainPassword}</td>
          </tr>
        </table>
        <p style="margin-top: 16px;">Please log in and change your password from your profile page.</p>
        <p>Login here: <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
      </div>
    `,
  });
}

export async function getAllFlats(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        flat_no AS "flatNumber",
        flat_type AS "flatType",
        owner AS "ownerName",
        email
      FROM flats
      ORDER BY id ASC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching flats:", err);
    res.status(500).json({
      message: "Failed to fetch flats!",
    });
  }
}

export const createFlat = async (req, res) => {
  const client = await pool.connect();

  try {
    const { flat_no, flat_type, owner, email } = req.body;

    await client.query("BEGIN");

    // check if email already has a user account
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    // insert flat
    const flatResult = await client.query(
      `
      INSERT INTO flats (flat_no, flat_type, owner, email)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [flat_no, flat_type, owner, email],
    );

    const newFlat = flatResult.rows[0];

    // generate and hash password
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // create user linked to this flat
    await client.query(
      `
      INSERT INTO users (username, email, password, role, phone, flat_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [owner, email, hashedPassword, "resident", null, newFlat.id],
    );

    // look up subscription amount for this flat type
    const subResult = await client.query(
      `SELECT monthly_amount FROM subscriptions WHERE flat_type = $1 LIMIT 1`,
      [flat_type],
    );

    const amount = subResult.rows[0]?.monthly_amount || 0;

    // auto-create current month's pending subscription record
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await client.query(
      `
      INSERT INTO monthly_subscriptions (flat_id, month, year, amount, status)
      VALUES ($1, $2, $3, $4, 'pending')
      `,
      [newFlat.id, currentMonth, currentYear, amount],
    );

    await client.query("COMMIT");

    // send welcome email after commit
    try {
      await sendWelcomeEmail(email, owner, flat_no, plainPassword);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    res.status(201).json({
      ...newFlat,
      message: "Flat created and resident account set up successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating flat:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        message: "A flat with this flat number already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create flat!",
    });
  } finally {
    client.release();
  }
};

export const updateFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const { flat_no, flat_type, owner, email } = req.body;

    const result = await pool.query(
      `
      UPDATE flats
      SET flat_no = $1,
          flat_type = $2,
          owner = $3,
          email = $4
      WHERE id = $5
      RETURNING *
      `,
      [flat_no, flat_type, owner, email, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Flat not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update flat" });
  }
};

export const deleteFlat = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM flats WHERE id = $1 RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Flat not found!" });
    }

    return res.status(200).json({
      message: "Flat and resident account deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    console.log(error.message);
    return res.status(500).json({ message: "Failed to delete flat!" });
  }
};

export const getFlatById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT id, flat_no, flat_type, owner, email
      FROM flats
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Flat not found" });
    }

    const flat = result.rows[0];

    return res.status(200).json({
      id: flat.id,
      flatNumber: flat.flat_no,
      flatType: flat.flat_type,
      ownerName: flat.owner,
      email: flat.email,
    });
  } catch (error) {
    console.error("GET FLAT BY ID ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch flat details" });
  }
};
