import express from "express";
import {
  getAllFlats,
  createFlat,
  updateFlat,
  deleteFlat,
} from "../controllers/flatsController.js";

const router = express.Router();

//GET /flats
router.get("/", getAllFlats);
router.post("/", createFlat);
router.put("/:id", updateFlat);
router.delete("/:id", deleteFlat);

export default router;
