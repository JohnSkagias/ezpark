"use client";
import { useEffect, useState } from "react";
import Map from "../components/Map"; // προσαρμόσε το path αν χρειάζεται

export default function HomePage() {
  const [data, setData] = useState<GeoJSON.FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });

  useEffect(() => {
    const run = async () => {
      const url = `/api/search?lat=37.9790&lng=23.7265&radius=2000`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json.geojson);
    };
    run();
  }, []);

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">ezpark — demo</h1>
      <Map geojson={data} />
    </main>
  );
}
