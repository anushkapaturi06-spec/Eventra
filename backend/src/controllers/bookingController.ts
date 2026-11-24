import { Response } from "express";
import Booking from "../models/Booking";
import Event from "../models/Event";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import { sendBookingConfirmation } from "../config/mailer";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, ticketType, quantity } = req.body;

    if (!eventId || !ticketType || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid booking details",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const selectedTicket = event.ticketTypes.find(
      (ticket: any) => ticket.name === ticketType
    );

    if (!selectedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket type not found",
      });
    }

    const available = selectedTicket.quantity - selectedTicket.sold;

    if (quantity > available) {
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available",
      });
    }

    const totalAmount = selectedTicket.price * quantity;

    const booking = await Booking.create({
      userId: req.user?.userId,
      eventId,
      ticketType,
      quantity,
      totalAmount,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

export const getEventAttendees = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const bookings = await Booking.find({
      eventId,
      status: "confirmed",
    }).populate("userId", "name email");

    res.status(200).json({
      success: true,
      attendees: bookings,
    });
  } catch (error) {
    console.error("Fetch attendees error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendees",
    });
  }
};
