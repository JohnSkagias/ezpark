"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = { features: GeoJSON.Feature[]; onSelect?: (f: GeoJSON.Feature) => void };

export default function ResultsList({ features, onSelect }: Props) {
  // anchor για "κορυφή λίστας" (για το mobile back-to-top)
  const topRef = useRef<HTMLDivElement | null>(null);

  // δείξε/κρύψε το back-to-top ΜΟΝΟ σε mobile
  const [showBackToTop, setShowBackToTop] = useState(false);

  // desktop scroll container + auto-hide scrollbar
  const listRef = useRef<HTMLDivElement | null>(null);
  const [sbActive, setSbActive] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onWindowScrollOrResize = () => {
      if (typeof window === "undefined") return;
      const isMobile = window.innerWidth < 1024;
      if (!isMobile || !topRef.current) {
        setShowBackToTop(false);
        return;
      }
      const top = topRef.current.getBoundingClientRect().top;
      setShowBackToTop(top < -60);
    };

    onWindowScrollOrResize();
    window.addEventListener("scroll", onWindowScrollOrResize, { passive: true });
    window.addEventListener("resize", onWindowScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onWindowScrollOrResize);
      window.removeEventListener("resize", onWindowScrollOrResize);
    };
  }, []);

  // ενεργοποίηση/απενεργοποίηση scrollbar (desktop only)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const isDesktop = () => window.innerWidth >= 1024;

    const activate = () => {
      if (!isDesktop()) return;
      setSbActive(true);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setSbActive(false), 1000); // 1s αδράνεια
    };

    const onScroll = () => activate();
    const onEnter = () => activate();
    const onLeave = () => {
      if (!isDesktop()) return;
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      // fade out αμέσως μόλις φύγει το ποντίκι (πιο καθαρό)
      setSbActive(false);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    // αρχικά: αν desktop, εμφανίσε το για 1s
    if (typeof window !== "undefined" && isDesktop()) {
      setSbActive(true);
      hideTimerRef.current = window.setTimeout(() => setSbActive(false), 1000);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  // ομαλό scroll προς την κορυφή της λίστας (mobile)
  const smoothScrollTo = (targetY: number, duration = 800) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const start = performance.now();
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const scrollListToTop = () => {
    if (!topRef.current) return;
    const y = topRef.current.getBoundingClientRect().top + window.pageYOffset - 16; // μικρό offset
    smoothScrollTo(y, 800);
  };

  // empty state όπως το έχεις
  if (!features || features.length === 0) {
    return (
      <div className="space-y-3" ref={topRef}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-6 py-8 text-center text-white"
        >
          {/* decorative blobs */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-8 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="text-3xl mb-2">:/</div>
          <div className="font-semibold">Κανένα αποτέλεσμα για την παρούσα αναζήτηση.</div>
          <div className="text-sm text-white/65 mt-1">
            Δοκίμασε άλλη περιοχή, μεγαλύτερη ακτίνα ή διαφορετική ημέρα.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={topRef}>
      {/* Desktop (>=1024px): scrollable container ~400px */}
      <div
        ref={listRef}
        className={[
          // mobile: καμία αλλαγή
          // desktop: contained scrolling + thin white scrollbar
          "lg:h-[400px] lg:overflow-y-auto lg:overscroll-contain lg:pr-1",
          "ez-scroll", // custom scrollbar από το globals.css
          sbActive ? "ez-scroll--active" : "",
        ].join(" ")}
      >
        <div className="flex flex-col gap-3">
          {features.map((f, i) => {
            const p = (f.properties as any) || {};
            const name = p.name ?? "Οδός";
            const muni = p.municipality ?? "";
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${name}, ${muni}`
            )}`;

            return (
              <div
                key={i}
                onClick={() => onSelect?.(f)}
                className="group relative overflow-hidden w-full rounded-[22px] border border-white/20
                   bg-gradient-to-r from-#3A5145 to-emerald-900/30
                   px-5 py-4 hover:from-emerald-900/30 hover:to-emerald-600/20 transition cursor-pointer"
              >
                {/* shimmer λωρίδα στο hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full
                     bg-gradient-to-r from-transparent via-white/10 to-transparent
                     transition-transform duration-700 ease-out group-hover:translate-x-full"
                />

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  style={{ willChange: "transform, opacity" }}
                  className="flex items-center justify-between text-white"
                >
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-white/60">{muni}</div>
                  </div>

                  <a
                    onClick={(e) => e.stopPropagation()}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-block px-5 py-2 rounded-full
                       bg-emerald-600/85 hover:bg-emerald-600
                       text-white text-sm font-semibold
                       transition-transform duration-200 group-hover:scale-[1.03]"
                  >
                    Open in Google Maps
                  </a>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile-only back-to-top (κυκλικό) */}
      {showBackToTop && (
        <button
          onClick={scrollListToTop}
          aria-label="Επιστροφή στην αρχή της λίστας"
          className="
            lg:hidden fixed bottom-20 right-4 z-40
            h-12 w-12 rounded-full grid place-items-center
            bg-white/60 text-[#12590d] shadow-lg
            border border-white/70 backdrop-blur
            active:scale-95 transition
          "
        >
          {/* μικρό βελάκι */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5l0 14M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}
