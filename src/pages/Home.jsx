import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";
import heroImage from "../assets/train_journey.jpg";

export default function Home() {
  const [from, setFrom] = useState("");
  const [budget, setBudget] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const search = () => {
    if (!from || !budget) {
      alert("Please enter both city and budget");
      return;
    }

    navigate("/results", {
      state: { from: from.trim(), budget }
    });
  };

  return (
    <>
      <Navbar />

      <div className="home-hero">
        <div className="home-left">
          <h1>Plan peaceful train trips</h1>
          <p className="subtitle">
            Discover beautiful destinations you can reach by train — within your budget.
          </p>

          <div className="search-box">
            <input
              placeholder="From city (eg. Mysuru, Ooty, Bengaluru)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />

            <input
              placeholder="Budget (₹)"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <button onClick={search}>🚆 Find Trips</button>
          </div>

         
        </div>

        <div className="home-right">
          <img
            src={heroImage}
            alt="Train travel"
            loading="lazy"
          />
        </div>
      </div>
    </>
  );
}
