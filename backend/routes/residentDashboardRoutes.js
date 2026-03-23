import express from "express";
import { getResidentDashboardStats } from "../controllers/residentDashboardController.js";

const router = express.Router();

router.get("/:email", getResidentDashboardStats);

export default router;