import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

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
    <>
      <Navbar />

      <div className="container">
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
        <Link to="/saved">❤️ My Saved Trips</Link>
      </div>
    </>
  );
}
