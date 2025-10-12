"use client";
import { useEffect } from "react";

type Props = { features: GeoJSON.Feature[] };

/** ίδιο rule με Map.tsx */
function makeFeatureId(props: any) {
  const name = (props?.name ?? "").toString().trim();
  const muni = (props?.municipality ?? "").toString().trim();
  return `${name}|${muni}` || Math.random().toString(36).slice(2);
}

export default function ResultsList({ features }: Props) {
  // Άκου από Map: highlight-card/unhighlight-card → βάλε οπτικό highlight στην κάρτα
  useEffect(() => {
    const onHiCard = (e: any) => {
      const id = e.detail?.id;
      if (id == null) return;
      document.querySelectorAll(".result-card")
        .forEach((el) => el.classList.remove("ring-2", "ring-amber-400"));
      const el = document.querySelector(`.result-card[data-id="${CSS.escape(String(id))}"]`);
      if (el) el.classList.add("ring-2", "ring-amber-400");
    };
    const onUnCard = () => {
      document.querySelectorAll(".result-card")
        .forEach((el) => el.classList.remove("ring-2", "ring-amber-400"));
    };

    window.addEventListener("highlight-card", onHiCard as EventListener);
    window.addEventListener("unhighlight-card", onUnCard as EventListener);
    return () => {
      window.removeEventListener("highlight-card", onHiCard as EventListener);
      window.removeEventListener("unhighlight-card", onUnCard as EventListener);
    };
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Αποτελέσματα</h2>

      <div className="flex flex-col gap-3">
        {features.map((f, i) => {
          const p = (f.properties as any) || {};
          const name = p.name ?? "Οδός";
          const muni = p.municipality ?? "";
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${muni}`)}`;

          // σταθερό id, ίδιο με αυτό που μπαίνει στα pins
          const fid = makeFeatureId(p);

          return (
            <div
              key={i}
              data-id={fid}
              onMouseEnter={() => window.dispatchEvent(new CustomEvent("highlight-pin", { detail: { id: fid } }))}
              onMouseLeave={() => window.dispatchEvent(new CustomEvent("unhighlight-pin", { detail: { id: fid } }))}
              className="result-card w-full rounded-[22px] border border-white/30
                         bg-gradient-to-r from-emerald-900/30 to-emerald-600/30
                         px-5 py-4 flex items-center justify-between
                         hover:from-emerald-700/30 hover:to-emerald-600/20 transition"
            >
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-sm text-white/60">{muni}</div>
              </div>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-block px-5 py-2 rounded-full
                           bg-emerald-600/85 hover:bg-emerald-600
                           text-white text-sm font-semibold"
              >
                Open in Google Maps
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
