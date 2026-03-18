import express from "express";
import {
  getPendingPaymentFlats,
  createOfflinePayment,
} from "../controllers/paymentEntryController.js";

const router = express.Router();

router.get("/flats-with-pending", getPendingPaymentFlats);
router.post("/", createOfflinePayment);

export default router;