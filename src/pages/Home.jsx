import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


export default function Home() {
  const [from, setFrom] = useState("");
  const [month, setMonth] = useState("");
  const [budget, setBudget] = useState("");
  const navigate = useNavigate();

  const search = () => {
    navigate("/results", {
      state: { from, month, budget }
    });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>🚆 TripNest</h1>
      <p>Find peaceful, train-friendly trips</p>

      <input placeholder="From city" onChange={e => setFrom(e.target.value)} />
      <br /><br />
      <input placeholder="Month" onChange={e => setMonth(e.target.value)} />
      <br /><br />
      <input placeholder="Budget" onChange={e => setBudget(e.target.value)} />
      <br /><br />

      <button onClick={search}>Find Trips</button>
      <br /><br />
<Link to="/saved">
  <button>❤️ My Saved Trips</button>
</Link>

    </div>
  );
}
