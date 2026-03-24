import pool from "../config/db.js";

export const getAllSubscriptions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, flat_type, monthly_amount, effective_from, created_at
      FROM subscriptions
      ORDER BY flat_type
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET SUBSCRIPTIONS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { monthly_amount, effective_from } = req.body;

    const result = await pool.query(
      `
      UPDATE subscriptions
      SET monthly_amount = $1,
          effective_from = $2
      WHERE id = $3
      RETURNING *
      `,
      [monthly_amount, effective_from, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE SUBSCRIPTION ERROR:", error);
    return res.status(500).json({ message: "Failed to update subscription" });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT id, flat_type, monthly_amount, effective_from, created_at
      FROM subscriptions
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET SUBSCRIPTION BY ID ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch subscription" });
  }
};
