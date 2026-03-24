import express from "express";
import {
  getAllFlats,
  getFlatById,
  createFlat,
  updateFlat,
  deleteFlat,
} from "../controllers/flatsController.js";

const router = express.Router();

//GET /flats
router.get("/", getAllFlats);
router.post("/", createFlat);
router.put("/:id", updateFlat);
router.delete("/:id", deleteFlat);
router.get("/:id", getFlatById);
router.post("/fcm-token", async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ message: "Email and token are required" });
    }

    await pool.query(
      "UPDATE users SET fcm_token = $1 WHERE LOWER(TRIM(email)) = LOWER(TRIM($2))",
      [token, email],
    );

    return res.status(200).json({ message: "Token saved" });
  } catch (error) {
    console.error("FCM TOKEN ERROR:", error);
    return res.status(500).json({ message: "Failed to save token" });
  }
});

export default router;
