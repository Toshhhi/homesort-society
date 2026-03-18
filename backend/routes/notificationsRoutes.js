import express from "express";
import {
  createNotification,
  getAllNotifications,
} from "../controllers/notificationsController.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/", getAllNotifications);

export default router;
