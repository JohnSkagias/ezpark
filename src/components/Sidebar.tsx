"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  onSearch: (p: { lat: number; lng: number; radius: number; mode: "night" | "long"; weekday?: number }) => void;
};

export default function Sidebar({ onSearch }: Props) {
  const [mode, setMode] = useState<"night" | "long">("night");
  const [scope, setScope] = useState<"all" | "addr">("all");

  const [addr, setAddr] = useState("");
  const [suggests, setSuggests] = useState<{ primary: string; secondary?: string; lat: number; lng: number }[]>([]);
  const [lat, setLat] = useState(37.979);
  const [lng, setLng] = useState(23.7265);
  const [radius, setRadius] = useState(20000); // Το radius μεσα στο οποιο θα γινεται η αναζητηση

  // advanced options state
  const [showAdv, setShowAdv] = useState(false);
  const [advDay, setAdvDay] = useState<number | undefined>(undefined); // 1..7 (ISO), undefined = auto (mode)
  const [advRadius, setAdvRadius] = useState<number>(1000); // για scope=addr


  // debounce geocoding (όπως είχες)
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


  const handleMode = (m: "night" | "long") => {
    setMode(m);
    onSearch({ lat, lng, radius: scope === "addr" ? (advRadius || 1500) : radius, mode: m, weekday: advDay });
  };


  const applyAdvanced = () => {
    setShowAdv(false);
    onSearch({
      lat, lng,
      radius: scope === "addr" ? (advRadius || 1000) : radius,
      mode,
      weekday: advDay,
    });
  };


  const days: { label: string; iso: number }[] = [
    { label: "Δευ", iso: 1 }, { label: "Τρι", iso: 2 }, { label: "Τετ", iso: 3 }, { label: "Πεμ", iso: 4 },
    { label: "Παρ", iso: 5 }, { label: "Σαβ", iso: 6 }, { label: "Κυρ", iso: 7 },
  ];


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
                placeholder="π.χ. Πραξιτέλους Πειραιάς"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
              />

              {suggests.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-black/30 backdrop-blur p-1 max-h-64 overflow-auto">
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
                        onSearch({ lat: s.lat, lng: s.lng, radius: advRadius || 1000, mode, weekday: advDay });
                      }}
                    >
                      <div className="font-medium">{s.primary}</div>
                      {s.secondary && <div className="text-xs text-white/60">{s.secondary}</div>}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-white/60">* γράψε διεύθυνση, περιοχή, μαγαζί κτλπ</p>
            </div>
          )}

          {/* Αναζήτηση */}
          <div className="mt-3">
            <Button
              className="w-full rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 mt-4"
              onClick={() =>
                onSearch({
                  lat, lng,
                  radius: scope === "addr" ? (advRadius || 1000) : radius,
                  mode,
                  weekday: advDay,
                })
              }
            >
              Αναζήτηση
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              className="text-left text-white/40 underline underline-offset-4"
              onClick={() => setShowAdv(true)}
            >
              Σύνθετες Επιλογές
            </button>

            {advDay !== undefined && (
              <button
                onClick={() => {
                  setAdvDay(undefined);
                  // (προαιρετικά) επαναφορά radius
                  // setAdvRadius(1000);
                  onSearch({
                    lat, lng,
                    radius: scope === "addr" ? (advRadius || 1000) : radius,
                    mode,
                    // χωρίς weekday => επιστρέφεις στη standard λογική today/tomorrow
                  });
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs border border-white/10"
                title="Αφαίρεση φίλτρων"
              >
                Φίλτρα ενεργά — Επαναφορά
              </button>
            )}
          </div>
        </div>

        {/* --- ADVANCED POPUP --- */}
        {showAdv && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/0 rounded-[32px]" onClick={() => setShowAdv(false)} />
            {/* panel */}
            <div className="relative w-[92%] rounded-[28px] border border-white/20 backdrop-blur bg-neutral-800/20 p-4">
              {/* Days pill */}
              <div className="rounded-full bg-white/10 px-4 py-2 flex flex-wrap gap-3 items-center justify-center">
                {days.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => setAdvDay((prev) => (prev === d.iso ? undefined : d.iso))}
                    className={`px-2 sm:px-3 py-1 rounded-full font-medium ${advDay === d.iso ? "bg-emerald-500 text-white" : "text-emerald-300 hover:bg-white/10"
                      }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Radius μόνο όταν scope = 'addr' */}
              {scope === "addr" && (
                <div className="mt-5">
                  <div className="rounded-[20px] bg-white/15 px-4 py-3">
                    <input
                      type="range"
                      min={300}
                      max={2000}
                      step={50}
                      value={advRadius}
                      onChange={(e) => setAdvRadius(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-sm mt-2">
                      <span>Ακτίνα: {advRadius} μ</span>
                      <button className="text-white/70 hover:text-white" onClick={() => { setAdvRadius(1000); setAdvDay(undefined); }}>
                        Άκυρο
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* actions */}
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20" onClick={() => setShowAdv(false)}>
                  Άκυρο
                </button>
                <button className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white" onClick={applyAdvanced}>
                  Εφαρμογή
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
