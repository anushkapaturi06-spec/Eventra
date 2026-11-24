import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  transactionId: string;
  amount: number;
  status: "success" | "failed";
  paymentMethod: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    transactionId: {
      type: String,
      required: true,
      unique: true
    },

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true
    },

    paymentMethod: {
      type: String,
      default: "Simulated Payment"
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model<IPayment>(
  "Payment",
  paymentSchema
);

export default Payment;
