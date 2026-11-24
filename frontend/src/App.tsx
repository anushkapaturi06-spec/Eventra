import EventDetails from "./pages/EventDetails";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TicketScanner from "./pages/TicketScanner";
import AdminDashboard from "./pages/AdminDashboard";
import EventManagement from "./pages/EventManagement";
import Wishlist from "./pages/Wishlist";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/scanner" element={<TicketScanner />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/events" element={<EventManagement />} />
      <Route path="/wishlist" element={<Wishlist />} />
    </Routes>
  );
}

export default App;
