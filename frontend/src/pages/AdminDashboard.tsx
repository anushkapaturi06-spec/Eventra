
import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  Ticket,
  ShoppingBag,
  IndianRupee,
  LayoutDashboard,
} from "lucide-react";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

interface DashboardStats {
  totalEvents: number;
  totalBookings: number;
  ticketsSold: number;
  totalRevenue: number;
}
function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [monthlyBookings, setMonthlyBookings] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [topEvents, setTopEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("eventra_token");

        const response = await axios.get(
          "http://localhost:5000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data.stats);
        setRecentBookings(response.data.recentBookings);
        setMonthlyBookings(response.data.monthlyBookings);
        setMonthlyRevenue(response.data.monthlyRevenue);
        setTopEvents(response.data.topEvents);
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <h2>Loading dashboard...</h2>;

  if (!stats) {
    return <h2>Unable to load dashboard. Please check your access.</h2>;
  }

  const cards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: <CalendarDays />,
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: <ShoppingBag />,
    },
    {
      title: "Tickets Sold",
      value: stats.ticketsSold,
      icon: <Ticket />,
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: <IndianRupee />,
    },
  ];

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>
      <h1 style={{ color: "#252344", fontSize: "32px" }}>
        <LayoutDashboard size={30} /> Eventra Admin Dashboard
      </h1>

      <p style={{ color: "#777" }}>
        Overview of your event management platform.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "20px",
          marginTop: "35px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "14px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ color: "#7058df" }}>{card.icon}</div>
            <p style={{ color: "#777" }}>{card.title}</p>
            <h2 style={{ color: "#252344", fontSize: "28px" }}>
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
        <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "35px",
        }}
        >
        {/* Monthly Bookings */}
        <div style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.07)",
        }}>
            <h3 style={{ color: "#252344" }}>Monthly Bookings</h3>
            <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyBookings.map((item) => ({
                ...item,
                month: new Date(
                item._id.year,
                item._id.month - 1
                ).toLocaleString("en-IN", {
                month: "short",
                year: "numeric",
                }),
            }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#7058df" />
            </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Monthly Revenue */}
        <div style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.07)",
        }}>
            <h3 style={{ color: "#252344" }}>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyRevenue.map((item) => ({
                ...item,
                month: new Date(
                item._id.year,
                item._id.month - 1
                ).toLocaleString("en-IN", {
                month: "short",
                year: "numeric",
                }),
            }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Line
                type="monotone"
                dataKey="revenue"
                stroke="#16a085"
                strokeWidth={3}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>

        {/* Top Events */}
        <div style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.07)",
        }}>
            <h3 style={{ color: "#252344" }}>Top 5 Events</h3>
            <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topEvents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                type="category"
                dataKey="title"
                width={110}
                />
                <Tooltip />
                <Bar dataKey="ticketsSold" fill="#f39c12" />
            </BarChart>
            </ResponsiveContainer>
        </div>
        </div>

      <div
        style={{
          marginTop: "40px",
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.07)",
        }}
      >
        <h2 style={{ color: "#252344" }}>Recent Bookings</h2>

        {recentBookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Attendee</th>
                  <th align="left">Event</th>
                  <th align="left">Ticket Type</th>
                  <th align="left">Quantity</th>
                  <th align="left">Amount</th>
                  <th align="left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.userId?.name || "Unknown"}</td>
                    <td>{booking.eventId?.title || "Unknown"}</td>
                    <td>{booking.ticketType}</td>
                    <td>{booking.quantity}</td>
                    <td>₹{booking.totalAmount}</td>
                    <td>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
