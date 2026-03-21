import express from "express";
import { getResidentSubscriptions, getResidentSubscriptionDetail } from "../controllers/residentSubscriptionController.js";

const router = express.Router();

router.get("/:email", getResidentSubscriptions);
router.get("/:email/:month/:year", getResidentSubscriptionDetail); // for one month/year
export default router;
