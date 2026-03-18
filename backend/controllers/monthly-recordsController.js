import pool from "../config/db.js";

export const getMonthlyRecords = async (req, res) => {
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
        ms.id,
        ms.flat_id,
        ms.month,
        ms.year,
        ms.amount,
        ms.status,
        ms.created_at,
        ms.paid_at,
        f.flat_no,
        f.flat_type,
        f.owner
      FROM monthly_subscriptions ms
      JOIN flats f ON ms.flat_id = f.id
      WHERE ms.month = $1 AND ms.year = $2
      ORDER BY f.flat_no
      `,
      [month, year],
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET MONTHLY RECORDS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch monthly records",
    });
  }
};

export const markMonthlyRecordPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE monthly_subscriptions
      SET status = 'paid',
          paid_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Monthly record not found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("MARK MONTHLY RECORD PAID ERROR:", error);
    return res.status(500).json({
      message: "Failed to mark record as paid",
    });
  }
};