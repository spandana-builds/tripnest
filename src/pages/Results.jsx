import { useLocation, Link } from "react-router-dom";
import { destinations } from "../data/destinations";
import Navbar from "../components/Navbar";


export default function Results() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="container">
        <h2>No search data</h2>
        <Link to="/">Go back</Link>
      </div>
    );
  }

  const { from, month, budget } = state;

  const filtered = destinations.filter(d => {
    const cityMatch = d.from.toLowerCase() === from.toLowerCase();
    const monthMatch = d.month.includes(month) || d.month.includes("All");
    const budgetMatch = d.budget <= Number(budget);

    return cityMatch && monthMatch && budgetMatch;
  });

  const saveTrip = (trip) => {
    const saved = JSON.parse(localStorage.getItem("savedTrips")) || [];
    const exists = saved.find(t => t.name === trip.name);

    if (!exists) {
      saved.push(trip);
      localStorage.setItem("savedTrips", JSON.stringify(saved));
      alert("Trip saved ❤️");
    }
  };

  return (
    <> <Navbar />
    <div className="container">
     
      <Link to="/">⬅ Back</Link>
      <br /><br />

      <h2>Trips from {from}</h2>

      {filtered.length === 0 && <p>No trips found 😔</p>}

      {filtered.map((d, i) => (
        <div key={i} className="card">
          <h3>{d.name}</h3>
          <p>🚆 {d.train}</p>
          <p>💰 ₹{d.budget}</p>
          <p>📝 {d.reason}</p>

          <button onClick={() => saveTrip(d)}>❤️ Save</button>
        </div>
      ))}
    </div>
    </>
  );
}
