import { MapPin } from "lucide-react";
import React from "react";

type Props = { features: GeoJSON.Feature[] };

export default function ResultsList({ features }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Αποτελέσματα</h2>

      <div className="flex flex-col gap-3">
        {features.map((f, i) => {
          const p = (f.properties as any) || {};
          const name = p.name ?? "Οδός";
          const muni = p.municipality ?? "";
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${muni}`)}`;

          return (
            <div
              key={i}
              className="
                w-[60%] min-w-[400px]
                rounded-2xl border border-white/10
                bg-emerald-900/20 backdrop-blur-[2px]
                px-4 py-3
                flex items-center justify-between
                hover:bg-emerald-900/30 transition
              "
            >
              {/* κείμενο αριστερά */}
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-sm text-white/60">{muni}</div>
              </div>

              {/* κουμπί δεξιά */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-block px-4 py-2 rounded-lg
                           bg-emerald-600/80 hover:bg-emerald-600
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
