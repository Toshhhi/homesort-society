import pool from "../config/db.js";

export const getResidentDashboardStats = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const residentResult = await pool.query(
            `
      SELECT flat_id, username
      FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
      LIMIT 1
      `,
            [email],
        );

        if (residentResult.rows.length === 0) {
            return res.status(404).json({ message: "Resident not found" });
        }

        const flatId = residentResult.rows[0].flat_id;
        if (!flatId) {
            return res.status(404).json({ message: "No flat assigned to this resident" });
        }

        // current month status for this flat
        const currentStatusResult = await pool.query(
            `
  SELECT COALESCE(LOWER(TRIM(status)), 'pending') AS status
  FROM monthly_subscriptions
  WHERE flat_id = $1
  ORDER BY year DESC, month DESC
  LIMIT 1
  `,
            [flatId],
        );

        const currentStatus =
            currentStatusResult.rows.length > 0
                ? currentStatusResult.rows[0].status
                : "pending";


        const pendingAmountResult = await pool.query(
            `
      SELECT COALESCE(SUM(amount), 0)::int AS pending_amount
      FROM monthly_subscriptions
      WHERE flat_id = $1
        AND LOWER(TRIM(status)) = 'pending'
      `,
            [flatId],
        );


        const lastPaymentResult = await pool.query(
            `
      SELECT amount, paid_at
      FROM monthly_subscriptions
      WHERE flat_id = $1
        AND LOWER(TRIM(status)) = 'paid'
        AND paid_at IS NOT NULL
      ORDER BY paid_at DESC
      LIMIT 1
      `,
            [flatId],
        );

        const pendingAmount = pendingAmountResult.rows[0].pending_amount;
        const lastPayment = lastPaymentResult.rows[0] || null;

        return res.status(200).json({
            name: residentResult.rows[0].username,
            currentStatus,
            pendingAmount,
            lastPaymentAmount: lastPayment ? lastPayment.amount : null,
            lastPaymentDate: lastPayment ? lastPayment.paid_at : null,
        });
    } catch (error) {
        console.error("GET RESIDENT DASHBOARD STATS ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch resident dashboard stats",
        });
    }
};

export const payResidentDues = async (req, res) => {
    const client = await pool.connect();
    try {
        const { email } = req.params;
        const { payment_mode, amount } = req.body;

        if (!email || !payment_mode || !amount) {
            return res.status(400).json({ message: "Email, payment_mode, and amount are required" });
        }

        await client.query("BEGIN");

        const residentResult = await client.query(
            `
      SELECT flat_id
      FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
      LIMIT 1
      `,
            [email],
        );

        if (residentResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Resident not found" });
        }

        const flatId = residentResult.rows[0].flat_id;
        if (!flatId) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "No flat assigned to this resident" });
        }

        const pendingSubResult = await client.query(
            `
      SELECT id
      FROM monthly_subscriptions
      WHERE flat_id = $1 AND LOWER(TRIM(status)) = 'pending'
      ORDER BY year ASC, month ASC
      LIMIT 1
      `,
            [flatId],
        );

        if (pendingSubResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "No pending subscriptions found" });
        }

        const monthlySubId = pendingSubResult.rows[0].id;

        const paymentDate = new Date().toISOString();
        const transactionId = `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const paymentResult = await client.query(
            `
      INSERT INTO payments
      (monthly_sub_id, amount, payment_mode, payment_date, transaction_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
            [monthlySubId, amount, payment_mode, paymentDate, transactionId],
        );

        await client.query(
            `
      UPDATE monthly_subscriptions
      SET status = 'paid',
          paid_at = $1
      WHERE id = $2
      `,
            [paymentDate, monthlySubId],
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "Payment processed successfully",
            payment: paymentResult.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("PAY RESIDENT DUES ERROR:", error);
        return res.status(500).json({
            message: "Failed to process payment",
        });
    } finally {
        client.release();
    }
};