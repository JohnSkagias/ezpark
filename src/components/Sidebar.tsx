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
  const [suggests, setSuggests] = useState<{ primary: string; secondary?: string; lat: number; lng: number }[]>([]);
  const [lat, setLat] = useState(37.979);
  const [lng, setLng] = useState(23.7265);
  const [radius, setRadius] = useState(20000); // Το radius μεσα στο οποιο θα γινεται η αναζητηση


  // --- debounce για geocoding ---
  const tRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (scope !== "addr") return;
    if (tRef.current) clearTimeout(tRef.current);
    if (addr.trim().length < 3) {
      setSuggests([]);
      return;
    }
    tRef.current = setTimeout(async () => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`);
      const json = await res.json();
      setSuggests(json.results || []);
    }, 300);
  }, [addr, scope]);


  // αλλαγή mode → τρέξε αναζήτηση
  const handleMode = (m: "night" | "long") => {
    setMode(m);
    onSearch({ lat, lng, radius: scope === "addr" ? 1500 : radius, mode: m });
  };

  return (
    <aside className="h-full p-5 text-white">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <img src="/ezparkTitle.svg" alt="ezpark.gr" className="h-26 w-auto" />
          </div>

          {/* Mode segmented */}
          <div className="relative rounded-full bg-white/10 p-2 mt-[clamp(1.5rem,6vh,5rem)] overflow-hidden">
            <div aria-hidden className="absolute inset-y-2 left-2 rounded-full transition-transform duration-300"
              style={{
                width: 'calc(50% - 0.5rem)', backgroundColor: '#458841',
                transform: mode === "night" ? "translateX(0%)" : "translateX(100%)"
              }} />
            <div className="relative grid grid-cols-2">
              <button onClick={() => handleMode("night")} className="z-10 px-4 py-3 text-sm font-medium text-white">Βραδινή Έξοδος</button>
              <button onClick={() => handleMode("long")} className="z-10 px-4 py-3 text-sm font-medium text-white">Μόνιμη Στάθμευση</button>

            </div>
          </div>

          {/* Scope segmented */}
          <div className="relative rounded-full bg-white/10 p-2 overflow-hidden">
            <div aria-hidden className="absolute inset-y-2 left-2 rounded-full transition-transform duration-300"
              style={{
                width: 'calc(50% - 0.5rem)', backgroundColor: '#415A88',
                transform: scope === "all" ? "translateX(0%)" : "translateX(100%)"
              }} />
            <div className="relative grid grid-cols-2">
              <button onClick={() => setScope("all")} className="z-10 px-4 py-3 text-sm font-medium text-white">Όλα</button>
              <button onClick={() => setScope("addr")} className="z-10 px-4 py-3 text-sm font-medium text-white">Συγκεκριμένη Διεύθυνση</button>
            </div>
          </div>

          {scope === "addr" && (
            <div className="space-y-1 relative">
              <Label className="text-white/80">Διεύθυνση</Label>
              <Input
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder="π.χ. Δωδεκανήσου 39 Πειραιάς"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
              />

              {/* Dropdown προτάσεων */}
              {suggests.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-black/40 backdrop-blur p-1 max-h-64 overflow-auto">
                  {suggests.map((s, i) => (
                    <button
                      key={i}
                      className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/10"
                      onClick={() => {
                        const label = s.secondary ? `${s.primary}, ${s.secondary}` : s.primary;
                        setAddr(label);
                        setSuggests([]);
                        setLat(s.lat);
                        setLng(s.lng);
                        onSearch({ lat: s.lat, lng: s.lng, radius: 1500, mode });
                      }}
                    >
                      <div className="font-medium">{s.primary}</div>
                      {s.secondary && <div className="text-xs text-white/60">{s.secondary}</div>}
                    </button>
                  ))}
                </div>
              )}


              <p className="text-xs text-white/60">* γράψε τη διεύθυνση και διάλεξε από τις προτάσεις</p>
            </div>
          )}

          <div className="mt-3">
            {/* --- Κουμπί Αναζήτησης --- */}
            <Button
              className="w-full rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 mt-4"
              onClick={() => onSearch({ lat, lng, radius: scope === "addr" ? 1500 : radius, mode })}
            >
              Αναζήτηση
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
