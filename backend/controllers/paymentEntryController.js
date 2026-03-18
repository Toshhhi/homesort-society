import pool from "../config/db.js";

export const getPendingPaymentFlats = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "month and year are required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        ms.id AS monthly_sub_id,
        ms.flat_id,
        ms.amount,
        ms.status,
        f.flat_no,
        f.flat_type,
        f.owner
      FROM monthly_subscriptions ms
      JOIN flats f ON ms.flat_id = f.id
      WHERE ms.month = $1
        AND ms.year = $2
        AND LOWER(TRIM(ms.status)) = 'pending'
      ORDER BY f.flat_no
      `,
      [month, year],
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET PENDING PAYMENT FLATS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch pending flats",
    });
  }
};

export const createOfflinePayment = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      flat_id,
      month,
      year,
      amount,
      payment_mode,
      payment_date,
      transaction_id,
    } = req.body;

    if (
      !flat_id ||
      !month ||
      !year ||
      !amount ||
      !payment_mode ||
      !payment_date
    ) {
      return res.status(400).json({
        message:
          "flat_id, month, year, amount, payment_mode and payment_date are required",
      });
    }

    await client.query("BEGIN");

    // 1. Find monthly subscription record
    const monthlySubResult = await client.query(
      `
      SELECT id, status
      FROM monthly_subscriptions
      WHERE flat_id = $1 AND month = $2 AND year = $3
      `,
      [flat_id, month, year],
    );

    if (monthlySubResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message:
          "Monthly subscription record not found for selected flat and month",
      });
    }

    const monthlySub = monthlySubResult.rows[0];

    if (monthlySub.status?.toLowerCase().trim() === "paid") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "This subscription is already paid",
      });
    }

    // 2. Insert payment
    const paymentResult = await client.query(
      `
      INSERT INTO payments
      (monthly_sub_id, amount, payment_mode, payment_date, transaction_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        monthlySub.id,
        amount,
        payment_mode,
        payment_date,
        transaction_id || null,
      ],
    );

    // 3. Update monthly_subscriptions
    await client.query(
      `
      UPDATE monthly_subscriptions
      SET status = 'paid',
          paid_at = $1
      WHERE id = $2
      `,
      [payment_date, monthlySub.id],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Payment recorded successfully",
      payment: paymentResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("CREATE OFFLINE PAYMENT ERROR:", error);
    return res.status(500).json({
      message: "Failed to record payment",
    });
  } finally {
    client.release();
  }
};
