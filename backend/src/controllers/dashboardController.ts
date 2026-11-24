
import { Request, Response } from "express";
import Booking from "../models/Booking";
import Event from "../models/Event";
import Payment from "../models/Payment";


export const getDashboardStats = async (
    req: Request,
    res: Response
  ) => {
    try {
      const totalEvents = await Event.countDocuments();
      const totalBookings = await Booking.countDocuments();
  
      const confirmedBookings = await Booking.find({
        status: "confirmed",
      });
  
      const ticketsSold = confirmedBookings.reduce(
        (total, booking) => total + booking.quantity,
        0
      );
  
      const successfulPayments = await Payment.find({
        status: "success",
      });
  
      const totalRevenue = successfulPayments.reduce(
        (total, payment) => total + payment.amount,
        0
      );
  
      const recentBookings = await Booking.find()
        .populate("userId", "name email")
        .populate("eventId", "title")
        .sort({ createdAt: -1 })
        .limit(5);
  
      // Monthly booking statistics
      const monthlyBookings = await Booking.aggregate([
        { $match: { status: "confirmed" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
  
      // Monthly revenue statistics
      const monthlyRevenue = await Payment.aggregate([
        { $match: { status: "success" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
  
      // Top events by tickets sold
      const topEvents = await Booking.aggregate([
        { $match: { status: "confirmed" } },
        {
          $group: {
            _id: "$eventId",
            ticketsSold: { $sum: "$quantity" },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "_id",
            foreignField: "_id",
            as: "event",
          },
        },
        { $unwind: "$event" },
        {
          $project: {
            title: "$event.title",
            ticketsSold: 1,
          },
        },
        { $sort: { ticketsSold: -1 } },
        { $limit: 5 },
      ]);
  
      res.status(200).json({
        success: true,
        stats: {
          totalEvents,
          totalBookings,
          ticketsSold,
          totalRevenue,
        },
        recentBookings,
        monthlyBookings,
        monthlyRevenue,
        topEvents,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
      });
    }
  };
  
