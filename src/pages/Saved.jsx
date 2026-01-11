import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Saved() {
  const saved = JSON.parse(localStorage.getItem("savedTrips")) || [];

  return (
    <>
      <Navbar />

      <div className="container">
        <Link to="/">⬅ Back</Link>
        <br /><br />

        <h2>❤️ Saved Trips</h2>

        {saved.length === 0 && <p>No saved trips yet</p>}

        {saved.map((p, i) => (
          <div key={i} className="card">
            
            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  marginBottom: "12px"
                }}
              />
            )}

            <h3>{p.name}</h3>

            <p>🏷 {p.type}</p>
            <p>📍 {p.distance} km away</p>
            <p>💰 Estimated cost: ₹{p.cost}</p>
            <p>🚆 {p.route}</p>

          </div>
        ))}
      </div>
    </>
  );
}
