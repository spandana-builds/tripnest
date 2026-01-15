import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { indianPlaces } from "../data/places";
import { trainHubs } from "../data/trainHubs";

/* ✅ City normalizer (single source of truth) */
function normalizeCity(input) {
  const city = input.trim().toLowerCase();

  const aliases = {
    hubli: "hubballi",
    hubbli: "hubballi",
    huballi: "hubballi",
    hubballi: "hubballi",

    mysore: "mysuru",
    mysuru: "mysuru",

    bangalore: "bengaluru",
    bengaluru: "bengaluru",
    banglore: "bengaluru",

    belgaum: "belagavi",
    belagavi: "belagavi",

    ooty: "ooty",
    udhagamandalam: "ooty",

    mangalore: "mangaluru",
    mangaluru: "mangaluru",
  };

  return aliases[city] || city;
}

export default function Results() {
  const { state } = useLocation();
  if (!state) return <div>No search data</div>;

  const { from, budget } = state;

  const searchCity = normalizeCity(from);
  const displayCity =
    searchCity.charAt(0).toUpperCase() + searchCity.slice(1);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const API_KEY = import.meta.env.VITE_RAPID_KEY;

  function distanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function getNearestHub(lat, lon) {
    let nearest = trainHubs[0];
    let min = Infinity;

    trainHubs.forEach((h) => {
      const d = distanceKm(lat, lon, h.lat, h.lon);
      if (d < min) {
        min = d;
        nearest = h;
      }
    });

    return nearest.name;
  }

  useEffect(() => {
    async function run() {
      setLoading(true);

      let city;

      /* 🔹 Try GeoDB first */
      try {
        const res = await fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${searchCity}&countryIds=IN&limit=1`,
          {
            headers: {
              "X-RapidAPI-Key": API_KEY,
              "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
            },
          }
        );
        const data = await res.json();
        city = data.data?.[0];
      } catch {}

      /* 🔹 Fallback to local DB */
      if (!city) {
        const local = indianPlaces.find(
          (p) => p.name.toLowerCase() === searchCity
        );
        if (!local) {
          setResults([]);
          setLoading(false);
          return;
        }
        city = { latitude: local.lat, longitude: local.lon };
      }

      const srcLat = city.latitude;
      const srcLon = city.longitude;
      const srcHub = getNearestHub(srcLat, srcLon);

      const enriched = await Promise.all(
        indianPlaces.map(async (p) => {
          if (p.name.toLowerCase() === searchCity) return null;

          const km = distanceKm(srcLat, srcLon, p.lat, p.lon);
          const cost = Math.round(km * 2 + 600);
          const destHub = getNearestHub(p.lat, p.lon);


          const route =
            srcHub === destHub
              ? `${displayCity} → ${p.name}`
              : srcHub === displayCity
              ? `${displayCity} → ${destHub} → ${p.name}`
              : `${displayCity} → ${srcHub} → ${destHub} → ${p.name}`;


          let image = "";
          try {
            const wiki = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                p.name
              )}`
            ).then((r) => r.json());
            image = wiki?.thumbnail?.source || "";
          } catch {}

          return {
            ...p,
            distance: Math.round(km),
            cost,
            route,
            image,
          };
        })
      );

      const final = enriched
  .filter(Boolean)
  .filter(p => p.cost <= Number(budget))
  .filter(p => filter === "all" || p.type === filter)
  .sort((a, b) => a.cost - b.cost) // cheapest first
  .sort((a, b) => {
    if (a.image && !b.image) return -1; // image cards first
    if (!a.image && b.image) return 1;  // no-image cards last
    return 0;
  });
  setResults(final);
setLoading(false);


    }

    run();
  }, [from, budget, filter]);

  const saveTrip = (p) => {
    const saved = JSON.parse(localStorage.getItem("savedTrips")) || [];
    if (!saved.find((x) => x.name === p.name)) {
      saved.push(p);
      localStorage.setItem("savedTrips", JSON.stringify(saved));
      alert("Saved ❤️");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <Link to="/">⬅ Back</Link>

        <h2>Destinations you can reach from {displayCity}</h2>

        <div className="filters">
          {["all", "hill", "beach", "temple", "wildlife", "heritage"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {loading && <p>Finding destinations…</p>}

       
        <div className="cards-grid">
          {results.map((p, i) => (
            <div key={i} className="card">
              {p.image && <img src={p.image} alt={p.name} />}

              <div className="card-body">
                <span className="tag">{p.type}</span>
                <h3>{p.name}</h3>
                <p>📍 {p.distance} km away</p>
                <p>💰 ₹{p.cost}</p>
                <p>🚆 {p.route}</p>
                <button onClick={() => saveTrip(p)}>❤️ Save</button>
              </div>
            </div>
          ))}
        </div>
         {!loading && results.length === 0 && (
          <div className="no-results">
            <h3>No trips available 😔</h3>
            <p>
              We couldn’t find any destinations from{" "}
              <strong>{displayCity}</strong> within a budget of{" "}
              <strong>₹{budget}</strong>.
            </p>
            <p>Try increasing your budget or changing the filter.</p>
          </div>
        )}

      </div>
    </>
  );
}
