import { useState, useEffect } from "react";
import { api } from "../api/api";

export function EventDetail({ eventId, navigate, token, showToast }) {
  const [event, setEvent]       = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    api.getEvent(eventId)
      .then(setEvent)
      .catch(() => setError("Event not found."))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleBook = async () => {
    if (!token) { navigate("login"); return; }
    setBooking(true); setError(null);
    try {
      const b = await api.createBooking(event.id, quantity, token);
      setSuccess(b);
      setEvent(prev => ({ ...prev, available_tickets: prev.available_tickets - quantity }));
      showToast("Booking confirmed! Ref: " + b.booking_ref);
    } catch (e) {
      setError(e.message);
      showToast(e.message, "error");
    } finally { setBooking(false); }
  };

  if (loading) return <p className="loading">Loading event...</p>;
  if (!event)  return <div className="empty"><p className="empty-title">{error || "Event not found."}</p></div>;

  const soldOut = event.available_tickets === 0;
  const total   = event.price * quantity;

  return (
    <div className="fade-up">
      <button className="back-btn" onClick={() => navigate("events")}>← Back to events</button>

      <div className="event-detail-grid">
        <div>
          <div className="event-detail-img">
            {event.image_url
              ? <img src={event.image_url} alt={event.title} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"var(--radius-lg)"}} />
              : "🎪"}
          </div>

          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
            {event.category && <span className="badge badge-purple">{event.category}</span>}
            {soldOut && <span className="badge badge-red">Sold Out</span>}
            {!soldOut && event.available_tickets < 20 && <span className="badge badge-gold">⚡ Almost sold out</span>}
            {event.price === 0 && <span className="badge badge-green">Free entry</span>}
          </div>

          <h1 className="event-detail-title">{event.title}</h1>

          <div className="event-detail-meta">
            <div className="event-detail-meta-row"><span className="icon">📅</span>{new Date(event.event_date).toLocaleString("en-IN", {dateStyle:"full",timeStyle:"short"})}</div>
            <div className="event-detail-meta-row"><span className="icon">📍</span>{event.location}</div>
            <div className="event-detail-meta-row"><span className="icon">🎟</span>{event.available_tickets} of {event.total_tickets} tickets remaining</div>
          </div>

          {event.description && <p className="event-desc">{event.description}</p>}
        </div>

        <div>
          <div className="card booking-card">
            <div className={"booking-price-display" + (event.price === 0 ? " free" : "")}>
              {event.price === 0 ? "Free" : "₹" + event.price.toLocaleString()}
            </div>
            <p className="booking-price-sub">per ticket</p>

            {success ? (
              <div className="booking-success">
                <div className="booking-success-icon">🎉</div>
                <p className="booking-success-title">You're going!</p>
                <div className="booking-success-ref">{success.booking_ref}</div>
                <p style={{color:"var(--text2)",fontSize:"13px",margin:"8px 0 16px"}}>
                  {success.quantity} ticket{success.quantity > 1 ? "s" : ""} · {event.price === 0 ? "Free" : "₹" + success.total_price.toLocaleString()}
                </p>
                <button className="btn btn-primary btn-full" onClick={() => navigate("bookings")}>View My Tickets</button>
              </div>
            ) : (
              <>
                {!soldOut && (
                  <>
                    <div className="input-group" style={{marginBottom:"16px"}}>
                      <label className="input-label">Number of tickets</label>
                      <select className="input" value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
                        {[...Array(Math.min(10, event.available_tickets))].map((_, i) => (
                          <option key={i+1} value={i+1}>{i+1} ticket{i > 0 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>

                    <div className="booking-divider"/>
                    <div className="booking-total-row" style={{marginBottom:"20px"}}>
                      <span className="booking-total-label">Total</span>
                      <span className="booking-total-value">{event.price === 0 ? "Free" : "₹" + total.toLocaleString()}</span>
                    </div>
                  </>
                )}

                {error && <div className="alert alert-error" style={{marginBottom:"14px"}}>{error}</div>}

                <button
                  className={"btn btn-primary btn-full btn-lg" + (soldOut ? " " : "")}
                  onClick={handleBook}
                  disabled={booking || soldOut}
                >
                  {soldOut ? "Sold Out" : booking ? "Booking..." : token ? "Book Now" : "Sign in to Book"}
                </button>

                {!token && !soldOut && (
                  <p style={{textAlign:"center",fontSize:"13px",color:"var(--text3)",marginTop:"10px"}}>
                    <button style={{background:"none",border:"none",color:"var(--accent2)",cursor:"pointer",fontSize:"13px"}} onClick={() => navigate("login")}>Create an account</button> — it's free
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
