import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  category: string;
  description: string;
  venue: string;
  date: Date;
  capacity: number;
  organizerId: mongoose.Types.ObjectId;
  imageUrl?: string;
  ticketTypes: {
    name: string;
    price: number;
    quantity: number;
    sold: number;
  }[];
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
      enum: ["Music", "Technology", "Art", "Food", "Other"],
    },

    description: {
      type: String,
      required: true
    },

    venue: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    capacity: {
      type: Number,
      required: true
    },

    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    imageUrl: {
      type: String,
      default: "",
    },

    ticketTypes: [
      {
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        sold: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model<IEvent>("Event", eventSchema);
export default Event;