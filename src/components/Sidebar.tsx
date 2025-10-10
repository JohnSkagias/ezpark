"use client";
import { useState } from "react";
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
  const [lat, setLat] = useState(37.979);
  const [lng, setLng] = useState(23.7265);
  const [radius, setRadius] = useState(2000);
  const handleMode = (m: "night" | "long") => {
    setMode(m);
    onSearch({ lat, lng, radius, mode: m }); // trigger νέα αναζήτηση
  };

  return (
    <aside className="h-full p-5 text-white">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="text-2xl font-extrabold tracking-tight">
            <img src="/ezparkTitle.svg" alt="ezpark.gr" className="h-20 w-auto" />
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
            <div className="space-y-1">
              <Label className="text-white/80">Διεύθυνση</Label>
              <Input value={addr} onChange={(e) => setAddr(e.target.value)}
                placeholder="π.χ. Πανεπιστημίου 20"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/60" />
              <p className="text-xs text-white/60">* geocoding αργότερα</p>
            </div>
          )}

          <div className="mt-3">
            <Button
              className="w-full rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
              onClick={() => onSearch({ lat, lng, radius, mode })}
            >
              Αναζήτηση
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
