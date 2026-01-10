import { useLocation, Link } from "react-router-dom";
import { destinations } from "../data/destinations";

export default function Results() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div style={{ padding: 40 }}>
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

  return (
    <div style={{ padding: 40 }}>
      <h2>Trips from {from}</h2>

      {filtered.length === 0 && <p>No trips found 😔</p>}

      {filtered.map((d, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h3>{d.name}</h3>
          <p>🚆 {d.train}</p>
          <p>💰 ₹{d.budget}</p>
          <p>📝 {d.reason}</p>
        </div>
      ))}
    </div>
  );
}
