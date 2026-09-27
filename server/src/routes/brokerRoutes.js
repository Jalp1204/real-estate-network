import express from "express";
import {
  getBrokers,
  getBrokerById,
  createBroker,
  updateBroker,
  deleteBroker,
} from "../controllers/brokerController.js";

const router = express.Router();

// GET /api/brokers  (optional ?search=)
router.get("/", getBrokers);

// POST /api/brokers
router.post("/", createBroker);

// GET /api/brokers/:id
router.get("/:id", getBrokerById);

// PUT /api/brokers/:id
router.put("/:id", updateBroker);

// DELETE /api/brokers/:id
router.delete("/:id", deleteBroker);

export default router;
