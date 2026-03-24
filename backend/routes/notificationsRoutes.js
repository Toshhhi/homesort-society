import express from "express";
import {
  createNotification,
  getAllNotifications,
  getResidentNotifications
} from "../controllers/notificationsController.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/", getAllNotifications);
router.get("/resident/:email", getResidentNotifications);

export default router;
