// Sidebar.tsx

"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button"; //δεν χρησιμοποιείται πλεον
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SearchWaveButton from "@/components/ui/SearchWaveButton";
import { motion, AnimatePresence } from "framer-motion";


type Props = {
  onSearch: (p: { lat: number; lng: number; radius: number; mode: "night" | "long"; weekday?: number }) => void;
  onWave?: () => void;
  onUserLocation?: (p: { lat: number; lng: number }) => void;
  onModeChange?: (m: "night" | "long") => void;
};


export default function Sidebar({ onSearch, onWave, onUserLocation, onModeChange }: Props) {
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

  // draft state για τις συνθετες επιλογες (σε scope "Ολα")
  const [draftDay, setDraftDay] = useState<number | undefined>(advDay);
  const [draftRadius, setDraftRadius] = useState<number>(advRadius);

  const [locating, setLocating] = useState(false);
  const [geoErr, setGeoErr] = useState<string | null>(null);



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


  useEffect(() => {
    onModeChange?.(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, onModeChange]);


  const handleMode = (m: "night" | "long") => {
    setMode(m);
    onModeChange?.(m);
    // onSearch({ lat, lng, radius: scope === "addr" ? (advRadius || 1500) : radius, mode: m, weekday: advDay });
  };


  // state refs
  const locateStartRef = useRef<number>(0);

  const handleUseMyLocation = () => {
    setGeoErr(null);
    if (!("geolocation" in navigator)) { setGeoErr("Ο browser δεν υποστηρίζει εντοπισμό τοποθεσίας."); return; }
    setLocating(true);
    locateStartRef.current = performance.now();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // ενημέρωσε local UI
        setLat(latitude); setLng(longitude);
        setAddr("Τρέχουσα τοποθεσία"); setSuggests([]);

        // δείξε marker στο χάρτη (μέσω parent)
        onUserLocation?.({ lat: latitude, lng: longitude });

        // κάνε άμεσα search στα 1500μ με το τρέχον mode/weekday
        onSearch({ lat: latitude, lng: longitude, radius: 1500, mode, weekday: advDay });
        onWave?.();

        // ΕΛΑΧΙΣΤΟ animation 1s
        const elapsed = performance.now() - locateStartRef.current;
        const min = 1000;
        const end = () => setLocating(false);
        elapsed < min ? setTimeout(end, min - elapsed) : end();
      },
      (err) => {
        const end = () => setLocating(false);
        const elapsed = performance.now() - locateStartRef.current;
        elapsed < 500 ? setTimeout(end, 500 - elapsed) : end();  // και στο error ένα minimum
        if (err.code === err.PERMISSION_DENIED) setGeoErr("Δεν δόθηκε άδεια για τοποθεσία.");
        else if (err.code === err.POSITION_UNAVAILABLE) setGeoErr("Αδυναμία προσδιορισμού τοποθεσίας.");
        else if (err.code === err.TIMEOUT) setGeoErr("Το αίτημα έληξε. Δοκίμασε ξανά.");
        else setGeoErr("Κάτι πήγε στραβά. Δοκίμασε ξανά.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };



  const days: { label: string; iso: number }[] = [
    { label: "Δευ", iso: 1 }, { label: "Τρι", iso: 2 }, { label: "Τετ", iso: 3 }, { label: "Πεμ", iso: 4 },
    { label: "Παρ", iso: 5 }, { label: "Σαβ", iso: 6 }, { label: "Κυρ", iso: 7 },
  ];


  const [hovered, setHovered] = useState<"night" | "long" | null>(null);
  const ACTIVE = "#5dd14bc3";

  // anchor & viewport
  const asideRef = useRef<HTMLElement | null>(null);
  const advBtnRef = useRef<HTMLButtonElement | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number }>({ x: 12, y: 12 });
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const calc = () => setIsNarrow(typeof window !== "undefined" && window.innerWidth < 1022);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);


  return (
    <aside ref={asideRef} className="relative h-full p-4 sm:p-5 text-white">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center">
            <img src="/ezparkTitle.svg" alt="ezpark.gr" className="h-18 lg:h-26 w-auto" />
          </div>

          {/* Mode segmented */}
          <div className="relative rounded-full bg-white/10 p-1.5 sm:p-2 mt-3 lg:mt-[clamp(1.5rem,6vh,5rem)] overflow-hidden">
            {/* Slider πίσω από τα κουμπιά */}
            <motion.div
              aria-hidden
              className="absolute inset-y-2 left-2 rounded-full transition-[box-shadow,filter] duration-300 ease-in-out"
              style={{
                width: "calc(50% - 0.5rem)",
                backgroundColor: ACTIVE, // #5dd14baf
                boxShadow:
                  hovered === mode
                    ? "0 10px 28px rgba(93,209,75,.32), 0 0 22px rgba(93,209,75,.34)"
                    : "0 8px 20px rgba(93,209,75,.22), 0 0 14px rgba(93,209,75,.20)",
                filter: hovered === mode ? "brightness(0.94)" : "none",
                willChange: "transform",
              }}
              animate={{ x: mode === "night" ? 0 : "100%" }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 25,
                mass: 0.9,
                bounce: 0.35,
              }}
            />



            <div className="relative grid grid-cols-2 gap-0">
              {/* Left */}
              <motion.button
                onHoverStart={() => setHovered("night")}
                onHoverEnd={() => setHovered(null)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMode("night")}
                className={[
                  "z-10 px-3 py-2 lg:px-4 lg:py-3 text-sm font-medium rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60",
                  mode === "night" ? "text-white" : "text-white/85 hover:text-white",
                ].join(" ")}
              >
                Βραδινή Έξοδος
              </motion.button>

              {/* Right */}
              <motion.button
                onHoverStart={() => setHovered("long")}
                onHoverEnd={() => setHovered(null)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMode("long")}
                className={[
                  "z-10 px-3 py-2 lg:px-4 lg:py-3 text-sm font-medium rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60",
                  mode === "long" ? "text-white" : "text-white/85 hover:text-white",
                ].join(" ")}
              >
                Μόνιμη Στάθμευση
              </motion.button>
            </div>
          </div>

          {/* Scope segmented */}
          <div className="relative rounded-full bg-white/10 p-1.5 sm:p-2 overflow-hidden mt-2.5">
            {/* slider πίσω από τα κουμπιά */}
            <motion.div
              aria-hidden
              className="absolute inset-y-2 left-2 rounded-full transition-[box-shadow,filter] duration-300 ease-in-out"
              style={{
                width: "calc(50% - 0.5rem)",
                backgroundColor: "#446ab0ff",
                boxShadow:
                  // μόνιμο ελαφρύ glow στο ενεργό + θα γίνει πιο δυνατό όταν hoverάρεις το ενεργό button
                  (/* θα δυναμώσει με hover από το state των buttons παρακάτω */ "0 8px 20px rgba(68, 106, 176, 0.3), 0 0 14px rgba(68, 106, 176, 0.4)"),
                willChange: "transform",
              }}
              // springy slide (bounce) όπως πάνω
              animate={{ x: scope === "all" ? 0 : "100%" }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 25,
                mass: 0.9,
                bounce: 0.35,
              }}
            />

            <div className="relative grid grid-cols-2">
              {/* Left: Όλα */}
              <motion.button
                onHoverStart={() => {
                  if (scope === "all") {
                    // ενισχύουμε προσωρινά το glow του slider όταν hoverάρεις το ενεργό
                    const s = (document?.currentScript as any)?.ownerDocument ?? document;
                    const el = (s.querySelector?.(":scope") ? (null as any) : null); // no-op για TS
                  }
                }}
                onMouseEnter={(e) => {
                  if (scope === "all") {
                    const slider = (e.currentTarget.parentElement!.previousElementSibling as HTMLDivElement);
                    slider.style.boxShadow = "0 10px 28px rgba(68,106,176,.30), 0 0 22px rgba(68,106,176,.34)";
                    slider.style.filter = "brightness(0.94)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (scope === "all") {
                    const slider = (e.currentTarget.parentElement!.previousElementSibling as HTMLDivElement);
                    slider.style.boxShadow = "0 8px 20px rgba(68,106,176,.22), 0 0 14px rgba(68,106,176,.20)";
                    slider.style.filter = "none";
                  }
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setScope("all")}
                className={[
                  "z-10 px-3 py-2 lg:px-4 lg:py-3 text-sm font-medium rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60",
                  scope === "all" ? "text-white" : "text-white/85 hover:text-white",
                ].join(" ")}
              >
                Όλα
              </motion.button>

              {/* Right: Συγκεκριμένη Διεύθυνση */}
              <motion.button
                onMouseEnter={(e) => {
                  if (scope === "addr") {
                    const slider = (e.currentTarget.parentElement!.previousElementSibling as HTMLDivElement);
                    slider.style.boxShadow = "0 10px 28px rgba(68,106,176,.30), 0 0 22px rgba(68,106,176,.34)";
                    slider.style.filter = "brightness(0.94)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (scope === "addr") {
                    const slider = (e.currentTarget.parentElement!.previousElementSibling as HTMLDivElement);
                    slider.style.boxShadow = "0 8px 20px rgba(68,106,176,.22), 0 0 14px rgba(68,106,176,.20)";
                    slider.style.filter = "none";
                  }
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setScope("addr")}
                className={[
                  "z-10 px-3 py-2 lg:px-4 lg:py-3 text-sm font-medium rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60",
                  scope === "addr" ? "text-white" : "text-white/85 hover:text-white",
                ].join(" ")}
              >
                Συγκεκριμένη Διεύθυνση
              </motion.button>
            </div>
          </div>

          {scope === "addr" && (
            <div className="space-y-1 relative">
              <Label className="text-white/80">Διεύθυνση</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                  placeholder="π.χ. Πραξιτέλους Πειραιάς"
                  className="flex-1 bg-white/5 px-4 py-5 lg:py-5 rounded-[18px] border-white/10 text-white placeholder:text-white/60"
                />

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  aria-label="Χρήση τρέχουσας τοποθεσίας"
                  className={[
                    "relative shrink-0 h-11 w-11 rounded-full border border-white/30 bg-white/5 flex items-center justify-center transition disabled:opacity-60",
                    locating ? "locating-sweep" : "hover:bg-white/10"
                  ].join(" ")}
                  disabled={locating}
                  title="Χρήση τρέχουσας τοποθεσίας"
                >
                  {locating ? (
                    <span className="block h-5 w-5 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                  ) : (
                    <img src="/locationIcon.svg" alt="" className="h-12 w-12 opacity-90" />
                  )}
                </button>
              </div>

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
                        // onSearch({ lat: s.lat, lng: s.lng, radius: advRadius || 1000, mode, weekday: advDay });
                      }}
                    >
                      <div className="font-medium">{s.primary}</div>
                      {s.secondary && <div className="text-xs text-white/60">{s.secondary}</div>}
                    </button>
                  ))}
                </div>
              )}

              {/* hint + geo error */}
              <div className="flex items-start justify-between">
                <p className="text-xs text-white/60">* Γράψε διεύθυνση, περιοχή, μαγαζί κτλπ</p>
                {geoErr && <p className="text-xs text-rose-300">{geoErr}</p>}
              </div>
            </div>
          )}

          {/* Αναζήτηση */}
          <div className="mt-2.5 sm:mt-3">
            <SearchWaveButton
              className="mt-4"
              onClick={() => onSearch({ lat, lng, radius: scope === "addr" ? (advRadius || 1000) : radius, mode, weekday: advDay })}
              onWaveDone={onWave}
            />
          </div>


          <div className="mt-4 flex items-center gap-3">
            <button
              ref={advBtnRef}
              className="text-left text-white/40 hover:text-white/50 underline underline-offset-4"
              onClick={() => {
                // sync drafts με τις “εφαρμοσμένες” τιμές
                setDraftDay(advDay);
                setDraftRadius(advRadius);

                // Υπολόγισε anchor για desktop: κάτω-αριστερά του κουμπιού
                try {
                  if (advBtnRef.current && asideRef.current) {
                    const br = advBtnRef.current.getBoundingClientRect();
                    const ar = asideRef.current.getBoundingClientRect();
                    // left = κουμπί.left - aside.left, top = κουμπί.bottom - aside.top
                    setAnchor({ x: Math.max(12, br.left - ar.left), y: br.bottom - ar.top + 8 });
                  }
                } catch { }

                setShowAdv(true);
              }}
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


        {/* --- ADVANCED POPUP (animated genie + glass) --- */}
        <AnimatePresence>
          {showAdv && (
            // anchor bottom-left: εμφανίζεται από κάτω αριστερά του sidebar
            <div className="absolute inset-0 z-30 flex items-end justify-start p-3 sm:p-4">
              {/* Backdrop (πιο διακριτικό) */}
              <motion.button
                type="button"
                className="fixed inset-0 z-[80] bg-transparent"   // fixed full-screen, καθόλου dim
                onClick={() => setShowAdv(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                aria-label="Κλείσιμο"
              />


              {/* Panel ─ “genie” από κάτω-αριστερά, με glass */}
              <motion.div
                className="
                  absolute z-[90]
                  w-[min(96%,580px)]
                  rounded-3xl border border-white/12
                  bg-white/4 backdrop-blur-md
                  shadow-[0_10px_40px_rgba(0,0,0,.45)]
                  p-3 sm:p-4 overflow-hidden
                "
                style={{ transformOrigin: "bottom left" }}
                // πιο έντονο genie: scale + translate + clipPath spring
                initial={{
                  opacity: 0,
                  scale: 0.78,
                  y: 14,
                  clipPath: "inset(60% 60% 0% 0% round 36px)",
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  clipPath: "inset(0% 0% 0% 0% round 24px)",
                  filter: "blur(0px)",
                  transition: {
                    type: "spring",
                    stiffness: 520,
                    damping: 30,
                    mass: 0.9,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  y: 12,
                  clipPath: "inset(40% 40% 0% 0% round 28px)",
                  filter: "blur(8px)",
                  transition: { duration: 0.18, ease: "easeInOut" },
                }}
              >
                {/* διακριτικό glass highlight */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(1200px 300px at -10% 110%, rgba(16,185,129,0.06), transparent 62%), radial-gradient(900px 240px at 110% -10%, rgba(59,130,246,0.05), transparent 58%)",
                  }}
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />


                {/* === CONTENT === */}

                {/* Days grid: balanced στο mobile (4 στήλες) και 7 στο sm+ */}
                <div className="rounded-[20px] ring-1 ring-white/10 bg-white/[.02] backdrop-blur-md px-3 py-2">
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 place-items-center">
                    {days.map((d) => {
                      const isAllScope = scope === "all";
                      const isActive = isAllScope ? advDay === d.iso : draftDay === d.iso;

                      return (
                        <motion.button
                          key={d.iso}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (isAllScope) {
                              // scope=all: auto-apply με ένα click
                              const newDay = advDay === d.iso ? undefined : d.iso;
                              setAdvDay(newDay);
                              setShowAdv(false);
                              onSearch({ lat, lng, radius, mode, weekday: newDay });
                              onWave?.();
                            } else {
                              // scope=addr: αλλαγή στα drafts
                              setDraftDay(prev => (prev === d.iso ? undefined : d.iso));
                            }
                          }}
                          className={[
                            "px-3 py-1.5 text-[15px] font-semibold rounded-full",
                            "transition-colors",
                            isActive
                              ? "bg-emerald-500 text-white shadow-[0_6px_22px_rgba(16,185,129,.28)]"
                              : "text-emerald-300 hover:bg-white/10",
                          ].join(" ")}
                        >
                          {d.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Radius μόνο όταν scope = 'addr' */}
                {scope === "addr" && (
                  <div className="mt-4">
                    <div className="rounded-[20px] ring-1 ring-white/10 bg-white/[.05] backdrop-blur px-4 py-3">
                      <input
                        type="range"
                        min={300}
                        max={2000}
                        step={50}
                        value={draftRadius}
                        onChange={(e) => setDraftRadius(parseInt(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                      <div className="flex justify-between text-sm mt-2">
                        <span>Ακτίνα: {draftRadius} μ</span>
                        <button
                          className="text-white/70 hover:text-white"
                          onClick={() => { setDraftRadius(1000); setDraftDay(undefined); }}
                        >
                          Άκυρο
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* actions (μόνο για addr) */}
                {scope === "addr" ? (
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20"
                      onClick={() => { setDraftDay(advDay); setDraftRadius(advRadius); setShowAdv(false); }}
                    >
                      Άκυρο
                    </button>
                    <button
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => {
                        setAdvDay(draftDay);
                        setAdvRadius(draftRadius);
                        setShowAdv(false);
                        onSearch({ lat, lng, radius: draftRadius || 1000, mode, weekday: draftDay });
                        onWave?.();
                      }}
                    >
                      Εφαρμογή
                    </button>
                  </div>
                ) : null}
              </motion.div>
            </div>
          )}
        </AnimatePresence>


      </div>
    </aside >
  );
}
