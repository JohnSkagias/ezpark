"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  onSearch: (p: { lat: number; lng: number; radius: number }) => void;
};

export default function Sidebar({ onSearch }: Props) {
  const [mode, setMode] = useState<"night" | "long">("night");
  const [scope, setScope] = useState<"all" | "addr">("all");
  const [addr, setAddr] = useState("");
  const [lat, setLat] = useState(37.9790);
  const [lng, setLng] = useState(23.7265);
  const [radius, setRadius] = useState(2000);

  return (
    <aside className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
      <div className="text-2xl font-bold">ezpark<span className="text-green-400">.gr</span></div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant={mode==="night"?"default":"secondary"} onClick={()=>setMode("night")}>Βραδινή Έξοδος</Button>
        <Button variant={mode==="long"?"default":"secondary"} onClick={()=>setMode("long")}>Μόνιμη Στάθμευση</Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant={scope==="all"?"default":"secondary"} onClick={()=>setScope("all")}>Όλα</Button>
        <Button variant={scope==="addr"?"default":"secondary"} onClick={()=>setScope("addr")}>Συγκεκριμένη Διεύθυνση</Button>
      </div>

      {scope==="addr" && (
        <div className="space-y-1">
          <Label>Διεύθυνση (placeholder)</Label>
          <Input value={addr} onChange={e=>setAddr(e.target.value)} placeholder="πχ Πανεπιστημίου 20" />
          <p className="text-xs text-neutral-300">* θα το συνδέσουμε με geocoding αργότερα</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-neutral-300">Lat</Label>
          <Input type="number" step="0.0001" value={lat} onChange={e=>setLat(parseFloat(e.target.value))}/>
        </div>
        <div>
          <Label className="text-neutral-300">Lng</Label>
          <Input type="number" step="0.0001" value={lng} onChange={e=>setLng(parseFloat(e.target.value))}/>
        </div>
        <div>
          <Label className="text-neutral-300">Ακτίνα (m)</Label>
          <Input type="number" value={radius} onChange={e=>setRadius(parseInt(e.target.value||"0"))}/>
        </div>
      </div>

      <Button className="w-full" onClick={()=>onSearch({lat,lng,radius})}>Αναζήτηση</Button>
    </aside>
  );
}
