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
              className="w-full rounded-[22px] border border-white/30
                         bg-gradient-to-r from-#3A5145 to-emerald-600/30
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
