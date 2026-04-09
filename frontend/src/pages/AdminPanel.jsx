import { useState, useEffect } from "react";
import { api } from "../api/api";

const EMPTY = { title:"", description:"", location:"", event_date:"", total_tickets:"", price:"", category:"", image_url:"" };
const CATS  = ["Music","Tech","Sports","Food","Art","Business"];

export function AdminPanel({ token, navigate, showToast }) {
  const [events, setEvents]   = useState([]);
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => { api.getEvents().then(setEvents); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    const payload = { ...form, total_tickets: Number(form.total_tickets), price: Number(form.price), event_date: new Date(form.event_date).toISOString() };
    try {
      if (editing) {
        const updated = await api.updateEvent(editing, payload, token);
        setEvents(ev => ev.map(e => e.id === editing ? updated : e));
        showToast("Event updated successfully");
      } else {
        const created = await api.createEvent(payload, token);
        setEvents(ev => [created, ...ev]);
        showToast("Event created successfully");
      }
      setForm(EMPTY); setEditing(null);
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.deleteEvent(id, token);
      setEvents(ev => ev.filter(e => e.id !== id));
      showToast("Event deleted", "info");
    } catch (e) { showToast(e.message, "error"); }
  };

  const startEdit = (ev) => {
    setEditing(ev.id);
    setForm({ ...ev, event_date: ev.event_date.slice(0, 16), total_tickets: String(ev.total_tickets), price: String(ev.price) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Manage events and ticket inventory</p>
      </div>

      <div className="admin-grid">
        <div className="card" style={{position:"sticky",top:"84px"}}>
          <p className="section-title">{editing ? "✏️ Edit Event" : "✨ New Event"}</p>

          <div className="form-gap">
            <div className="input-group">
              <label className="input-label">Title</label>
              <input className="input" placeholder="Event title" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" placeholder="Describe the event..." value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Location</label>
              <input className="input" placeholder="Venue, City" value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Date & Time</label>
              <input className="input" type="datetime-local" value={form.event_date} onChange={e => set("event_date", e.target.value)} />
            </div>
            <div className="row2">
              <div className="input-group">
                <label className="input-label">Total Tickets</label>
                <input className="input" type="number" placeholder="100" value={form.total_tickets} onChange={e => set("total_tickets", e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Price (₹)</label>
                <input className="input" type="number" placeholder="0" value={form.price} onChange={e => set("price", e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">Select category</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Image URL (optional)</label>
              <input className="input" placeholder="https://..." value={form.image_url} onChange={e => set("image_url", e.target.value)} />
            </div>

            <div style={{display:"flex",gap:"10px",marginTop:"4px"}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={submit} disabled={saving}>
                {saving ? "Saving..." : editing ? "Update Event" : "Create Event"}
              </button>
              {editing && (
                <button className="btn btn-ghost" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel</button>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <p className="section-title">All Events <span className="section-count">{events.length}</span></p>
          {events.length === 0 && <p style={{color:"var(--text3)",fontSize:"14px"}}>No events yet. Create one!</p>}
          {events.map(ev => (
            <div key={ev.id} className="admin-event-row">
              <div>
                <div className="admin-event-name">{ev.title}</div>
                <div className="admin-event-meta">
                  📍 {ev.location} &nbsp;·&nbsp; 🎟 {ev.available_tickets}/{ev.total_tickets} &nbsp;·&nbsp; {ev.price === 0 ? "Free" : "₹" + ev.price}
                </div>
              </div>
              <div className="admin-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(ev)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(ev.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
