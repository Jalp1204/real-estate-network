import express from "express";
import {
  getProperties,
  getPropertyById,
} from "../controllers/propertyController.js";

const router = express.Router();

// GET /api/properties
router.get("/", getProperties);

// GET /api/properties/:id
router.get("/:id", getPropertyById);

export default router;
