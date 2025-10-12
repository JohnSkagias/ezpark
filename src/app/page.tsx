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

  type SearchParams = { lat: number; lng: number; radius: number; mode: "night" | "long" };
  const [lastParams, setLastParams] = useState<SearchParams>({
    lat: 37.979, lng: 23.7265, radius: 2000, mode: "night",
  });

  const getStoredWeekday = () => {
    try {
      const v = window.localStorage.getItem("weekday");
      const n = v ? Number(v) : NaN;
      return Number.isFinite(n) && n >= 1 && n <= 7 ? n : undefined;
    } catch { return undefined; }
  };
  const WEEKDAYS = [
    { label: "Δευτέρα", value: 1 }, { label: "Τρίτη", value: 2 }, { label: "Τετάρτη", value: 3 },
    { label: "Πέμπτη", value: 4 }, { label: "Παρασκευή", value: 5 }, { label: "Σάββατο", value: 6 }, { label: "Κυριακή", value: 7 },
  ];
  const dayLabelFromIso = (iso?: number) =>
    (iso ? (WEEKDAYS.find(d => d.value === iso)?.label ?? "") : `σήμερα ${dayNameGR(new Date())}`);

  // --- αναζήτηση με weekday ---
  const runSearchWithWeekday = async (p: SearchParams) => {
    const weekday = getStoredWeekday();
    const params = new URLSearchParams({
      lat: String(p.lat),
      lng: String(p.lng),
      radius: String(p.radius),
      mode: p.mode,
      ...(weekday ? { weekday: String(weekday) } : {}),
    });
    const res = await fetch(`/api/search?${params.toString()}`);
    const json = await res.json();
    setData(json.geojson);
    setSuggested(json.suggestedWindow);
    setLabel(dayLabelFromIso(weekday));
    setLastParams(p);
  };

  // αρχικό load
  useEffect(() => {
    runSearchWithWeekday({ lat: 37.979, lng: 23.7265, radius: 2000, mode: "night" });
  }, []);

  // όταν αλλάζει η μέρα στο Sidebar
  useEffect(() => {
    const handler = () => runSearchWithWeekday(lastParams);
    window.addEventListener("weekday-changed" as any, handler);
    return () => window.removeEventListener("weekday-changed" as any, handler);
  }, [lastParams]);

  // όταν το Sidebar ζητάει νέα αναζήτηση (π.χ. Enter στη διεύθυνση)
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<SearchParams>;
      if (ev.detail) runSearchWithWeekday(ev.detail);
    };
    window.addEventListener("search-request" as any, handler);
    return () => window.removeEventListener("search-request" as any, handler);
  }, []);

  return (
    <main className="grid grid-cols-1 lg:grid-cols-[33vw_1fr] min-h-screen gap-6 lg:gap-10 p-4 lg:p-8">
      <div className="relative">
        <div className="sticky top-6 self-start">
          <div
            className="
              rounded-[46px]
              border border-white/30
              overflow-hidden
              p-10 lg:p-12
              min-h-[calc(98vh-3rem)]
              bg-no-repeat bg-cover bg-center
            "
            style={{ backgroundImage: "url('/sidebarBackground.svg')" }}
          >
            <Sidebar onSearch={runSearchWithWeekday} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="space-y-5">
        <h2 className="text-xl font-semibold text-white/90">
          Προτεινόμενοι Οδοί για <span className="text-emerald-400">{label}</span>
        </h2>

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

        <ResultsList features={data.features} />
      </div>
    </main>
  );
}
