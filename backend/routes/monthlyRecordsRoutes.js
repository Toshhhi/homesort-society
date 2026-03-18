import express from "express";
import {
  getMonthlyRecords,
  markMonthlyRecordPaid,
} from "../controllers/monthly-recordsController.js";

const router = express.Router();

router.get("/", getMonthlyRecords);
router.put("/:id/pay", markMonthlyRecordPaid);

export default router;