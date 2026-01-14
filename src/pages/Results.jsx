import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { indianPlaces } from "../data/places";
import { trainHubs } from "../data/trainHubs";

export default function Results() {
  const { state } = useLocation();
  if (!state) return <div>No search data</div>;

  const { from, budget } = state;
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
    trainHubs.forEach(h => {
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

      const cityAliases = {
        mysore: "mysuru",
        bengaluru: "bengaluru",
        bangalore: "bengaluru",
        ooty: "ooty"
      };

      const searchCity = cityAliases[from.toLowerCase()] || from.toLowerCase();

      let city;
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

      if (!city) {
        const local = indianPlaces.find(p => p.name.toLowerCase() === searchCity);
        if (!local) return setLoading(false);
        city = { latitude: local.lat, longitude: local.lon };
      }

      const srcLat = city.latitude;
      const srcLon = city.longitude;
      const srcHub = getNearestHub(srcLat, srcLon);

      const enriched = await Promise.all(
        indianPlaces.map(async p => {
          if (p.name.toLowerCase() === searchCity) return null;

          const km = distanceKm(srcLat, srcLon, p.lat, p.lon);
          const cost = Math.round(km * 2 + 600);
          const destHub = getNearestHub(p.lat, p.lon);

          const route =
            srcHub === destHub
              ? `${from} → ${p.name}`
              : `${from} → ${srcHub} → ${destHub} → ${p.name}`;

          let image = "";
          try {
            const wiki = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                p.name
              )}`
            ).then(r => r.json());
            image = wiki?.thumbnail?.source || "";
          } catch {}

          return { ...p, distance: Math.round(km), cost, route, image };
        })
      );

      const final = enriched
        .filter(Boolean)
        .filter(p => p.cost <= budget)
        .filter(p => filter === "all" || p.type === filter)
        .sort((a, b) => a.cost - b.cost);

      if (final.length > 0) {
  final[0].featured = true; // cheapest (already sorted by cost)
}

setResults(final);

      setLoading(false);
    }

    run();
  }, [from, budget, filter]);

  const saveTrip = p => {
    const saved = JSON.parse(localStorage.getItem("savedTrips")) || [];
    if (!saved.find(x => x.name === p.name)) {
      saved.push(p);
      localStorage.setItem("savedTrips", JSON.stringify(saved));
      alert("Saved ❤️");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <Link to="/">⬅ </Link>
        <h2>Destinations you can reach from {from}</h2>

        <div className="filters">
          {["all", "hill", "beach", "temple", "wildlife", "heritage"].map(f => (
            <button key={f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {loading && <p>Finding destinations…</p>}
      

{!loading && results.length === 0 && (
  <div className="no-results">
    <h3>No trips available 😔</h3>
    <p>
      We couldn’t find any destinations from <strong>{from}</strong> within a
      budget of <strong>₹{budget}</strong>.
    </p>
    <p>Try increasing your budget or changing the filter.</p>
  </div>
)}



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

        
      </div>
    </>
  );
}
