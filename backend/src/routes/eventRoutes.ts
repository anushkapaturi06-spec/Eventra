import express from "express";
import { uploadEventImage } from "../middleware/upload";

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";

import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// Admin and staff routes
router.post(
    "/",
    protect,
    authorize("admin", "staff"),
    uploadEventImage.single("image"),
    createEvent
  );

router.put(
    "/:id",
    protect,
    authorize("admin", "staff"),
    uploadEventImage.single("image"),
    updateEvent
  );

router.delete("/:id", protect, authorize("admin", "staff"), deleteEvent);

export default router;
