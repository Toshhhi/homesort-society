import pool from "../config/db.js";

export const getResidentSubscriptions = async (req, res) => {
  try {
    //logged-in resident from auth cookie
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ message: "resident email is required!" });
    }

    //find resident and flat
    const userResult = await pool.query(
      `
      SELECT id, email, flat_id, role
      FROM users
      WHERE email = $1 AND role = 'resident'
      `,
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const resident = userResult.rows[0];

    //fetch full monthly subscription history for this resident's flat
    const result = await pool.query(
      `
      SELECT
        id,
        month,
        year,
        amount,
        status,
        payment_mode,
        receipt_url,
        paid_at,
        created_at
      FROM monthly_subscriptions
      WHERE flat_id = $1
      ORDER BY year DESC, month DESC
      `,
      [resident.flat_id],
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET RESIDENT SUBSCRIPTIONS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch resident subscriptions",
    });
  }
};


export const getResidentSubscriptionDetail = async (req, res) => {
  try {
    const { email, month, year } = req.params;

    if (!email || !month || !year) {
      return res.status(400).json({
        message: "Resident email, month, and year are required",
      });
    }

    const userResult = await pool.query(
      `
      SELECT id, email, flat_id, role
      FROM users
      WHERE email = $1 AND role = 'resident'
      `,
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const resident = userResult.rows[0];

    const result = await pool.query(
      `
      SELECT
        ms.id,
        ms.month,
        ms.year,
        ms.amount,
        ms.status,
        ms.payment_mode,
        ms.receipt_url,
        ms.paid_at,
        ms.created_at,
        f.flat_no,
        f.flat_type,
        f.owner
      FROM monthly_subscriptions ms
      JOIN flats f ON ms.flat_id = f.id
      WHERE ms.flat_id = $1
        AND ms.month = $2
        AND ms.year = $3
      LIMIT 1
      `,
      [resident.flat_id, month, year],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Subscription detail not found",
      });
    }

    const record = result.rows[0];

    // ADDED: simple breakdown 
    const breakdown = [
      {
        label: "Monthly Subscription",
        amount: record.amount,
      },
    ];

    return res.status(200).json({
      ...record,
      breakdown,
    });
  } catch (error) {
    console.error("GET RESIDENT SUBSCRIPTION DETAIL ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch subscription detail",
    });
  }
};