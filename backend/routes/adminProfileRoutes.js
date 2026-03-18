import express from "express";
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from "../controllers/adminProfilePageController.js";

const router = express.Router();

router.get("/:id", getAdminProfile);
router.put("/:id", updateAdminProfile);
router.put("/:id/password", updateAdminPassword);

export default router;
