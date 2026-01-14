import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar">
      <h2>🚆 TripNest</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/saved">SavedTrips</Link>
      </div>
    </div>
  );
}
