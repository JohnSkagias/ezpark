"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  onSearch: (p: { lat: number; lng: number; radius: number }) => void;
};

const pill = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-medium transition
   ${active ? "bg-emerald-500 text-white shadow" : "bg-white/10 hover:bg-white/20 text-white"}`;

export default function Sidebar({ onSearch }: Props) {
  const [mode, setMode] = useState<"night" | "long">("night");
  const [scope, setScope] = useState<"all" | "addr">("all");
  const [addr, setAddr] = useState("");
  const [lat, setLat] = useState(37.979);
  const [lng, setLng] = useState(23.7265);
  const [radius, setRadius] = useState(2000);

  return (
    <aside
      className="
        space-y-4 p-5 rounded-2xl
        bg-gradient-to-br from-[#0b1320] via-[#0e1b12] to-[#12311f]
        text-white shadow-xl border border-white/10
      "
    >
      <div className="text-2xl font-extrabold tracking-tight">
        ezpark<span className="text-emerald-400">.gr</span>
      </div>

      {/* Κουμπιά mode */}
      <div className="grid grid-cols-2 gap-2">
        <button className={pill(mode === "night")} onClick={() => setMode("night")}>
          Βραδινή Έξοδος
        </button>
        <button className={pill(mode === "long")} onClick={() => setMode("long")}>
          Μόνιμη Στάθμευση
        </button>
      </div>

      {/* Κουμπιά scope */}
      <div className="grid grid-cols-2 gap-2">
        <button className={pill(scope === "all")} onClick={() => setScope("all")}>
          Όλα
        </button>
        <button className={pill(scope === "addr")} onClick={() => setScope("addr")}>
          Συγκεκριμένη Διεύθυνση
        </button>
      </div>

      {scope === "addr" && (
        <div className="space-y-1">
          <Label className="text-white/80">Διεύθυνση</Label>
          <Input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            placeholder="π.χ. Πανεπιστημίου 20"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
          />
          <p className="text-xs text-white/60">* geocoding αργότερα</p>
        </div>
      )}

      {/* Συντεταγμένες */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-white/80">Lat</Label>
          <Input
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value))}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
          />
        </div>
        <div>
          <Label className="text-white/80">Lng</Label>
          <Input
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value))}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
          />
        </div>
        <div>
          <Label className="text-white/80">Ακτίνα (m)</Label>
          <Input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value || "0"))}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/60"
          />
        </div>
      </div>

      <Button
        className="w-full rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
        onClick={() => onSearch({ lat, lng, radius })}
      >
        Αναζήτηση
      </Button>
    </aside>
  );
}
