import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Row = {
  id: string; // cast σε text στο SQL
  road_name: string | null;
  municipality: string | null;
  latitude: number | null;
  longitude: number | null;
  weekday_iso: number | null;
  distance_m: number;
};

function isoDay(js: number) {
  return ((js + 6) % 7) + 1;
}

// helper: safe JSON stringify (BigInt -> string)
function safeStringify(obj: any) {
  return JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat") ?? "37.9755");
  const lng = Number(searchParams.get("lng") ?? "23.7348");
  const radius = Number(searchParams.get("radius") ?? "2000");
  const mode = (searchParams.get("mode") ?? "night") as "night" | "long";

  const now = new Date();
  const todayIso = isoDay(now.getDay());
  const tomorrowIso = todayIso === 7 ? 1 : todayIso + 1;
  const targetIso = mode === "night" ? tomorrowIso : todayIso;

  const rows = await prisma.$queryRaw<Row[]>`
    with center as (
      select ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) as g
    )
    select
      e.id::text as id,
      e.road_name,
      e.municipality,
      e.latitude,
      e.longitude,
      e.weekday_iso,
      ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(e.longitude, e.latitude),4326),
        (select g from center)
      )::double precision as distance_m
    from ezpark_data e
    where e.weekday_iso = ${targetIso}
      and e.latitude is not null and e.longitude is not null
      and ST_DWithin(
        ST_SetSRID(ST_MakePoint(e.longitude, e.latitude),4326)::geography,
        (select g from center)::geography,
        ${radius}
      )
    order by distance_m asc
    limit 300;
  `;

  const features: GeoJSON.Feature[] = rows.map((r) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [r.longitude!, r.latitude!] },
    properties: {
      id: r.id, // string πλέον
      name: r.road_name ?? "Οδός",
      municipality: r.municipality ?? "",
      distance_m: Math.round(r.distance_m),
      weekday: r.weekday_iso ?? undefined,
    },
  }));

  const suggestedWindow = mode === "night" ? "21:00 - 04:00" : "14:30 - 16:30";

  const payload = {
    geojson: { type: "FeatureCollection", features },
    count: features.length,
    suggestedWindow,
    mode,
  };

  // Επιστρέφουμε χειροκίνητα JSON με replacer για BigInt
  return new Response(safeStringify(payload), {
    headers: { "content-type": "application/json" },
  });
}
