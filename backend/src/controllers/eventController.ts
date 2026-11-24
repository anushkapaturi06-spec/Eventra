import { Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../models/Event";
import Booking from "../models/Booking";
import User from "../models/User";
import { sendEventUpdateEmail } from "../config/mailer";

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

// CREATE EVENT
export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      category,
      description,
      venue,
      date,
      capacity,
      ticketTypes: rawTicketTypes,
    } = req.body;
    
    let ticketTypes: any[];
    
    try {
      ticketTypes =
        typeof rawTicketTypes === "string"
          ? JSON.parse(rawTicketTypes)
          : rawTicketTypes;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket categories",
      });
    }

    if (!title || !description || !venue || !date || !capacity || !ticketTypes?.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide all event details and at least one ticket type",
      });
    }

    if (!mongoose.Types.ObjectId.isValid((req as any).user?.userId)) {
      return res.status(401).json({
        success: false,
        message: "Valid organizer account required",
      });
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive whole number",
      });
    }

    const tickets = ticketTypes.map((ticket: any) => ({
      name: String(ticket.name || "").trim(),
      price: Number(ticket.price),
      quantity: Number(ticket.quantity),
      sold: 0,
    }));

    const invalidTicket = tickets.some(
      (ticket: any) =>
        !ticket.name ||
        !Number.isFinite(ticket.price) ||
        ticket.price < 0 ||
        !Number.isInteger(ticket.quantity) ||
        ticket.quantity <= 0
    );

    const totalTicketQuantity = tickets.reduce(
      (sum: number, ticket: any) => sum + ticket.quantity,
      0
    );

    if (invalidTicket || totalTicketQuantity > Number(capacity)) {
      return res.status(400).json({
        success: false,
        message: "Check ticket details. Ticket quantities cannot exceed event capacity.",
      });
    }

    const event = await Event.create({
      title,
      category,
      description,
      venue,
      date: parsedDate,
      capacity: Number(capacity),
      organizerId: (req as any).user.userId,
      ticketTypes: tickets,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

// UPDATE EVENT

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const {
      title,
      category,
      description,
      venue,
      date,
      capacity,
      ticketTypes: rawTicketTypes,
    } = req.body;
    
    let ticketTypes = rawTicketTypes;
    
    if (typeof rawTicketTypes === "string") {
      try {
        ticketTypes = JSON.parse(rawTicketTypes);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket categories",
        });
      }
    }

    const newCapacity =
      capacity !== undefined ? Number(capacity) : event.capacity;

    if (!Number.isInteger(newCapacity) || newCapacity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event capacity",
      });
    }

    if (ticketTypes !== undefined) {
      if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one ticket type is required",
        });
      }

      const updatedTickets = ticketTypes.map((ticket: any) => {
        const existingTicket = event.ticketTypes.find(
          (oldTicket) => oldTicket.name === String(ticket.name || "").trim()
        );

        return {
          name: String(ticket.name || "").trim(),
          price: Number(ticket.price),
          quantity: Number(ticket.quantity),
          sold: existingTicket ? existingTicket.sold : 0,
        };
      });

      const invalidTicket = updatedTickets.some(
        (ticket: any) =>
          !ticket.name ||
          !Number.isFinite(ticket.price) ||
          ticket.price < 0 ||
          !Number.isInteger(ticket.quantity) ||
          ticket.quantity <= 0 ||
          ticket.quantity < ticket.sold
      );

      const duplicateNames =
        new Set(updatedTickets.map((ticket: any) => ticket.name)).size !==
        updatedTickets.length;

      const totalQuantity = updatedTickets.reduce(
        (sum: number, ticket: any) => sum + ticket.quantity,
        0
      );

      const removedSoldTicket = event.ticketTypes.some(
        (oldTicket) =>
          oldTicket.sold > 0 &&
          !updatedTickets.some(
            (newTicket: any) => newTicket.name === oldTicket.name
          )
      );

      if (
        invalidTicket ||
        duplicateNames ||
        removedSoldTicket ||
        totalQuantity > newCapacity
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket details. Check names, quantities, capacity and existing sales.",
        });
      }

      event.set("ticketTypes", updatedTickets);
    }

    event.title = title ?? event.title;
    event.category = category ?? event.category;
    event.description = description ?? event.description;
    event.venue = venue ?? event.venue;
    event.date = date ? new Date(date) : event.date;
    event.capacity = newCapacity;
    if (req.file) {
      event.imageUrl = `/uploads/${req.file.filename}`;
    }

    await event.save();

    // Send update notifications to confirmed attendees
    try {
      const bookings = await Booking.find({
        eventId: event._id,
        status: "confirmed",
      });

      for (const booking of bookings) {
        const user = await User.findById(booking.userId);

        if (user) {
          await sendEventUpdateEmail(
            user.email,
            user.name,
            event.title,
            event.date,
            event.venue
          );
        }
      }
    } catch (emailError) {
      console.error("Event update notification failed:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

// DELETE EVENT

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};
