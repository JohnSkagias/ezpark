"use client";
import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import ResultsList from "../components/ResultsList";
import MapBorderSweep from "@/components/ui/MapBorderSweep";
import Link from "next/link";

export default function HomePage() {
  const [data, setData] = useState<GeoJSON.FeatureCollection>({ type: "FeatureCollection", features: [] });
  const [suggested, setSuggested] = useState<string>("");
  const [activeWeekday, setActiveWeekday] = useState<number | undefined>(undefined);
  const dayNameGR = (d: Date) => new Intl.DateTimeFormat("el-GR", { weekday: "long" }).format(d).replace(/^./, (c) => c.toUpperCase());
  const dayNames = ["", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];
  const mapRef = useRef<HTMLDivElement>(null);

  const smoothScrollTo = (targetY: number, duration = 1100) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const start = performance.now();
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };


  const runSearch = async (
    { lat, lng, radius, mode, weekday }: {
      lat: number; lng: number; radius: number; mode: "night" | "long"; weekday?: number;
    },
    opts?: { pulseMap?: boolean; autoScroll?: boolean }
  ) => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius), mode });
    if (typeof weekday === "number") params.set("weekday", String(weekday));
    const res = await fetch(`/api/search?${params.toString()}`, { cache: "no-store" });
    const json = await res.json();
    setData(json.geojson);
    setSuggested(json.suggestedWindow);
    setActiveWeekday(weekday);

    //scroll ΜΟΝΟ όταν το επιτρέπουμε ρητά (default: true)
    const shouldScroll = opts?.autoScroll ?? true;
    if (shouldScroll && window.innerWidth < 1022 && mapRef.current) {
      smoothScrollTo(mapRef.current.getBoundingClientRect().top + window.pageYOffset - 60, 1100);
    }

    if (opts?.pulseMap ?? true) triggerMapWave();
  };

  // — user location on initial load —
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const locRequestedRef = useRef(false);


  const runSearchNoPulse = (p: { lat: number; lng: number; radius: number; mode: "night" | "long"; weekday?: number }) =>
    runSearch(p, { pulseMap: false });


  // state για το map border sweep / animation
  const [mapWave, setMapWave] = useState(false);
  const triggerMapWave = () => {
    setMapWave(false);
    requestAnimationFrame(() => setMapWave(true));
  };

  const [focus, setFocus] = useState<{ coords: [number, number]; props?: any } | null>(null);
  const handleSelectFromList = (f: GeoJSON.Feature) => {
    const c = featureCenter(f);
    if (!c) return;
    setFocus({ coords: c, props: f.properties ?? {} });

    // smooth scroll ΠΑΝΤΑ (mobile + desktop)
    if (mapRef.current) {
      smoothScrollTo(mapRef.current.getBoundingClientRect().top + window.pageYOffset - 60, 1000);
    }

    // ένα μικρό visual feedback στο frame του map
    triggerMapWave();
  };

  // hint όταν εντοπιστεί θέση
  const [justLocated, setJustLocated] = useState(false);
  const justLocatedTimer = useRef<number | null>(null);


  function featureCenter(f: GeoJSON.Feature): [number, number] | null {
    if (!f.geometry) return null;
    if (f.geometry.type === "LineString") {
      const coords = f.geometry.coordinates as number[][];
      if (coords.length === 0) return null;
      return coords[Math.floor(coords.length / 2)] as [number, number];
    }
    if (f.geometry.type === "Point") {
      return f.geometry.coordinates as [number, number];
    }
    return null;
  }

  // αρχικό search με user location ή default
  useEffect(() => {
    runSearch(
      { lat: 37.979, lng: 23.7265, radius: 10000, mode: "night" },
      { pulseMap: true, autoScroll: false } // δεν κάνουμε scroll στο load
    );
  }, []);

  // Ζήτησε άδεια/λήψη τοποθεσίας ΜΙΑ φορά στο load (χωρίς να επηρεάσουμε τη ροή του search)
  useEffect(() => {
    if (locRequestedRef.current) return;
    locRequestedRef.current = true;

    if (!("geolocation" in navigator)) return;

    // αν υπάρχει Permissions API, απόφυγε άσκοπα prompts όταν είναι ήδη 'denied'
    (async () => {
      try {
        const perm: any = await (navigator as any).permissions?.query({ name: "geolocation" as any });
        if (perm?.state === "denied") return;
      } catch {/* τίποτα */ }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // Map.tsx περιμένει [lng, lat]
          setUserLoc([longitude, latitude]);
        },
        () => {/* αν αρνηθεί/αποτύχει, απλά συνεχίζουμε κανονικά */ },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    })();
  }, []);

  // Εμφάνισε hint όταν εντοπιστεί τοποθεσία χρήστη
  useEffect(() => {
    if (!userLoc) return;
    if (justLocatedTimer.current) window.clearTimeout(justLocatedTimer.current);
    setJustLocated(true);
    justLocatedTimer.current = window.setTimeout(() => setJustLocated(false), 2000);
    return () => {
      if (justLocatedTimer.current) window.clearTimeout(justLocatedTimer.current);
    };
  }, [userLoc]);




  return (
    <main className="grid grid-cols-1 lg:grid-cols-[33vw_1fr] min-h-screen gap-6 lg:gap-10 p-4 lg:p-8">
      <div className="relative">
        <div className="lg:sticky lg:top-6">
          <div className="rounded-3xl lg:rounded-[46px] border border-white/30 overflow-hidden
                          p-4 sm:p-5 lg:p-12
                          h-auto lg:min-h-[calc(98vh-3rem)]
                          bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: "url('/sidebarBackground.svg')" }}>
            <Sidebar onSearch={runSearchNoPulse} onWave={triggerMapWave} onUserLocation={({ lat, lng }) => setUserLoc([lng, lat])} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-xl font-semibold text-white/90">
          Προτεινόμενοι Οδοί για{" "}
          <span className="text-emerald-400">{activeWeekday ? dayNames[activeWeekday] : `σήμερα ${dayNameGR(new Date())}`}</span>
        </h2>

        <div ref={mapRef} className="relative rounded-[28px] border border-white/30 overflow-hidden shadow-xl">
          <div className="h-[520px]">
            <Map geojson={data} focus={focus} userLocation={userLoc} />
            
            {/* HINT: εντοπίστηκε τοποθεσία */}
            <div
              className={[
                "pointer-events-none absolute left-4 bottom-4",
                "transition-all duration-300",
                justLocated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              ].join(" ")}
            >
              <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white/90 text-sm shadow">
                📍 Εντοπίστηκε: κοντά σε εσάς
              </div>
            </div>
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
        <ResultsList features={data.features ?? []} onSelect={handleSelectFromList} />

        <footer className="mt-10 py-6 text-center text-white/60 border-t border-white/10">
          <div className="text-xs">© 2025 EzPark. All rights reserved.</div>
          <div className="mt-2 flex items-center justify-center gap-4 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">
              🧾 Όροι Χρήσης
            </Link>
            <span aria-hidden className="text-white/30">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              🔒 Πολιτική Απορρήτου
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
