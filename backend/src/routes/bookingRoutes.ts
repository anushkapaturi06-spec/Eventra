import express from "express";
import {
    createBooking,
    getEventAttendees,
} from "../controllers/bookingController";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createBooking);
router.get(
    "/event/:eventId/attendees",
    protect,
    authorize("admin"),
    getEventAttendees
);

export default router;
