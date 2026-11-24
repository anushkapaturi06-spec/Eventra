
import cron from "node-cron";
import Booking from "../models/Booking";
import Event from "../models/Event";
import User from "../models/User";
import { sendEventReminder } from "../config/mailer";

export const startEventReminders = () => {
  // Check every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();

      // Find events starting between 24 hours and 24 hours 15 minutes from now
      const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

      const events = await Event.find({
        date: { $gte: startTime, $lt: endTime },
      });

      for (const event of events) {
        const bookings = await Booking.find({
            eventId: event._id,
            status: "confirmed",
            reminderSent: false,
        });

        for (const booking of bookings) {
          try {
            const user = await User.findById(booking.userId);

            if (user) {
              await sendEventReminder(
                user.email,
                user.name,
                event.title,
                event.date,
                event.venue
              );
              booking.reminderSent = true;
              await booking.save();
            }
          } catch (emailError) {
            console.error("Reminder email failed:", emailError);
          }
        }
      }
    } catch (error) {
      console.error("Event reminder scheduler error:", error);
    }
  });

  console.log("Event reminder scheduler started.");
};
