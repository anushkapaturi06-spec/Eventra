import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import path from "path";
import { startEventReminders } from "./jobs/eventReminders";

const app = express();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Eventra API is running successfully!"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is working!"
  });
});

const startServer = async () => {
  await connectDB();
  startEventReminders();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Eventra server running on port ${PORT}`);
  });
};

startServer();
