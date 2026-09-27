import express from "express";
import {
  getProperties,
  getPropertyById,
  getPropertyInternalById,
  createProperty,
  updateProperty,
} from "../controllers/propertyController.js";

const router = express.Router();

// GET /api/properties
router.get("/", getProperties);

// POST /api/properties
router.post("/", createProperty);

// GET /api/properties/:id/internal  (internal-only; includes broker source)
router.get("/:id/internal", getPropertyInternalById);

// GET /api/properties/:id
router.get("/:id", getPropertyById);

// PUT /api/properties/:id
router.put("/:id", updateProperty);

export default router;
