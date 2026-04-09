import { useState, useEffect } from "react";
import { api } from "../api/api";

const CATEGORIES = ["All", "Music", "Tech", "Sports", "Food", "Art", "Business"];
const CAT_ICONS  = { Music:"🎵", Tech:"💻", Sports:"⚽", Food:"🍜", Art:"🎨", Business:"💼" };

export function EventList({ navigate, token, showToast }) {
  const [events, setEvents]     = useState([]);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search)             params.search   = search;
    if (category !== "All") params.category = category;
    api.getEvents(params)
      .then(setEvents)
      .catch(() => showToast("Failed to load events", "error"))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div>
      <div className="hero fade-up">
        <p className="hero-eyebrow">Discover · Book · Experience</p>
        <h1 className="hero-title">Find your next<br/>unforgettable event</h1>
        <p className="hero-sub">Browse hundreds of events and secure your spot in seconds.</p>

        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="input search-input"
              placeholder="Search events, venues, artists..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-chips">
          {CATEGORIES.map(c => (
            <button key={c} className={"chip" + (category === c ? " active" : "")} onClick={() => setCategory(c)}>
              {CAT_ICONS[c] ? CAT_ICONS[c] + " " : ""}{c}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="loading">Loading events...</p>}

      {!loading && events.length === 0 && (
        <div className="empty fade-up">
          <div className="empty-icon">🎭</div>
          <p className="empty-title">No events found</p>
          <p className="empty-sub">Try a different search term or category.</p>
        </div>
      )}

      <div className="events-grid">
        {events.map((ev, i) => (
          <div
            key={ev.id}
            className={"card card-hover event-card fade-up fade-up-" + Math.min(i + 1, 3)}
            onClick={() => navigate("event", { eventId: ev.id })}
          >
            <div className="event-card-img">
              {ev.image_url
                ? <img src={ev.image_url} alt={ev.title} />
                : (CAT_ICONS[ev.category] || "🎪")}
            </div>

            <div className="event-card-meta">
              {ev.category && <span className="badge badge-purple">{ev.category}</span>}
              {ev.available_tickets < 20 && ev.available_tickets > 0 && (
                <span className="badge badge-gold">⚡ Almost sold out</span>
              )}
              {ev.available_tickets === 0 && <span className="badge badge-red">Sold Out</span>}
              {ev.price === 0 && <span className="badge badge-green">Free</span>}
            </div>

            <h3 className="event-card-title">{ev.title}</h3>

            <div className="event-card-info">
              <span>📅 {new Date(ev.event_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
              <span>📍 {ev.location}</span>
            </div>

            <div className="event-card-footer">
              <span className={"event-price" + (ev.price === 0 ? " event-price-free" : "")}>
                {ev.price === 0 ? "Free" : "₹" + ev.price.toLocaleString()}
              </span>
              <span className="ticket-count">{ev.available_tickets} left</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
