// In production (Vercel), set VITE_API_URL to your Render backend URL
// e.g. https://eventify-backend.onrender.com
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login:    (email, password)              => req("/auth/login",    { method: "POST", body: { email, password } }),
  register: (username, email, password)    => req("/auth/register", { method: "POST", body: { username, email, password } }),
  getEvents:  (params = {})               => req("/events/?" + new URLSearchParams(params)),
  getEvent:   (id)                        => req(`/events/${id}`),
  createEvent: (data, token)              => req("/events/",        { method: "POST", body: data, token }),
  updateEvent: (id, data, token)          => req(`/events/${id}`,   { method: "PUT",  body: data, token }),
  deleteEvent: (id, token)               => req(`/events/${id}`,   { method: "DELETE", token }),
  getMyBookings: (token)                  => req("/bookings/my",    { token }),
  createBooking: (event_id, quantity, token) => req("/bookings/",   { method: "POST", body: { event_id, quantity }, token }),
  cancelBooking: (id, token)             => req(`/bookings/${id}`,  { method: "DELETE", token }),
};
