import { Link } from "react-router-dom";

export default function Saved() {
  const saved = JSON.parse(localStorage.getItem("savedTrips")) || [];

  return (
    <div className="container">
      <Link to="/">⬅ Back</Link>
      <br /><br />

      <h2>❤️ Saved Trips</h2>

      {saved.length === 0 && <p>No saved trips yet</p>}

      {saved.map((d, i) => (
        <div key={i} className="card">
          <h3>{d.name}</h3>
          <p>🚆 {d.train}</p>
          <p>💰 ₹{d.budget}</p>
          <p>{d.reason}</p>
        </div>
      ))}
    </div>
  );
}
