import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Saved() {
  const saved = JSON.parse(localStorage.getItem("savedTrips")) || [];

  return (
    <>
      <Navbar />

      <div className="container">
        <Link to="/">⬅ </Link>
       

        <h2>❤️ Saved Trips</h2>

        {saved.length === 0 && (
          <div className="no-results">
            <h3>No saved trips yet</h3>
            <p>Save destinations to see them here.</p>
          </div>
        )}

        {saved.length > 0 && (
          <div className="cards-grid">
            {saved.map((p, i) => (
              <div key={i} className="card">
                {p.image && <img src={p.image} alt={p.name} />}

                <div className="card-body">
                  <span className="tag">{p.type}</span>
                  <h3>{p.name}</h3>
                  <p>📍 {p.distance} km away</p>
                  <p>💰 ₹{p.cost}</p>
                  <p>🚆 {p.route}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
