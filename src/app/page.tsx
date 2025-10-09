"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import ResultsList from "../components/ResultsList";

export default function HomePage() {
  const [data, setData] = useState<GeoJSON.FeatureCollection>({ type: "FeatureCollection", features: [] });

  const runSearch = async ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) => {
    const res = await fetch(`/api/search?lat=${lat}&lng=${lng}&radius=${radius}`);
    const json = await res.json();
    setData(json.geojson);
  };

  useEffect(() => { runSearch({ lat: 37.979, lng: 23.7265, radius: 2000 }); }, []);

  return (
  <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,550px)_1fr] min-h-screen">
      {/* Left panel (full height) */}
  <div className="p-6 bg-gradient-to-br from-[#0b1320] via-[#0e1b12] to-[#12311f]">
        <div className="w-full h-full">
          <Sidebar onSearch={runSearch} />
        </div>  
      </div>

      {/* Right panel (full height) */}
  <div className="p-6 bg-neutral-900">
        <div className="space-y-6 max-w-[1100px] mx-auto h-full">
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg h-[460px]">
            <Map geojson={data} />
          </div>
          <ResultsList features={data.features} />
        </div>
      </div>
    </main>
  );
}