"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  onSearch: (p: { lat: number; lng: number; radius: number; mode: "night" | "long" }) => void;
};

export default function Sidebar({ onSearch }: Props) {
  const [mode, setMode] = useState<"night" | "long">("night");
  const [scope, setScope] = useState<"all" | "addr">("all");

  const [addr, setAddr] = useState("");
  const [suggests, setSuggests] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [lat, setLat] = useState(37.979);
  const [lng, setLng] = useState(23.7265);

  // ---- Radius slider ----
  const MAX_ALL = 5000;
  const MAX_ADDR = 1500;
  const [radius, setRadius] = useState<number>(1500);
  const effectiveRadius = scope === "addr" ? Math.min(radius, MAX_ADDR) : Math.min(radius, MAX_ALL);

  // === Ημέρα (ISO 1..7) ===
  const isoToday = () => ((new Date().getDay() + 6) % 7) + 1;
  const WEEKDAYS = [
    { label: "Δευτέρα", value: 1 }, { label: "Τρίτη", value: 2 }, { label: "Τετάρτη", value: 3 },
    { label: "Πέμπτη", value: 4 }, { label: "Παρασκευή", value: 5 }, { label: "Σάββατο", value: 6 }, { label: "Κυριακή", value: 7 },
  ];
  const [weekdayIso, setWeekdayIso] = useState<number>(() => {
    if (typeof window === "undefined") return isoToday();
    const saved = window.localStorage.getItem("weekday");
    const n = saved ? Number(saved) : NaN;
    return Number.isFinite(n) && n >= 1 && n <= 7 ? n : isoToday();
  });
  useEffect(() => {
    try { window.localStorage.setItem("weekday", String(weekdayIso)); } catch { }
  }, [weekdayIso]);

  // === Geocoding dropdown (debounce) ===
  const tRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (scope !== "addr") return;
    if (tRef.current) clearTimeout(tRef.current);
    if (addr.trim().length < 3) { setSuggests([]); return; }
    tRef.current = setTimeout(async () => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`);
      const json = await res.json();
      setSuggests(json.results || []);
    }, 300);
  }, [addr, scope]);

  // === Events προς page ===
  const emitSearchRequest = (p: { lat: number; lng: number; radius: number; mode: "night" | "long" }) => {
    try { window.dispatchEvent(new CustomEvent("search-request", { detail: p })); } catch { }
  };

  // === Helper για αναζήτηση διεύθυνσης ===
  const resolveAddressAndSearch = async () => {
    let useLat = lat, useLng = lng;
    if (suggests.length > 0) {
      useLat = suggests[0].lat; useLng = suggests[0].lng;
    } else if (addr.trim().length >= 3) {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`);
        const json = await res.json();
        if (json.results?.length > 0) {
          useLat = json.results[0].lat; useLng = json.results[0].lng;
        }
      } catch { }
    }
    setLat(useLat); setLng(useLng); setSuggests([]);
    const payload = { lat: useLat, lng: useLng, radius: Math.min(effectiveRadius, MAX_ADDR), mode };
    onSearch(payload); emitSearchRequest(payload);
  };

  // === Αλλαγές ===
  const handleMode = (m: "night" | "long") => {
    setMode(m);
    if (scope === "addr") resolveAddressAndSearch();
    else { const p = { lat, lng, radius: effectiveRadius, mode: m }; onSearch(p); emitSearchRequest(p); }
  };
  const handleWeekdayChange = (n: number) => {
    setWeekdayIso(n);
    try { window.localStorage.setItem("weekday", String(n)); } catch { }
    if (scope === "addr") resolveAddressAndSearch();
    else { const p = { lat, lng, radius: effectiveRadius, mode }; onSearch(p); emitSearchRequest(p); }
    try { window.dispatchEvent(new CustomEvent("weekday-changed", { detail: { weekday: n } })); } catch { }
  };
  const switchScope = (s: "all" | "addr") => {
    setScope(s);
    if (s === "addr") setRadius(r => Math.min(r, MAX_ADDR));
  };

  // --- helpers για χρώμα που σκουραίνει όσο αυξάνει η τιμή ---
  const hexToRgb = (hex: string) => {
    const m = hex.replace("#", "");
    const full = m.length === 3 ? m.split("").map(c => c + c).join("") : m;
    const v = parseInt(full, 16);
    return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
  };
  const rgbToHex = (r: number, g: number, b: number) =>
    "#" + [r, g, b].map(n => n.toString(16).padStart(2, "0")).join("");
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
  const lerpColor = (from: string, to: string, t: number) => {
    const A = hexToRgb(from), B = hexToRgb(to);
    return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t));
  };

  // slider UI vars
  const sliderMax = scope === "addr" ? MAX_ADDR : MAX_ALL;
  const sliderFill = `${(effectiveRadius / sliderMax) * 100}%`;
  const leftColor = lerpColor("#34d399", "#065f46", Math.min(1, Math.max(0, effectiveRadius / sliderMax)));

  return (
    <aside className="h-full p-5 text-white">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <img src="/ezparkTitle.svg" alt="ezpark.gr" className="h-26 w-auto" />
          </div>

          {/* Mode segmented */}
          <div className="relative rounded-full bg-white/10 p-2 mt-[clamp(1.5rem,6vh,5rem)] overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-y-2 left-2 rounded-full transition-transform duration-300"
              style={{
                width: "calc(50% - 0.5rem)",
                backgroundColor: "#458841",
                transform: mode === "night" ? "translateX(0%)" : "translateX(100%)",
              }}
            />
            <div className="relative grid grid-cols-2">
              <button onClick={() => handleMode("night")} className="z-10 px-4 py-3 text-sm font-medium text-white">
                Βραδινή Έξοδος
              </button>
              <button onClick={() => handleMode("long")} className="z-10 px-4 py-3 text-sm font-medium text-white">
                Μόνιμη Στάθμευση
              </button>
            </div>
          </div>

          {/* Scope segmented */}
          <div className="relative rounded-full bg-white/10 p-2 overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-y-2 left-2 rounded-full transition-transform duration-300"
              style={{
                width: "calc(50% - 0.5rem)",
                backgroundColor: "#415A88",
                transform: scope === "all" ? "translateX(0%)" : "translateX(100%)",
              }}
            />
            <div className="relative grid grid-cols-2">
              <button onClick={() => switchScope("all")} className="z-10 px-4 py-3 text-sm font-medium text-white">
                Όλα
              </button>
              <button onClick={() => switchScope("addr")} className="z-10 px-4 py-3 text-sm font-medium text-white">
                Συγκεκριμένη Διεύθυνση
              </button>
            </div>
          </div>

          {/* Ημέρα */}
          <div className="space-y-1">
            <Label className="text-white/80">Ημέρα</Label>
            <select
              className="native-select-dark w-full"
              value={weekdayIso}
              onChange={(e) => handleWeekdayChange(Number(e.target.value))}
              aria-label="Επιλογή ημέρας"
            >
              {WEEKDAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          {/* Ακτίνα αναζήτησης */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-white/80">Ακτίνα αναζήτησης:</Label>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-emerald-300 text-xs">
                {effectiveRadius} m
              </span>
            </div>

            <input
              type="range"
              min={200}
              max={sliderMax}
              step={50}
              value={effectiveRadius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="range"
              style={{ ["--fill" as any]: sliderFill, ["--left" as any]: leftColor }}
              aria-label="Ακτίνα (μέτρα)"
            />

            <p className="text-xs text-white/60">
              {scope === "addr"
                ? "Για συγκεκριμένη διεύθυνση το μέγιστο είναι 1500 m."
                : "Για όλα τα σημεία μπορείς μέχρι 5000 m."}
            </p>
          </div>

          {/* Διεύθυνση */}
          {scope === "addr" && (
            <div className="space-y-1 relative">
              <Label className="text-white/80">Διεύθυνση</Label>
              <Input
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); resolveAddressAndSearch(); } }}
                placeholder="π.χ. Φιλολάου 100, Αθήνα"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
              />

              {suggests.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-[16px] border border-white/10 bg-black/20 backdrop-blur p-1 max-h-64 overflow-auto">
                  {suggests.map((s, i) => (
                    <button
                      key={i}
                      className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/10"
                      onClick={() => {
                        setAddr(s.label);
                        setSuggests([]);
                        setLat(s.lat);
                        setLng(s.lng);
                        const payload = { lat: s.lat, lng: s.lng, radius: Math.min(effectiveRadius, MAX_ADDR), mode };
                        onSearch(payload);
                        emitSearchRequest(payload);
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-white/60">* Πάτα Enter για αναζήτηση κοντά (≤1500 m) χωρίς να διαλέξεις πρόταση.</p>
            </div>
          )}

          {/* Κουμπί Αναζήτησης */}
          <div className="mt-3">
            <Button
              className="w-full rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 mt-4"
              onClick={() => {
                if (scope === "addr") {
                  resolveAddressAndSearch();
                } else {
                  const payload = { lat, lng, radius: effectiveRadius, mode };
                  onSearch(payload);
                  emitSearchRequest(payload);
                }
              }}
            >
              Αναζήτηση
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
