import express from "express";
import {
  getAllSubscriptions,
  updateSubscription,
} from "../controllers/subscriptionsController.js";

const router = express.Router();

router.get("/", getAllSubscriptions);
router.put("/:id", updateSubscription);

export default router;