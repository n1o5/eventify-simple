import { useState, useEffect } from "react";
import { EventList } from "./pages/EventList";
import { EventDetail } from "./pages/EventDetail";
import { MyBookings } from "./pages/MyBookings";
import { LoginPage } from "./pages/LoginPage";
import { AdminPanel } from "./pages/AdminPanel";
import { Navbar } from "./components/Navbar";
import "./styles.css";

export default function App() {
  const [page, setPage]                 = useState("events");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [token, setToken]               = useState(localStorage.getItem("token") || null);
  const [user, setUser]                 = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [toast, setToast]               = useState(null);

  const navigate = (p, extra = {}) => {
    setPage(p);
    if (extra.eventId !== undefined) setSelectedEventId(extra.eventId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify({ username: data.username, is_admin: data.is_admin }));
    setToken(data.access_token);
    setUser({ username: data.username, is_admin: data.is_admin });
    setPage("events");
    showToast("Welcome back, " + data.username + "!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setPage("events");
    showToast("Logged out successfully", "info");
  };

  return (
    <div className="app">
      <Navbar user={user} navigate={navigate} onLogout={handleLogout} currentPage={page} />
      <main className="main-content">
        {page === "events"   && <EventList navigate={navigate} token={token} showToast={showToast} />}
        {page === "event"    && <EventDetail eventId={selectedEventId} navigate={navigate} token={token} showToast={showToast} />}
        {page === "bookings" && <MyBookings token={token} navigate={navigate} showToast={showToast} />}
        {page === "login"    && <LoginPage onLogin={handleLogin} navigate={navigate} />}
        {page === "admin"    && user?.is_admin && <AdminPanel token={token} navigate={navigate} showToast={showToast} />}
      </main>

      {toast && (
        <div className={"toast toast-" + toast.type}>
          <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "i"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
