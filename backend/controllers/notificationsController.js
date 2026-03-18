import pool from "../config/db.js";

export const createNotification = async (req, res) => {
  try {
    const { title, message, sent_to, month, year } = req.body;

    if (!title || !message || !sent_to) {
      return res.status(400).json({
        message: "title, message and sent_to are required",
      });
    }

    if (sent_to === "pending_payment") {
      if (!month || !year) {
        return res.status(400).json({
          message:
            "month and year are required for pending payment notifications",
        });
      }

      const pendingUsersResult = await pool.query(
        `
        SELECT DISTINCT u.id
        FROM users u
        JOIN monthly_subscriptions ms
          ON u.flat_id = ms.flat_id
        WHERE ms.month = $1
          AND ms.year = $2
          AND LOWER(TRIM(ms.status)) = 'pending'
          AND LOWER(TRIM(u.role)) = 'resident'
        `,
        [month, year],
      );

      if (pendingUsersResult.rows.length === 0) {
        return res.status(404).json({
          message: "No users found with pending payments for selected month",
        });
      }

      for (const user of pendingUsersResult.rows) {
        await pool.query(
          `
          INSERT INTO notifications (title, message, sent_to, user_id, created_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          `,
          [title, message, sent_to, user.id],
        );
      }

      return res.status(201).json({
        message: "Pending payment notifications sent successfully",
        count: pendingUsersResult.rows.length,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO notifications (title, message, sent_to, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [title, message, sent_to],
    );

    return res.status(201).json({
      message: "Notification sent successfully",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
    return res.status(500).json({
      message: "Failed to create notification",
    });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, title, message, sent_to, created_at
      FROM notifications
      ORDER BY created_at DESC
      `,
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};
