import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { indianPlaces } from "../data/places";
import { trainHubs } from "../data/trainHubs";

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
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function getNearestHub(lat, lon) {
    let min = Infinity;
    let nearest = trainHubs[0];

    trainHubs.forEach((hub) => {
      const d = distanceKm(lat, lon, hub.lat, hub.lon);
      if (d < min) {
        min = d;
        nearest = hub;
      }
    });

    return nearest.name;
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const cityAliases = {
        mysore: "mysuru",
        mysuru: "mysuru",
        bangalore: "bengaluru",
        bengaluru: "bengaluru",
        hubli: "hubballi",
        belgaum: "belagavi",
        hampi: "hampi",
        ooty: "ooty",
      };

      const searchCity = cityAliases[from.toLowerCase()] || from.toLowerCase();

      // 1️⃣ Get source city
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
      let city = data.data?.[0];

      // fallback to local DB
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

      const filteredPlaces = indianPlaces.filter(
        (p) => p.name.toLowerCase() !== searchCity
      );

      const enriched = await Promise.all(
        filteredPlaces.map(async (p) => {
          const km = distanceKm(srcLat, srcLon, p.lat, p.lon);
          const cost = Math.round(km * 2 + 600);
          const destHub = getNearestHub(p.lat, p.lon);

          const route =
            srcHub === destHub
              ? `${from} → ${p.name}`
              : `${from} → ${srcHub} → ${destHub} → ${p.name}`;

          // Wikipedia image
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

      const affordable = enriched
        .filter((p) => p.cost <= Number(budget))
        .filter((p) => filter === "all" || p.type === filter)
        .sort((a, b) => a.cost - b.cost);

      setResults(affordable);
      setLoading(false);
    };

    run();
  }, [from, budget, filter]);

  const saveTrip = (place) => {
    const saved = JSON.parse(localStorage.getItem("savedTrips")) || [];
    if (!saved.find((p) => p.name === place.name)) {
      saved.push(place);
      localStorage.setItem("savedTrips", JSON.stringify(saved));
      alert("Destination saved ❤️");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <Link to="/">⬅ Back</Link>
        <br /><br />

        <h2>Destinations you can reach from {from}</h2>

        <div className="filters">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("hill")}>🏔 Hill</button>
          <button onClick={() => setFilter("beach")}>🏖 Beach</button>
          <button onClick={() => setFilter("temple")}>🛕 Temple</button>
          <button onClick={() => setFilter("wildlife")}>🦁 Wildlife</button>
          <button onClick={() => setFilter("heritage")}>🏛 Heritage</button>
        </div>

        {loading && <p>Finding destinations…</p>}

        {!loading && results.length === 0 && (
          <p>No destinations within your budget 😔</p>
        )}

        {results.map((p, i) => (
          <div key={i} className="card">
            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "10px",
                }}
              />
            )}
            <h3>{p.name}</h3>
            <p>🏷 {p.type}</p>
            <p>📍 {p.distance} km away</p>
            <p>💰 Estimated cost: ₹{p.cost}</p>
            <p>🚆 {p.route}</p>
            <button onClick={() => saveTrip(p)}>❤️ Save</button>
          </div>
        ))}
      </div>
    </>
  );
}
