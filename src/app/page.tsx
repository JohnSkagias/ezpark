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

  const [activeWeekday, setActiveWeekday] = useState<number | undefined>(undefined);
  const dayNames = ["", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];

  const runSearch = async ({
    lat, lng, radius, mode, weekday,
  }: { lat: number; lng: number; radius: number; mode: "night" | "long"; weekday?: number }) => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius), mode });
    if (typeof weekday === "number" && weekday >= 1 && weekday <= 7) params.set("weekday", String(weekday));

    const res = await fetch(`/api/search?${params.toString()}`, { cache: "no-store" });
    const json = await res.json();
    setData(json.geojson);
    setSuggested(json.suggestedWindow);
    setActiveWeekday(weekday); // <- κρατάμε την επιλογή για τον τίτλο
    if (!weekday) setLabel(`σήμερα ${dayNameGR(new Date())}`);
  };


  useEffect(() => { runSearch({ lat: 37.979, lng: 23.7265, radius: 10000, mode: "night" }); }, []);

  return (
    <main className="grid grid-cols-1 lg:grid-cols-[33vw_1fr] min-h-screen gap-6 lg:gap-10 p-4 lg:p-8">
      {/* Floating Sidebar (sticky, full height, 60px radius) */}
      <div className="relative">
        {/* sticky μόνο σε desktop */}
        <div className="lg:sticky lg:top-6">
          <div
            className="
        rounded-3xl lg:rounded-[46px]
        border border-white/30
        overflow-hidden
        p-6 lg:p-12
        h-auto lg:min-h-[calc(98vh-3rem)]   /* mobile: auto, desktop: σχεδόν full height */
        bg-no-repeat bg-cover bg-center
      "
            style={{ backgroundImage: "url('/sidebarBackground.svg')" }}
          >
            <Sidebar onSearch={runSearch} />
          </div>
        </div>
      </div>



      {/* Right panel */}
      <div className="space-y-5">
        <h2 className="text-xl font-semibold text-white/90">
          Προτεινόμενοι Οδοί για{" "}
          <span className="text-emerald-400">
            {activeWeekday ? dayNames[activeWeekday] : `σήμερα ${dayNameGR(new Date())}`}
          </span>
        </h2>

        {/* Map card */}
        <div className="rounded-[28px] border border-white/30 overflow-hidden shadow-xl" style={{ padding: 0 }}>
          <div className="h-[520px]">
            <Map geojson={data} />
          </div>
        </div>

        {suggested && (
          <div className="text-sm text-white/70">
            Προτεινόμενη ώρα: <span className="text-emerald-400 font-medium">{suggested}</span>
          </div>
        )}


        <h3 className="text-lg font-semibold text-white/90">
          Αποτελέσματα ({data.features.length})
        </h3>
        {/* Full-width list (ίδιο πλάτος με τον χάρτη) */}
        <ResultsList features={data.features} />
      </div>
    </main>
  );
}
