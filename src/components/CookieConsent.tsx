"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Δείξε μόνο αν δεν υπάρχει επιλογή
    if (!getConsent()) setVisible(true);

    // Άνοιγμα από άλλα σημεία (footer "Ρυθμίσεις Cookies")
    const open = () => setVisible(true);
    window.addEventListener("ezp-open-consent" as any, open);
    return () => window.removeEventListener("ezp-open-consent" as any, open);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="
        fixed bottom-4 left-4 z-[70]
        w-[min(92vw,520px)]
        rounded-2xl border border-white/15
        bg-neutral-900/95 backdrop-blur
        shadow-2xl
        p-4 sm:p-5
        text-white
        animate-ez-slide-up
      "
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <p className="text-sm leading-5 text-white/90">
        Χρησιμοποιούμε μόνο απαραίτητες τεχνολογίες για τη βασική λειτουργία.
        Προαιρετικά, μπορούμε να συλλέξουμε <strong>ανώνυμες</strong> μετρήσεις για βελτίωση.
        Δείτε την{" "}
        <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300 underline">
          Πολιτική Cookies
        </Link>.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setConsent("all"); setVisible(false); }}
          className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold
                     bg-emerald-600/90 hover:bg-emerald-600 border border-emerald-400/40 transition"
        >
          Αποδοχή όλων
        </button>

        <button
          onClick={() => { setConsent("necessary"); setVisible(false); }}
          className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold
                     bg-white/10 hover:bg-white/15 border border-white/15 transition"
        >
          Μόνο απαραίτητα
        </button>

        <button
          type="button"
          onClick={() => { window.location.href = "/cookies"; }}
          className="ml-auto text-sm text-white/70 hover:text-white transition underline decoration-white/30"
          aria-label="Ρυθμίσεις Cookies"
        >
          Ρυθμίσεις
        </button>
      </div>
    </div>
  );
}
