"use client";
import { motion } from "framer-motion";

type Props = { features: GeoJSON.Feature[]; onSelect?: (f: GeoJSON.Feature) => void };

export default function ResultsList({ features, onSelect }: Props) {
  if (!features || features.length === 0) {
    return (
      <div className="space-y-3">
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
    <div className="space-y-3">

      <div className="flex flex-col gap-3">
        {features.map((f, i) => {
          const p = (f.properties as any) || {};
          const name = p.name ?? "Οδός";
          const muni = p.municipality ?? "";
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${muni}`)}`;

          return (
            // ✅ κρατάμε το key στο ΕΞΩ wrapper σου
            <div
              key={i}
              onClick={() => onSelect?.(f)}
              className="group relative overflow-hidden w-full rounded-[22px] border border-white/30
                 bg-gradient-to-r from-#3A5145 to-emerald-600/30
                 px-5 py-4 hover:from-emerald-700/30 hover:to-emerald-600/20 transition cursor-pointer"
            >
              {/* shimmer λωρίδα στο hover (καθαρά CSS) */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full
                   bg-gradient-to-r from-transparent via-white/10 to-transparent
                   transition-transform duration-700 ease-out group-hover:translate-x-full"
              />

              {/* 👇 ΕΔΩ μπαίνει η κίνηση, μέσα στο wrapper */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                // μικρό lift σε hover (δεν επηρεάζει το key/wrapper)
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
  );
}
