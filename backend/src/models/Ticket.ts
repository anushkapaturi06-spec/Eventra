import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  ticketCode: string;
  ticketType: string;
  checkInStatus: "valid" | "checked_in" | "cancelled";
}

const ticketSchema = new Schema<ITicket>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    ticketCode: {
      type: String,
      required: true,
      unique: true
    },

    ticketType: {
      type: String,
      required: true
    },

    checkInStatus: {
      type: String,
      enum: ["valid", "checked_in", "cancelled"],
      default: "valid"
    }
  },
  {
    timestamps: true
  }
);

const Ticket = mongoose.model<ITicket>(
  "Ticket",
  ticketSchema
);

export default Ticket;
