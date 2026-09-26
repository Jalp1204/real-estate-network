import express from "express";
import { getLocations } from "../controllers/locationController.js";

const router = express.Router();

// GET /api/locations
router.get("/", getLocations);

export default router;
