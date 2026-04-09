import { useState, useEffect } from "react";
import { api } from "../api/api";

export function MyBookings({ token, navigate, showToast }) {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!token) { navigate("login"); return; }
    api.getMyBookings(token).then(setBookings).finally(() => setLoading(false));
  }, [token]);

  const cancel = async (id) => {
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    setCancelling(id);
    try {
      await api.cancelBooking(id, token);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
      showToast("Booking cancelled. Tickets have been released.", "info");
    } catch (e) {
      showToast(e.message, "error");
    } finally { setCancelling(null); }
  };

  if (loading) return <p className="loading">Loading your tickets...</p>;

  const confirmed  = bookings.filter(b => b.status === "confirmed");
  const cancelled  = bookings.filter(b => b.status === "cancelled");

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">My Tickets</h1>
        <p className="page-subtitle">{confirmed.length} active booking{confirmed.length !== 1 ? "s" : ""}</p>
      </div>

      {bookings.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🎟</div>
          <p className="empty-title">No bookings yet</p>
          <p className="empty-sub">
            <button style={{background:"none",border:"none",color:"var(--accent2)",cursor:"pointer",fontSize:"15px"}} onClick={() => navigate("events")}>
              Browse events →
            </button>
          </p>
        </div>
      )}

      {confirmed.length > 0 && (
        <>
          <p className="section-title">Active <span className="section-count">{confirmed.length}</span></p>
          <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"32px"}}>
            {confirmed.map(b => <BookingRow key={b.id} b={b} onCancel={cancel} cancelling={cancelling} />)}
          </div>
        </>
      )}

      {cancelled.length > 0 && (
        <>
          <p className="section-title" style={{color:"var(--text3)"}}>Cancelled <span className="section-count">{cancelled.length}</span></p>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {cancelled.map(b => <BookingRow key={b.id} b={b} cancelled />)}
          </div>
        </>
      )}
    </div>
  );
}

function BookingRow({ b, onCancel, cancelling, cancelled }) {
  return (
    <div className="card booking-item" style={{opacity: cancelled ? 0.5 : 1}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px",flexWrap:"wrap"}}>
          <span className="booking-ref">{b.booking_ref}</span>
          <span className={"badge " + (b.status === "confirmed" ? "badge-green" : "badge-red")}>
            {b.status === "confirmed" ? "✓ Confirmed" : "Cancelled"}
          </span>
        </div>
        <div className="booking-meta">
          <span>🎫 {b.quantity} ticket{b.quantity > 1 ? "s" : ""}</span>
          <span>💰 {b.total_price === 0 ? "Free" : "₹" + b.total_price.toLocaleString()}</span>
          <span>Event #{b.event_id}</span>
        </div>
      </div>
      {!cancelled && (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onCancel(b.id)}
          disabled={cancelling === b.id}
        >
          {cancelling === b.id ? "..." : "Cancel"}
        </button>
      )}
    </div>
  );
}
