import express from "express";
import {
  getAllSubscriptions,
  updateSubscription,
  getSubscriptionById,
} from "../controllers/subscriptionsController.js";

const router = express.Router();

router.get("/", getAllSubscriptions);
router.put("/:id", updateSubscription);
router.get("/:id", getSubscriptionById);
export default router;
