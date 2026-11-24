import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Search,
  Music2,
  Laptop,
  Palette,
  Utensils,
  Sparkles,
  Ticket,
} from "lucide-react";
import "./App.css";

const categories = [
  { name: "Music", icon: Music2 },
  { name: "Technology", icon: Laptop },
  { name: "Art", icon: Palette },
  { name: "Food", icon: Utensils },
];

function App() {
  const [events, setEvents] = useState<any[]>([]);
  const { user, logout } = useAuth();

  const wishlistKey = user
    ? `eventra_wishlist_${user.id}`
    : "eventra_wishlist_guest";

  const [wishlist, setWishlist] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem(wishlistKey) || "[]");
  });

  const toggleWishlist = (eventId: string) => {
    const updatedWishlist = wishlist.includes(eventId)
      ? wishlist.filter((id) => id !== eventId)
      : [...wishlist, eventId];
  
    setWishlist(updatedWishlist);
  
    localStorage.setItem(
      wishlistKey,
      JSON.stringify(updatedWishlist)
    );
  };

  useEffect(() => {
    const savedWishlist = JSON.parse(
      localStorage.getItem(wishlistKey) || "[]"
    );
  
    setWishlist(savedWishlist);
  }, [wishlistKey]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/events");
        setEvents(
          response.data.events.map((event: any) => ({
            id: event._id,
            title: event.title,
            category: event.category || "Music",
            date: new Date(event.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            location: event.venue,
            price: event.ticketTypes?.[0]?.price || 0,
            image: event.imageUrl
              ? `http://localhost:5000${event.imageUrl}`
              : event.image ||
                "https://images.unsplash.com/photo-1459749411175-04bf5292cea?w=900",
            tag: "NEW",
          }))
        );
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      
    <nav className="navbar">
      <a href="#" className="logo">
        <span className="logo-icon">
          <CalendarDays size={23} />
        </span>
        eventra<span className="logo-dot">.</span>
      </a>

      <div className="nav-links">
        <a href="#events">Explore Events</a>
        <Link to="/wishlist">❤️ Wishlist</Link>
        <a href="#categories">Categories</a>
        <a href="#about">About Us</a>

        {user?.role === "admin" && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/events">Manage Events</Link>
          </>
        )}

        {user?.role === "staff" && (
          <Link to="/scanner">Ticket Scanner</Link>
        )}
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="login-link">Hi, {user.name}</span>
            <button className="nav-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-link">Log in</Link>
            <Link to="/signup" className="nav-button">
              Sign Up <ArrowUpRight size={16} />
            </Link>
          </>
        )}
      </div>
    </nav>


      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-label">
              <Sparkles size={15} />
              DISCOVER EXPERIENCES THAT MATTER
            </div>

            <h1>
              Make plans.
              <br />
              Make <span>memories.</span>
            </h1>

            <p className="hero-description">
              Discover amazing events, connect with people and
              experience moments worth remembering.
            </p>

            <div className="search-box">
              <Search size={21} />
              <input
                type="text"
                placeholder="Search events or locations..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  document.getElementById("events")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              />
              <button
                onClick={() =>
                  document.getElementById("events")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Explore <ArrowRight size={17} />
              </button>
            </div>

            <div className="hero-note">
              <span className="online-dot"></span>
              Discover events and experiences around you
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200"
              alt="Live music festival"
            />
            <div className="floating-card">
              <div className="floating-icon">
                <Ticket size={21} />
              </div>
              <div>
                <strong>Find your next experience</strong>
                <p>Something exciting awaits.</p>
              </div>
            </div>
            <div className="hero-decoration"></div>
          </div>
        </section>

        <section className="categories-section" id="categories">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE BY INTEREST</span>
              <h2>What are you in the mood for?</h2>
            </div>
            <span className="section-caption">
              Find something you'll love.
            </span>
          </div>

          <div className="category-list">
            <button
              className={`category-item ${selectedCategory === "All" ? "active" : ""}`}
              onClick={() => setSelectedCategory("All")}
            >
              <span className="category-icon"><Sparkles /></span>
              All Events
            </button>

            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  className={`category-item ${selectedCategory === category.name ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="category-icon"><Icon /></span>
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="events-section" id="events">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HANDPICKED FOR YOU</span>
              <h2>Featured events</h2>
              <p className="section-description">
                Don't miss out on experiences happening soon.
              </p>
            </div>
            <a href="#events" className="view-all">
              View all events <ArrowRight size={17} />
            </a>
          </div>

          <div className="events-grid">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="event-image">
                    <img src={event.image} alt={event.title} />
                    <span className="event-tag">{event.tag}</span>
                    <button
                      className="favorite-button"
                      aria-label={
                        wishlist.includes(event.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      onClick={() => toggleWishlist(event.id)}
                      style={{
                        color: wishlist.includes(event.id) ? "#e63970" : "#333",
                      }}
                    >
                      {wishlist.includes(event.id) ? "♥" : "♡"}
                    </button>
                  </div>

                  <div className="event-info">
                    <span className="event-category">{event.category}</span>
                    <h3>{event.title}</h3>

                    <div className="event-detail">
                      <CalendarDays size={15} />
                      {event.date}
                    </div>

                    <div className="event-detail">
                      <MapPin size={15} />
                      {event.location}
                    </div>

                    <div className="event-card-footer">
                      <div>
                        <span className="price-label">Starting from</span>
                        <strong>₹{event.price}</strong>
                      </div>
                      <Link
                        to={`/events/${event.id}`}
                        className="book-button"
                      >
                        Book Now <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <Search size={30} />
                <h3>No events found</h3>
                <p>Try another search or select a different category.</p>
                <button onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="cta-section" id="about">
          <div>
            <span className="eyebrow">HAVE SOMETHING TO SHARE?</span>
            <h2>Bring your event to life.</h2>
            <p>Create an event, reach your audience and make it unforgettable.</p>
          </div>
          {user?.role === "admin" && (
            <Link
              to="/admin/events#create-event-form"
              className="admin-create-button"
            >
              Create an Event <ArrowRight size={22} />
            </Link>
          )}
        </section>
      </main>

      <footer className="footer">
        <a href="#" className="logo">
          <span className="logo-icon">
            <CalendarDays size={22} />
          </span>
          eventra<span className="logo-dot">.</span>
        </a>
        <p>Discover. Book. Experience.</p>
        <span>© 2026 Eventra. All rights reserved.</span>
      </footer>
    </div>
  );
}

export default App;
