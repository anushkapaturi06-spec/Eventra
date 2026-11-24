import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, CalendarDays, X, Eye } from "lucide-react";

const API = "http://localhost:5000/api";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Event {
  _id: string;
  title: string;
  category: string;
  description: string;
  venue: string;
  date: string;
  capacity: number;
  imageUrl?: string;
  ticketTypes: TicketType[];
}

interface TicketForm {
  name: string;
  price: string;
  quantity: string;
  sold: number;
}

const emptyForm = {
  title: "",
  category: "Music",
  description: "",
  venue: "",
  date: "",
  capacity: "",
};

const newTicket = (): TicketForm => ({
  name: "",
  price: "",
  quantity: "",
  sold: 0,
});

function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [ticketTypes, setTicketTypes] = useState<TicketForm[]>([
    { ...newTicket(), name: "General Admission" },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const token = localStorage.getItem("eventra_token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data.events);
    } catch {
      setMessage("Unable to load events.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateTicket = (
    index: number,
    field: keyof TicketForm,
    value: string
  ) => {
    setTicketTypes((previous) =>
      previous.map((ticket, i) =>
        i === index ? { ...ticket, [field]: field === "sold" ? Number(value) : value } : ticket
      )
    );
  };

  const addTicket = () => {
    setTicketTypes((previous) => [...previous, newTicket()]);
  };

  const removeTicket = (index: number) => {
    if (ticketTypes[index].sold > 0) {
      setMessage("A ticket type with existing sales cannot be removed.");
      return;
    }

    if (ticketTypes.length === 1) {
      setMessage("An event must have at least one ticket type.");
      return;
    }

    setTicketTypes((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const resetForm = () => {
    setForm(emptyForm);
    setTicketTypes([{ ...newTicket(), name: "General Admission" }]);
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview("");
  };

  
const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    try {
      const eventData = new FormData();
  
      eventData.append("title", form.title);
      eventData.append("category", form.category);
      eventData.append("description", form.description);
      eventData.append("venue", form.venue);
      eventData.append(
        "date",
        new Date(form.date).toISOString()
      );
      eventData.append("capacity", String(Number(form.capacity)));
  
      eventData.append(
        "ticketTypes",
        JSON.stringify(
          ticketTypes.map((ticket) => ({
            name: ticket.name,
            price: Number(ticket.price),
            quantity: Number(ticket.quantity),
            sold: ticket.sold,
          }))
        )
      );
  
      if (selectedImage) {
        eventData.append("image", selectedImage);
      }
  
      if (editingId) {
        await axios.put(
          `${API}/events/${editingId}`,
          eventData,
          { headers }
        );
        setMessage("Event updated successfully!");
      } else {
        await axios.post(
          `${API}/events`,
          eventData,
          { headers }
        );
        setMessage("Event created successfully!");
      }
  
      resetForm();
      await fetchEvents();
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttendees = async (event: Event) => {
    setSelectedEvent(event);
    setAttendees([]);
    setAttendeesLoading(true);
  
    try {
      const response = await axios.get(
        `${API}/bookings/event/${event._id}/attendees`,
        { headers }
      );
  
      setAttendees(response.data.attendees);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Unable to load attendees."
      );
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event._id);
    setSelectedImage(null);
    setImagePreview(event.imageUrl || "");

    setForm({
      title: event.title,
      category: event.category || "Music",
      description: event.description,
      venue: event.venue,
      date: new Date(event.date).toISOString().slice(0, 16),
      capacity: String(event.capacity),
    });

    setTicketTypes(
      event.ticketTypes.map((ticket) => ({
        name: ticket.name,
        price: String(ticket.price),
        quantity: String(ticket.quantity),
        sold: ticket.sold,
      }))
    );

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await axios.delete(`${API}/events/${id}`, { headers });
      setMessage("Event deleted successfully!");
      await fetchEvents();
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Unable to delete event."
      );
    }
  };

  return (
    <div style={{
      maxWidth: "1150px",
      margin: "40px auto",
      padding: "25px",
      color: "#252344"
    }}>
      <h1 style={{ fontSize: "32px" }}>Event Management</h1>
      <p style={{ color: "#777" }}>
        Create and manage your Eventra events.
      </p>

      {message && (
        <p style={{
          padding: "12px",
          background: "#eeeafd",
          borderRadius: "8px",
          color: "#5944c5"
        }}>
          {message}
        </p>
      )}

      <form
        id="create-event-form"
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.07)",
          marginTop: "25px"
        }}
      >
        <h2>{editingId ? "Edit Event" : "Create New Event"}</h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "18px"
        }}>
          {[
            { label: "Event Title", name: "title", type: "text" },
            {
              label: "Event Category",
              name: "category",
              type: "select",
              options: ["Music", "Technology", "Art", "Food", "Other"],
            },
            { label: "Venue", name: "venue", type: "text" },
            { label: "Event Date", name: "date", type: "datetime-local" },
            { label: "Total Capacity", name: "capacity", type: "number" },
          ].map((field) => (
            <label key={field.name} style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontWeight: 600
            }}>
              {field.label}
              {field.type === "select" ? (
                <select
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "15px",
                    }}
                >
                    {("options" in field ? field.options : [])?.map((option: string) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                    ))}
                </select>
                ) : (
                <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    min={field.type === "number" ? 1 : undefined}
                    style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "15px",
                    }}
                />
                )}
            </label>
          ))}
        </div>

        <label style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "18px",
          fontWeight: 600
        }}>
          Event Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "15px",
              resize: "vertical"
            }}
          />
        </label>

        <div style={{ marginTop: "22px" }}>
        <label style={{ fontWeight: 600 }}>
            Event Image
        </label>

        <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                setMessage("Image must be smaller than 5 MB.");
                e.target.value = "";
                return;
            }

            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setMessage("");
            }}
            style={{
            display: "block",
            marginTop: "12px",
            padding: "12px",
            border: "1px dashed #7058df",
            borderRadius: "8px",
            width: "100%",
            boxSizing: "border-box",
            }}
        />

        <p style={{ color: "#777", fontSize: "13px" }}>
            Upload JPG, PNG or WEBP. Maximum size: 5 MB.
        </p>

        {imagePreview && (
            <img
            src={imagePreview}
            alt="Event preview"
            style={{
                width: "100%",
                maxWidth: "350px",
                height: "190px",
                objectFit: "cover",
                borderRadius: "12px",
                marginTop: "12px",
            }}
            />
        )}
        </div>

        <div style={{ marginTop: "28px" }}>
          <h2>Ticket Categories</h2>
          <p style={{ color: "#777" }}>
            Set a separate price and quantity for each ticket category.
          </p>

          {ticketTypes.map((ticket, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #e5e1f5",
                borderRadius: "12px",
                padding: "18px",
                marginTop: "15px",
                background: "#faf9ff"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h3>Ticket Type {index + 1}</h3>

                <button
                  type="button"
                  onClick={() => removeTicket(index)}
                  style={{
                    border: "none",
                    background: "#fdecec",
                    color: "#c62828",
                    padding: "8px",
                    borderRadius: "7px",
                    cursor: "pointer"
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px"
              }}>
                <label>
                  Ticket Name
                  <input
                    required
                    value={ticket.name}
                    onChange={(e) =>
                      updateTicket(index, "name", e.target.value)
                    }
                    placeholder="e.g. VIP"
                    style={inputStyle}
                  />
                </label>

                <label>
                  Price (₹)
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={ticket.price}
                    onChange={(e) =>
                      updateTicket(index, "price", e.target.value)
                    }
                    style={inputStyle}
                  />
                </label>

                <label>
                  Quantity
                  <input
                    required
                    type="number"
                    min={ticket.sold}
                    value={ticket.quantity}
                    onChange={(e) =>
                      updateTicket(index, "quantity", e.target.value)
                    }
                    style={inputStyle}
                  />
                </label>
              </div>

              {ticket.sold > 0 && (
                <p style={{ color: "#777", fontSize: "13px" }}>
                  Already sold: {ticket.sold}. This ticket category cannot be removed.
                </p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addTicket}
            style={{
              marginTop: "15px",
              background: "#eeeafd",
              color: "#5944c5",
              border: "none",
              padding: "12px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Plus size={18} /> Add Ticket Type
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#7058df",
              color: "white",
              border: "none",
              padding: "13px 22px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {loading
              ? "Saving..."
              : editingId
                ? "Update Event"
                : "Create Event"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "13px 22px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 style={{ marginTop: "40px" }}>Existing Events</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px"
      }}>
        {events.map((event) => (
          <div
            key={event._id}
            style={{
              background: "white",
              padding: "22px",
              borderRadius: "14px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.07)"
            }}
          >
            <h3>{event.title}</h3>
            <p style={{ color: "#777" }}>{event.description}</p>
            <p>📍 {event.venue}</p>
            <p>
              <CalendarDays size={16} style={{ verticalAlign: "middle" }} />
              {" "}{new Date(event.date).toLocaleString("en-IN")}
            </p>
            <p>Capacity: {event.capacity}</p>

            {event.ticketTypes.map((ticket, index) => (
              <p key={index}>
                **{ticket.name}**: ₹{ticket.price} | {ticket.sold}/{ticket.quantity} sold
              </p>
            ))}

            <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
            <button
                type="button"
                onClick={() => handleViewAttendees(event)}
                style={{
                background: "#e8f5ee",
                color: "#237a45",
                border: "none",
                padding: "10px 15px",
                borderRadius: "7px",
                cursor: "pointer",
                }}
            >
                <Eye size={15} /> View Attendees
            </button>

            <button onClick={() => handleEdit(event)}>
                <Pencil size={15} /> Edit
            </button>

            <button onClick={() => handleDelete(event._id)}>
                <Trash2 size={15} /> Delete
            </button>
            </div>
            </div>
        ))}

      </div>
      {selectedEvent && (
        <div
            style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
            }}
        >
            <div
            style={{
                background: "white",
                borderRadius: "14px",
                padding: "25px",
                width: "100%",
                maxWidth: "750px",
                maxHeight: "80vh",
                overflowY: "auto",
            }}
            >
            <div
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                }}
            >
                <h2>Attendees – {selectedEvent.title}</h2>
                <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                >
                <X size={20} />
                </button>
            </div>

            {attendeesLoading ? (
                <p>Loading attendees...</p>
            ) : attendees.length === 0 ? (
                <p>No confirmed attendees yet.</p>
            ) : (
                <div>
                {attendees.map((booking: any) => (
                    <div
                    key={booking._id}
                    style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "10px",
                    }}
                    >
                    <p><strong>Name:</strong> {booking.userId?.name || "Unknown"}</p>
                    <p><strong>Email:</strong> {booking.userId?.email || "Unknown"}</p>
                    <p><strong>Ticket:</strong> {booking.ticketType}</p>
                    <p><strong>Quantity:</strong> {booking.quantity}</p>
                    <p><strong>Amount:</strong> ₹{booking.totalAmount}</p>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        )}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box" as const,
  marginTop: "8px",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "15px"
};

export default EventManagement;
