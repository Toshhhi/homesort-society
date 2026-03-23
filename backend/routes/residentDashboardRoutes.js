import express from "express";
import { getResidentDashboardStats, payResidentDues } from "../controllers/residentDashboardController.js";

const router = express.Router();

router.get("/:email", getResidentDashboardStats);
router.post("/:email/pay", payResidentDues);

export default router;