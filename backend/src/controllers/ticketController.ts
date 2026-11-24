
import { Response } from "express";
import Ticket from "../models/Ticket";
import { AuthRequest } from "../middleware/authMiddleware";

export const verifyTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode) {
      return res.status(400).json({
        success: false,
        message: "Ticket code is required",
      });
    }

    const ticket = await Ticket.findOne({ ticketCode });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Invalid ticket",
      });
    }

    if (ticket.checkInStatus === "checked_in") {
      return res.status(400).json({
        success: false,
        message: "This ticket has already been used",
      });
    }

    if (ticket.checkInStatus !== "valid") {
      return res.status(400).json({
        success: false,
        message: "This ticket is not valid",
      });
    }

    ticket.checkInStatus = "checked_in";
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket verified! Entry allowed.",
      ticket,
    });
  } catch (error) {
    console.error("Ticket verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Ticket verification failed",
    });
  }
};
