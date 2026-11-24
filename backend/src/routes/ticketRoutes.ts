import express from "express";
import { verifyTicket } from "../controllers/ticketController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/verify", protect, authorize("admin", "staff"), verifyTicket);

export default router;