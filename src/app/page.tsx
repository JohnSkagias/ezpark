"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import ResultsList from "../components/ResultsList";
import MapBorderSweep from "@/components/ui/MapBorderSweep";

export default function HomePage() {
  const [data, setData] = useState<GeoJSON.FeatureCollection>({ type: "FeatureCollection", features: [] });
  const [suggested, setSuggested] = useState<string>("");
  const [activeWeekday, setActiveWeekday] = useState<number | undefined>(undefined);
  const dayNameGR = (d: Date) => new Intl.DateTimeFormat("el-GR", { weekday: "long" }).format(d).replace(/^./, (c) => c.toUpperCase());
  const dayNames = ["", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];

  const runSearch = async (
    { lat, lng, radius, mode, weekday }: {
      lat: number; lng: number; radius: number; mode: "night" | "long"; weekday?: number;
    },
    opts?: { pulseMap?: boolean }   // ⬅️ ΝΕΟ
  ) => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius), mode });
    if (typeof weekday === "number") params.set("weekday", String(weekday));
    const res = await fetch(`/api/search?${params.toString()}`, { cache: "no-store" });
    const json = await res.json();
    setData(json.geojson);
    setSuggested(json.suggestedWindow);
    setActiveWeekday(weekday);

    if (opts?.pulseMap ?? true) triggerMapWave();
  };

  const runSearchNoPulse = (p: { lat: number; lng: number; radius: number; mode: "night" | "long"; weekday?: number }) =>
    runSearch(p, { pulseMap: false });


  // state για το map border sweep / animation
  const [mapWave, setMapWave] = useState(false);
  const triggerMapWave = () => {
    setMapWave(false);
    requestAnimationFrame(() => setMapWave(true));
  };


  useEffect(() => { runSearch({ lat: 37.979, lng: 23.7265, radius: 10000, mode: "night" }); }, []);


  return (
    <main className="grid grid-cols-1 lg:grid-cols-[33vw_1fr] min-h-screen gap-6 lg:gap-10 p-4 lg:p-8">
      <div className="relative">
        <div className="lg:sticky lg:top-6">
          <div className="rounded-3xl lg:rounded-[46px] border border-white/30 overflow-hidden p-6 lg:p-12 h-auto lg:min-h-[calc(98vh-3rem)] bg-no-repeat bg-cover bg-center" style={{ backgroundImage: "url('/sidebarBackground.svg')" }}>
            <Sidebar onSearch={runSearchNoPulse} onWave={triggerMapWave} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-xl font-semibold text-white/90">
          Προτεινόμενοι Οδοί για{" "}
          <span className="text-emerald-400">{activeWeekday ? dayNames[activeWeekday] : `σήμερα ${dayNameGR(new Date())}`}</span>
        </h2>

        <div className="relative rounded-[28px] border border-white/30 overflow-hidden shadow-xl">
          <div className="h-[520px]">
            <Map geojson={data} />
          </div>
          {/* λεπτό, διακριτικό sweep πάνω στο border */}
          <MapBorderSweep trigger={mapWave} radius={28} thickness={2} duration={0.65} fadeOutAfter={0.5} />
        </div>

        {suggested && (
          <div className="text-sm text-white/70">
            Προτεινόμενη ώρα: <span className="text-emerald-400 font-medium">{suggested}</span>
          </div>
        )}

        <h3 className="text-lg font-semibold text-white/90">Αποτελέσματα ({data.features.length})</h3>
        <ResultsList features={data.features} />
      </div>
    </main>
  );
}
