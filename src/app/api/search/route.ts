import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Row = {
  id: string;
  name: string;
  municipality: string;
  geom_geojson: string | null;
  distance_m: number;
  weekday: number;
  start_time: string;
  end_time: string;
};

function isoDay(js: number) { return ((js + 6) % 7) + 1; }

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
      select ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography as g
    )
    select r.id, r.name, r.municipality,
           ST_AsGeoJSON(r.geom)::text as geom_geojson,
           ST_DistanceSphere(r.geom, (select g::geometry from center)) as distance_m,
           m.weekday, m.start_time, m.end_time
    from roads r
    join markets m on m.road_id = r.id
    where m.weekday = ${targetIso}
      and ST_DWithin(r.geom::geography, (select g from center), ${radius})
    limit 200;
  `;

  const features: GeoJSON.Feature[] = rows
    .filter(r => r.geom_geojson)
    .map(r => ({
      type: "Feature",
      geometry: JSON.parse(r.geom_geojson!) as GeoJSON.Geometry,
      properties: {
        id: r.id,
        name: r.name,
        municipality: r.municipality,
        distance_m: Math.round(r.distance_m),
        market: { weekday: r.weekday, start: r.start_time, end: r.end_time },
      },
    }));

  const suggestedWindow = mode === "night" ? "21:00 - 04:00" : "16:30 - 18:30";

  return NextResponse.json({
    geojson: { type: "FeatureCollection", features: features as any },
    count: features.length,
    suggestedWindow,
    mode,
  });
}
