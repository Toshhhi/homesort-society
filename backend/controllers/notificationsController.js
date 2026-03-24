import pool from "../config/db.js";
import admin from "../config/firebase.js";

async function sendPushNotification(tokens, title, message) {
  if (tokens.length === 0) return;

  try {
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body: message },
    });
  } catch (err) {
    console.error("FCM PUSH ERROR:", err);
  }
}

async function getTokensByRole(role) {
  const result = await pool.query(
    `SELECT fcm_token FROM users 
     WHERE LOWER(TRIM(role)) = LOWER(TRIM($1)) 
     AND fcm_token IS NOT NULL`,
    [role],
  );
  return result.rows.map((r) => r.fcm_token);
}

async function getAllTokens() {
  const result = await pool.query(
    `SELECT fcm_token FROM users WHERE fcm_token IS NOT NULL`,
  );
  return result.rows.map((r) => r.fcm_token);
}

export const createNotification = async (req, res) => {
  try {
    const { title, message, recipient, month, year } = req.body;

    if (!title || !message || !recipient) {
      return res.status(400).json({
        message: "title, message and recipient are required",
      });
    }

    if (recipient === "pending_payment") {
      if (!month || !year) {
        return res.status(400).json({
          message:
            "month and year are required for pending payment notifications",
        });
      }

      const pendingUsersResult = await pool.query(
        `
        SELECT DISTINCT u.id, u.fcm_token
        FROM users u
        JOIN monthly_subscriptions ms ON u.flat_id = ms.flat_id
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
          INSERT INTO notifications (title, message, type, user_id, created_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          `,
          [title, message, recipient, user.id],
        );
      }

      // push to all pending users who have a token
      const tokens = pendingUsersResult.rows
        .map((u) => u.fcm_token)
        .filter(Boolean);

      await sendPushNotification(tokens, title, message);

      return res.status(201).json({
        message: "Pending payment notifications sent successfully",
        count: pendingUsersResult.rows.length,
      });
    }

    // insert into DB
    const result = await pool.query(
      `
      INSERT INTO notifications (title, message, type, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [title, message, recipient],
    );

    // push notification based on recipient
    let tokens = [];

    if (recipient === "all") {
      tokens = await getAllTokens();
    } else if (recipient === "resident" || recipient === "admin") {
      tokens = await getTokensByRole(recipient);
    }

    await sendPushNotification(tokens, title, message);

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
      SELECT id, title, message, type, created_at
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


export const getResidentNotifications = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // get user id from email
    const userResult = await pool.query(
      `SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // get notifications sent to this user specifically OR to all/resident
    const result = await pool.query(
      `
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = $1
        OR LOWER(TRIM(type)) = 'all'
        OR LOWER(TRIM(type)) = 'resident'
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [userId],
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET RESIDENT NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};