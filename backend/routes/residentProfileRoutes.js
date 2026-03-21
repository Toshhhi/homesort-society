import express from "express";
import {
  getResidentProfile,
  updateResidentProfile,
} from "../controllers/residentProfileController.js";

const router = express.Router();

router.get("/:email", getResidentProfile);

router.put("/:email", updateResidentProfile);

export default router;
