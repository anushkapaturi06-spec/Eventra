import Ticket from "../models/Ticket";
import { Response } from "express";
import Booking from "../models/Booking";
import Payment from "../models/Payment";
import Event from "../models/Event";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import { sendBookingConfirmation } from "../config/mailer";

export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user?.userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been processed",
      });
    }

    // Find the event and selected ticket category
    const event = await Event.findById(booking.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const selectedTicket = event.ticketTypes.find(
      (ticket) => ticket.name === booking.ticketType
    );

    if (!selectedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket category not found",
      });
    }

    const availableTickets =
      selectedTicket.quantity - selectedTicket.sold;

    if (availableTickets < booking.quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available",
      });
    }

    // Update the sold count for the selected category
    selectedTicket.sold += booking.quantity;
    await event.save();

    // Create payment record
    const transactionId = `SIM-${Date.now()}`;

    const payment = await Payment.create({
      bookingId: booking._id,
      transactionId,
      amount: booking.totalAmount,
      status: "success",
      paymentMethod:
        req.body.paymentMethod === "paypal"
          ? "paypal_simulated"
          : "stripe_simulated",
    });

    // Confirm booking
    booking.status = "confirmed";
    await booking.save();

    // Generate individual QR tickets
    const tickets = await Ticket.insertMany(
      Array.from({ length: booking.quantity }, (_, index) => ({
        bookingId: booking._id,
        userId: booking.userId,
        eventId: booking.eventId,
        ticketCode: `EVT-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)
          .toUpperCase()}-${index + 1}`,
        ticketType: booking.ticketType,
        checkInStatus: "valid",
      }))
    );

    // Send booking confirmation email
    try {
      const user = await User.findById(booking.userId);

      if (user) {
        await sendBookingConfirmation(
          user.email,
          user.name,
          event.title,
          booking.quantity,
          tickets.map((ticket) => ticket.ticketCode)
        );
      }
    } catch (emailError) {
      console.error("Booking confirmation email failed:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Payment successful!",
      payment,
      booking,
      tickets,
    });
  } catch (error) {
    console.error("Payment error:", error);

    res.status(500).json({
      success: false,
      message: "Payment processing failed",
    });
  }
};
