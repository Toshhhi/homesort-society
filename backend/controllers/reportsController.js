import pool from "../config/db.js";

export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    const summaryResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total_records,
        COALESCE(SUM(amount), 0) AS total_due,
        COUNT(*) FILTER (WHERE LOWER(TRIM(status)) = 'paid') AS paid_records,
        COUNT(*) FILTER (WHERE LOWER(TRIM(status)) = 'pending') AS pending_records,
        COALESCE(SUM(amount) FILTER (WHERE LOWER(TRIM(status)) = 'paid'), 0) AS paid_amount,
        COALESCE(SUM(amount) FILTER (WHERE LOWER(TRIM(status)) = 'pending'), 0) AS pending_amount
      FROM monthly_subscriptions
      WHERE month = $1 AND year = $2
      `,
      [month, year],
    );

    const paymentModeResult = await pool.query(
      `
      SELECT
  p.payment_mode,
  COALESCE(SUM(p.amount), 0) AS total
FROM payments p
JOIN monthly_subscriptions ms
  ON p.monthly_sub_id = ms.id
WHERE ms.month = $1 AND ms.year = $2
GROUP BY p.payment_mode
ORDER BY p.payment_mode;
      `,
      [month, year],
    );

    return res.status(200).json({
      summary: summaryResult.rows[0],
      paymentModeBreakdown: paymentModeResult.rows,
    });
  } catch (error) {
    console.error("GET MONTHLY REPORT ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch monthly report" });
  }
};

export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ message: "year is required" });
    }

    const summaryResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total_records,
        COALESCE(SUM(amount), 0) AS total_due,
        COUNT(*) FILTER (WHERE LOWER(TRIM(status)) = 'paid') AS paid_records,
        COUNT(*) FILTER (WHERE LOWER(TRIM(status)) = 'pending') AS pending_records,
        COALESCE(SUM(amount) FILTER (WHERE LOWER(TRIM(status)) = 'paid'), 0) AS paid_amount,
        COALESCE(SUM(amount) FILTER (WHERE LOWER(TRIM(status)) = 'pending'), 0) AS pending_amount
      FROM monthly_subscriptions
      WHERE year = $1
      `,
      [year],
    );

    const paymentModeResult = await pool.query(
      `
      SELECT
  p.payment_mode,
  COALESCE(SUM(p.amount), 0) AS total
FROM payments p
JOIN monthly_subscriptions ms
  ON p.monthly_sub_id = ms.id
WHERE ms.month = $1 AND ms.year = $2
GROUP BY p.payment_mode
ORDER BY p.payment_mode;
      `,
      [year],
    );

    const monthlyBreakdownResult = await pool.query(
      `
      SELECT
        month,
        COALESCE(SUM(amount) FILTER (WHERE LOWER(TRIM(status)) = 'paid'), 0) AS paid_amount,
        COALESCE(SUM(amount) FILTER (WHERE LOWER(TRIM(status)) = 'pending'), 0) AS pending_amount
      FROM monthly_subscriptions
      WHERE year = $1
      GROUP BY month
      ORDER BY month
      `,
      [year],
    );

    return res.status(200).json({
      summary: summaryResult.rows[0],
      paymentModeBreakdown: paymentModeResult.rows,
      monthlyBreakdown: monthlyBreakdownResult.rows,
    });
  } catch (error) {
    console.error("GET YEARLY REPORT ERROR:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch yearly report", error: error.message });
  }
};

export const downloadMonthlyReportCSV = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    const result = await pool.query(
      `
      SELECT
        f.flat_no,
        f.flat_type,
        f.owner,
        ms.amount,
        ms.status,
        ms.paid_at
      FROM monthly_subscriptions ms
      JOIN flats f ON ms.flat_id = f.id
      WHERE ms.month = $1 AND ms.year = $2
      ORDER BY f.flat_no
      `,
      [month, year],
    );

    const header = "Flat No,Flat Type,Owner,Amount,Status,Paid At\n";
    const rows = result.rows
      .map(
        (row) =>
          `${row.flat_no},${row.flat_type},${row.owner},${row.amount},${row.status},${row.paid_at ?? ""}`,
      )
      .join("\n");

    const csv = header + rows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="monthly-report-${month}-${year}.csv"`,
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error("DOWNLOAD MONTHLY CSV ERROR:", error);
    return res.status(500).json({ message: "Failed to download monthly CSV" });
  }
};

export const downloadYearlyReportCSV = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ message: "year is required" });
    }

    const result = await pool.query(
      `
      SELECT
        ms.month,
        f.flat_no,
        f.flat_type,
        f.owner,
        ms.amount,
        ms.status,
        ms.paid_at
      FROM monthly_subscriptions ms
      JOIN flats f ON ms.flat_id = f.id
      WHERE ms.year = $1
      ORDER BY ms.month, f.flat_no
      `,
      [year],
    );

    const header = "Month,Flat No,Flat Type,Owner,Amount,Status,Paid At\n";
    const rows = result.rows
      .map(
        (row) =>
          `${row.month},${row.flat_no},${row.flat_type},${row.owner},${row.amount},${row.status},${row.paid_at ?? ""}`,
      )
      .join("\n");

    const csv = header + rows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="yearly-report-${year}.csv"`,
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error("DOWNLOAD YEARLY CSV ERROR:", error);
    return res.status(500).json({ message: "Failed to download yearly CSV" });
  }
};
