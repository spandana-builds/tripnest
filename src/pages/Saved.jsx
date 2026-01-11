export default function Saved() {
  const saved = JSON.parse(localStorage.getItem("savedTrips")) || [];

  return (
    <div style={{ padding: 40 }}>
      <h2>❤️ Saved Trips</h2>

      {saved.length === 0 && <p>No saved trips yet</p>}

      {saved.map((d, i) => (
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
          <p>{d.reason}</p>
        </div>
      ))}
    </div>
  );
}
