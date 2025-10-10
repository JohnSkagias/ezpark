import { MapPin } from "lucide-react";

type Props = { features: GeoJSON.Feature[] };

export default function ResultsList({ features }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Αποτελέσματα</h2>
      <ul className="space-y-3">
        {features.map((f, i) => {
          const p = (f.properties as any) || {};
          return (
            <li key={i} className="flex items-center gap-3 rounded-xl border px-3 py-2">
              <div className="shrink-0">
                <MapPin className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-neutral-500">{p.municipality}</div>
              </div>
              {typeof p.distance_m === "number" && (
                <span className="text-xs rounded-full bg-neutral-100 px-2 py-1">
                  {p.distance_m} m
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
