import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft, MapPin, CalendarDays, Users,
  CheckCircle2, Minus, Plus, CreditCard, Sparkles
} from "lucide-react";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [tickets, setTickets] = useState<any[]>([]);

  const selectedTicketDetails = event?.ticketTypes?.find(
    (ticket: any) => ticket.name === selectedTicket
  );

  const availableTickets = selectedTicketDetails
    ? selectedTicketDetails.quantity - selectedTicketDetails.sold
    : 0;

  const totalPrice = selectedTicketDetails
    ? selectedTicketDetails.price * quantity
    : 0;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/events/${id}`
        );
        setEvent(response.data.event);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      const token = localStorage.getItem("eventra_token");

      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        {
          eventId: id,
          ticketType: selectedTicket,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookingId(response.data.booking._id);
      alert("Booking created successfully!");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Booking failed. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem("eventra_token");

      const response = await axios.post(
        "http://localhost:5000/api/payments",
        { bookingId, paymentMethod },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(response.data.tickets);
      setPaymentSuccess(true);
      alert("Payment successful! Your booking is confirmed.");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const imageUrl = event?.imageUrl
    ? `http://localhost:5000${event.imageUrl}`
    : event?.image || "";

  if (loading) {
    return <div className="event-loading">Loading your event...</div>;
  }

  if (!event) {
    return <div className="event-loading">Event not found.</div>;
  }

  return (
    <div className="event-page">
      <style>{`
        .event-page {
          min-height: 100vh;
          background: #f7f7fc;
          color: #22213a;
          padding: 35px 6%;
          font-family: Inter, Arial, sans-serif;
        }

        .event-container {
          max-width: 1200px;
          margin: auto;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border: 1px solid #e6e3f0;
          background: white;
          padding: 11px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #5141a5;
          margin-bottom: 25px;
        }

        .event-hero {
          background: white;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 8px 35px rgba(35, 25, 80, .06);
          margin-bottom: 30px;
        }

        .event-banner {
          height: 350px;
          background: linear-gradient(135deg, #30206c, #8065d9);
          position: relative;
          overflow: hidden;
        }

        .event-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-banner-placeholder {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 55px;
          font-weight: 800;
          letter-spacing: -2px;
        }

        .event-hero-content {
          padding: 30px 36px 35px;
        }

        .event-category {
          display: inline-block;
          background: #eeeaff;
          color: #6248c5;
          padding: 7px 13px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 14px;
        }

        .event-title {
          font-size: clamp(30px, 5vw, 43px);
          font-weight: 800;
          margin: 0 0 12px;
          letter-spacing: -1.4px;
        }

        .event-description {
          color: #77758a;
          font-size: 16px;
          line-height: 1.8;
          max-width: 850px;
        }

        .event-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 28px;
          align-items: start;
        }

        .event-card {
          background: white;
          border-radius: 18px;
          padding: 27px;
          box-shadow: 0 8px 30px rgba(35, 25, 80, .05);
          margin-bottom: 24px;
        }

        .section-heading {
          font-size: 21px;
          font-weight: 800;
          margin: 0 0 22px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 0;
          border-bottom: 1px solid #f0eff5;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-icon {
          background: #f0edff;
          color: #694fca;
          width: 43px;
          height: 43px;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        .detail-label {
          color: #9693a6;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 700;
        }

        .ticket-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1.5px solid #eae8f1;
          border-radius: 14px;
          padding: 19px;
          margin-bottom: 13px;
          cursor: pointer;
          transition: .2s;
          gap: 12px;
        }

        .ticket-option:hover {
          border-color: #a594e9;
          background: #faf9ff;
        }

        .ticket-option.selected {
          border-color: #7358d3;
          background: #f6f3ff;
          box-shadow: 0 0 0 2px rgba(115, 88, 211, .08);
        }

        .ticket-option.unavailable {
          opacity: .5;
          cursor: not-allowed;
        }

        .ticket-radio {
          accent-color: #7155d3;
          width: 18px;
          height: 18px;
        }

        .ticket-name {
          font-weight: 750;
          font-size: 15px;
        }

        .ticket-availability {
          font-size: 12px;
          color: #9290a1;
          margin-top: 6px;
        }

        .ticket-price {
          font-size: 18px;
          font-weight: 800;
          color: #6148bd;
          white-space: nowrap;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
        }

        .quantity-button {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid #e7e4f0;
          background: white;
          color: #654cc0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quantity-number {
          font-size: 17px;
          font-weight: 800;
          min-width: 20px;
          text-align: center;
        }

        .summary-card {
          position: sticky;
          top: 25px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #77758a;
          font-size: 14px;
          margin: 17px 0;
        }

        .summary-total {
          border-top: 1px dashed #dedbe9;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          font-size: 22px;
          font-weight: 850;
          margin-top: 22px;
        }

        .primary-button {
          width: 100%;
          border: none;
          border-radius: 12px;
          background: linear-gradient(120deg, #7054ce, #9175e8);
          color: white;
          padding: 16px;
          font-size: 15px;
          font-weight: 750;
          cursor: pointer;
          margin-top: 22px;
          box-shadow: 0 7px 18px rgba(105, 78, 200, .2);
          transition: .2s;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(105, 78, 200, .3);
        }

        .primary-button:disabled {
          background: #c8c4d6;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-button {
          width: 100%;
          border: 1px solid #ded8f4;
          border-radius: 12px;
          background: #f7f4ff;
          color: #634abd;
          padding: 15px;
          font-weight: 750;
          cursor: pointer;
          margin-top: 12px;
        }

        .success-card {
          background: #edfaf3;
          border: 1px solid #c8edda;
          color: #23794a;
          border-radius: 14px;
          padding: 18px;
          margin-top: 20px;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .qr-card {
          background: white;
          border: 1px solid #e9e5f3;
          border-radius: 16px;
          padding: 22px;
          margin-top: 15px;
          text-align: center;
        }

        .qr-card svg {
          max-width: 100%;
          height: auto;
        }

        .event-loading {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f7fc;
          color: #6248c5;
          font-size: 20px;
          font-weight: 700;
        }

        @media (max-width: 800px) {
          .event-page {
            padding: 22px 4%;
          }

          .event-layout {
            grid-template-columns: 1fr;
          }

          .summary-card {
            position: static;
          }

          .event-banner {
            height: 230px;
          }

          .event-hero-content {
            padding: 23px;
          }

          .event-card {
            padding: 21px;
          }
        }
      `}</style>

      <div className="event-container">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={17} /> Back to Events
        </button>

        <div className="event-hero">
          <div className="event-banner">
            {imageUrl ? (
              <img src={imageUrl} alt={event.title} />
            ) : (
              <div className="event-banner-placeholder">
                <Sparkles size={48} style={{ marginRight: 15 }} />
                EVENTRA
              </div>
            )}
          </div>

          <div className="event-hero-content">
            <span className="event-category">
              {event.category || "Featured Event"}
            </span>
            <h1 className="event-title">{event.title}</h1>
            <p className="event-description">{event.description}</p>
          </div>
        </div>

        <div className="event-layout">
          <div>
            <div className="event-card">
              <h2 className="section-heading">Event Information</h2>

              <div className="detail-item">
                <div className="detail-icon"><MapPin size={20} /></div>
                <div>
                  <div className="detail-label">VENUE</div>
                  <div className="detail-value">{event.venue}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon"><CalendarDays size={20} /></div>
                <div>
                  <div className="detail-label">DATE & TIME</div>
                  <div className="detail-value">
                    {new Date(event.date).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon"><Users size={20} /></div>
                <div>
                  <div className="detail-label">EVENT CAPACITY</div>
                  <div className="detail-value">
                    {event.capacity} attendees
                  </div>
                </div>
              </div>
            </div>

            <div className="event-card">
              <h2 className="section-heading">Choose Your Tickets</h2>

              {event.ticketTypes.map((ticket: any, index: number) => {
                const remaining = ticket.quantity - ticket.sold;
                const soldOut = remaining <= 0;

                return (
                  <label
                    key={index}
                    className={`ticket-option ${
                      selectedTicket === ticket.name ? "selected" : ""
                    } ${soldOut ? "unavailable" : ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input
                        className="ticket-radio"
                        type="radio"
                        name="ticket"
                        value={ticket.name}
                        checked={selectedTicket === ticket.name}
                        disabled={soldOut || paymentSuccess}
                        onChange={() => {
                          setSelectedTicket(ticket.name);
                          setQuantity(1);
                          setBookingId("");
                        }}
                      />

                      <div>
                        <div className="ticket-name">{ticket.name}</div>
                        <div className="ticket-availability">
                          {soldOut ? "Sold out" : `${remaining} tickets available`}
                        </div>
                      </div>
                    </div>

                    <div className="ticket-price">
                      ₹{ticket.price}
                    </div>
                  </label>
                );
              })}

              <div className="quantity-control">
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  Number of tickets
                </span>

                <button
                  className="quantity-button"
                  disabled={!selectedTicket || quantity <= 1 || !!bookingId}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={16} />
                </button>

                <span className="quantity-number">{quantity}</span>

                <button
                  className="quantity-button"
                  disabled={
                    !selectedTicket ||
                    quantity >= availableTickets ||
                    !!bookingId
                  }
                  onClick={() =>
                    setQuantity((q) => Math.min(availableTickets, q + 1))
                  }
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="event-card summary-card">
              <h2 className="section-heading">Booking Summary</h2>

              <div className="summary-row">
                <span>Selected ticket</span>
                <strong>{selectedTicket || "Not selected"}</strong>
              </div>

              <div className="summary-row">
                <span>Quantity</span>
                <strong>{quantity}</strong>
              </div>

              {selectedTicketDetails && (
                <div className="summary-row">
                  <span>Price per ticket</span>
                  <strong>₹{selectedTicketDetails.price}</strong>
                </div>
              )}

              <div className="summary-total">
                <span>Total</span>
                <span style={{ color: "#684fc4" }}>₹{totalPrice}</span>
              </div>

              {!bookingId && (
                <button
                  className="primary-button"
                  disabled={
                    !selectedTicket ||
                    availableTickets <= 0 ||
                    quantity > availableTickets ||
                    bookingLoading ||
                    paymentSuccess
                  }
                  onClick={handleBooking}
                >
                  {bookingLoading ? "Creating Booking..." : "Continue to Booking"}
                </button>
              )}

              {bookingId && !paymentSuccess && (
                <>
                  <div className="success-card">
                    <CheckCircle2 size={22} />
                    <span>Your booking has been created!</span>
                  </div>

                  <div style={{ marginTop: "22px" }}>
                    <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>
                      Choose Payment Method
                    </h3>

                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "15px",
                      border: paymentMethod === "stripe"
                        ? "2px solid #7054ce"
                        : "1px solid #e6e3f0",
                      borderRadius: "12px",
                      marginBottom: "10px",
                      cursor: "pointer",
                    }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={paymentMethod === "stripe"}
                        onChange={() => setPaymentMethod("stripe")}
                      />
                      <CreditCard size={20} />
                      <strong>Stripe (Simulated)</strong>
                    </label>

                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "15px",
                      border: paymentMethod === "paypal"
                        ? "2px solid #7054ce"
                        : "1px solid #e6e3f0",
                      borderRadius: "12px",
                      cursor: "pointer",
                    }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={() => setPaymentMethod("paypal")}
                      />
                      <span style={{ fontWeight: 800, color: "#174ea6" }}>P</span>
                      <strong>PayPal (Simulated)</strong>
                    </label>
                  </div>

                  <button
                    className="primary-button"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                  >
                    <CreditCard size={17} style={{ marginRight: 8, verticalAlign: "middle" }} />
                    {paymentLoading ? "Processing Payment..." : "Pay Now"}
                  </button>
                </>
              )}

              {paymentSuccess && (
                <div className="success-card">
                  <CheckCircle2 size={24} />
                  <div>
                    <strong>Payment Successful!</strong>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      Your tickets are confirmed.
                    </div>
                  </div>
                </div>
              )}

              <p style={{
                textAlign: "center",
                fontSize: 12,
                color: "#aaa6b9",
                marginTop: 18,
              }}>
                <CheckCircle2 size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />
                Secure booking through Eventra
              </p>
            </div>
          </div>
        </div>

        {tickets.length > 0 && (
          <div className="event-card" style={{ marginTop: 10 }}>
            <h2 className="section-heading">
              <CheckCircle2
                size={23}
                color="#24965b"
                style={{ verticalAlign: "middle", marginRight: 9 }}
              />
              Your Event Tickets
            </h2>

            <p style={{ color: "#77758a", fontSize: 14 }}>
              Your booking is confirmed! Present the individual QR code for
              each ticket at the event entrance.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 18,
            }}>
              {tickets.map((ticket: any, index: number) => (
                <div className="qr-card" key={ticket._id}>
                  <div className="event-category">TICKET {index + 1}</div>
                  <h3>{event.title}</h3>
                  <p style={{ color: "#77758a", fontSize: 13 }}>
                    {ticket.ticketType}
                  </p>

                  <QRCodeSVG
                    value={ticket.ticketCode}
                    size={180}
                    level="H"
                    includeMargin
                  />

                  <p style={{
                    fontSize: 12,
                    fontWeight: 700,
                    marginTop: 12,
                    wordBreak: "break-all",
                  }}>
                    {ticket.ticketCode}
                  </p>

                  <p style={{ fontSize: 12, color: "#888" }}>
                    Present this QR code at the entrance.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
