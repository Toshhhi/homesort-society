import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // ADDED: total flats
    const totalFlatsResult = await pool.query(`
      SELECT COUNT(*)::int AS total_flats
      FROM flats
    `);

    // ADDED: occupied flats
    const occupiedFlatsResult = await pool.query(`
      SELECT COUNT(*)::int AS occupied_flats
      FROM flats
      WHERE occupied = true
    `);

    // ADDED: total money collected this month
    const collectedThisMonthResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0)::int AS collected_this_month
      FROM monthly_subscriptions
      WHERE month = $1
        AND year = $2
        AND LOWER(TRIM(status)) = 'paid'
      `,
      [currentMonth, currentYear],
    );

    // ADDED: pending payments count this month
    const pendingPaymentsResult = await pool.query(
      `
      SELECT COUNT(*)::int AS pending_payments
      FROM monthly_subscriptions
      WHERE month = $1
        AND year = $2
        AND LOWER(TRIM(status)) = 'pending'
      `,
      [currentMonth, currentYear],
    );

    // ADDED: paid count this month
    const paidCountResult = await pool.query(
      `
      SELECT COUNT(*)::int AS paid_count
      FROM monthly_subscriptions
      WHERE month = $1
        AND year = $2
        AND LOWER(TRIM(status)) = 'paid'
      `,
      [currentMonth, currentYear],
    );

    // ADDED: total monthly records this month
    const totalMonthlyRecordsResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total_monthly_records
      FROM monthly_subscriptions
      WHERE month = $1
        AND year = $2
      `,
      [currentMonth, currentYear],
    );

    // ADDED: payment mode breakdown for this month
    const paymentModeBreakdownResult = await pool.query(
      `
      SELECT
        COALESCE(payment_mode, 'unknown') AS payment_mode,
        COUNT(*)::int AS count
      FROM monthly_subscriptions
      WHERE month = $1
        AND year = $2
        AND LOWER(TRIM(status)) = 'paid'
      GROUP BY payment_mode
      ORDER BY count DESC
      `,
      [currentMonth, currentYear],
    );

    const totalFlats = totalFlatsResult.rows[0].total_flats;
    const occupiedFlats = occupiedFlatsResult.rows[0].occupied_flats;
    const collectedThisMonth =
      collectedThisMonthResult.rows[0].collected_this_month;
    const pendingPayments = pendingPaymentsResult.rows[0].pending_payments;
    const paidCount = paidCountResult.rows[0].paid_count;
    const totalMonthlyRecords =
      totalMonthlyRecordsResult.rows[0].total_monthly_records;

    const collectionRate =
      totalMonthlyRecords > 0
        ? Math.round((paidCount / totalMonthlyRecords) * 100)
        : 0;

    return res.status(200).json({
      totalFlats,
      occupiedFlats,
      collectedThisMonth,
      pendingPayments,
      currentMonth,
      currentYear,
      paidCount,
      totalMonthlyRecords,
      collectionRate,
      paymentModeBreakdown: paymentModeBreakdownResult.rows,
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
    });
  }
};
