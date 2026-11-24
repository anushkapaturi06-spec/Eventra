
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const wishlistKey = user
    ? `eventra_wishlist_${user.id}`
    : "eventra_wishlist_guest";

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(wishlistKey) || "[]"
    );
    setWishlist(saved);
  }, [wishlistKey]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/events"
        );
        setEvents(response.data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const removeFromWishlist = (eventId: string) => {
    const updated = wishlist.filter((id) => id !== eventId);
    setWishlist(updated);
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
  };

  const savedEvents = events.filter((event) =>
    wishlist.includes(event._id)
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "50px auto", padding: "20px" }}>
      <button onClick={() => navigate("/")}>
        <ArrowLeft size={16} /> Back to Events
      </button>

      <h1 style={{ marginTop: "30px" }}>
        <Heart color="#e63970" fill="#e63970" /> My Wishlist
      </h1>

      <p>Events you've saved for later.</p>

      {loading ? (
        <p>Loading your wishlist...</p>
      ) : savedEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "70px 20px" }}>
          <Heart size={55} color="#ccc" />
          <h2>Your wishlist is empty</h2>
          <p>Save events you love and find them here.</p>
          <button onClick={() => navigate("/")}>
            Explore Events
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {savedEvents.map((event) => (
            <article className="event-card" key={event._id}>
              <div className="event-image">
                <img
                  src={
                    event.imageUrl
                      ? `http://localhost:5000${event.imageUrl}`
                      : event.image
                  }
                  alt={event.title}
                />

                <button
                  className="favorite-button"
                  onClick={() => removeFromWishlist(event._id)}
                  aria-label="Remove from wishlist"
                  style={{ color: "#e63970" }}
                >
                  ♥
                </button>
              </div>

              <div className="event-info">
                <span className="event-category">
                  {event.category}
                </span>

                <h3>{event.title}</h3>
                <p>📅 {new Date(event.date).toLocaleDateString("en-IN")}</p>
                <p>📍 {event.venue}</p>

                <button onClick={() => navigate(`/events/${event._id}`)}>
                  Book Now →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
