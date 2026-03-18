import express from "express";
import {
  getMonthlyReport,
  getYearlyReport,
  downloadMonthlyReportCSV,
  downloadYearlyReportCSV,
} from "../controllers/reportsController.js";

const router = express.Router();

router.get("/monthly", getMonthlyReport);
router.get("/yearly", getYearlyReport);
router.get("/monthly/csv", downloadMonthlyReportCSV);
router.get("/yearly/csv", downloadYearlyReportCSV);

export default router;
