export function Navbar({ user, navigate, onLogout, currentPage }) {
  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate("events")}>
        <span className="nav-logo-icon">🎟</span>
        Eventify
      </div>
      <div className="nav-links">
        <button className={"nav-btn" + (currentPage === "events" ? " active" : "")} onClick={() => navigate("events")}>Events</button>
        {user && (
          <button className={"nav-btn" + (currentPage === "bookings" ? " active" : "")} onClick={() => navigate("bookings")}>My Tickets</button>
        )}
        {user?.is_admin && (
          <button className={"nav-btn" + (currentPage === "admin" ? " active" : "")} onClick={() => navigate("admin")}>Admin</button>
        )}
        <div className="nav-divider" />
        {user ? (
          <>
            <span className="nav-user">👤 {user.username}</span>
            <button className="nav-btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button className="nav-cta" onClick={() => navigate("login")}>Sign In</button>
        )}
      </div>
    </nav>
  );
}
