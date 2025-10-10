"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import ResultsList from "../components/ResultsList";

export default function HomePage() {
  const [data, setData] = useState<GeoJSON.FeatureCollection>({ type: "FeatureCollection", features: [] });
  const [suggested, setSuggested] = useState<string>("");
  const [label, setLabel] = useState<string>("");

  const dayNameGR = (d: Date) =>
    new Intl.DateTimeFormat("el-GR", { weekday: "long" })
      .format(d)
      .replace(/^./, (c) => c.toUpperCase());
      
  const runSearch = async ({
    lat,
    lng,
    radius,
    mode,
  }: {
    lat: number;
    lng: number;
    radius: number;
    mode: "night" | "long";
  }) => {
    const res = await fetch(`/api/search?lat=${lat}&lng=${lng}&radius=${radius}&mode=${mode}`);
    const json = await res.json();
    setData(json.geojson);
    setSuggested(json.suggestedWindow);

    // τίτλος πάνω από τον χάρτη — πάντα "σήμερα {Μέρα}"
    const today = new Date();
    setLabel(`σήμερα ${dayNameGR(today)}`);

  };

  useEffect(() => {
    runSearch({ lat: 37.979, lng: 23.7265, radius: 2000, mode: "night" });
  }, []);

  return (
    <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,550px)_1fr] min-h-screen">
      {/* Left panel */}
      <div className="p-6 bg-gradient-to-br from-[#0b1320] via-[#0e1b12] to-[#12311f]">
        <div className="w-full h-full">
          <Sidebar onSearch={runSearch} />
        </div>
      </div>

      {/* Right panel */}
      <div className="p-6 bg-neutral-900">
        <div className="space-y-6 max-w-[2000px] mx-auto h-full">
          {/* Τίτλος */}
          <h2 className="text-xl font-semibold text-white/90">
            Προτεινόμενοι Οδοί για <span className="text-emerald-400">{label}</span>
          </h2>

          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg h-[460px]">
            <Map geojson={data} />
          </div>

          {suggested && (
            <div className="text-sm text-white/70">
              Προτεινόμενη ώρα: <span className="text-emerald-400 font-medium">{suggested}</span>
            </div>
          )}

          <ResultsList features={data.features} />
        </div>
      </div>
    </main>
  );
}
