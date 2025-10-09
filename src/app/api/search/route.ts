import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Row = {
  id: string;
  name: string;
  municipality: string;
  geom_geojson: string | null;
  distance_m: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat") ?? "37.9755");
  const lng = Number(searchParams.get("lng") ?? "23.7348");
  const radius = Number(searchParams.get("radius") ?? "1500"); // μέτρα

  const rows = await prisma.$queryRaw<Row[]>`
    with center as (
      select ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography as g
    )
    select r.id, r.name, r.municipality,
           ST_AsGeoJSON(r.geom)::text as geom_geojson,
           ST_DistanceSphere(r.geom, (select g::geometry from center)) as distance_m
    from roads r
    where ST_DWithin(r.geom::geography, (select g from center), ${radius})
    limit 50;
  `;

  const features: GeoJSON.Feature[] = [];

  for (const r of rows) {
    if (!r.geom_geojson) continue;
    const geom = JSON.parse(r.geom_geojson) as GeoJSON.Geometry;

    features.push({
      type: "Feature",
      geometry: geom,
      properties: {
        id: r.id,
        name: r.name,
        municipality: r.municipality,
        distance_m: Math.round(r.distance_m),
      },
    });
  }

  const fc: GeoJSON.FeatureCollection = { type: "FeatureCollection", features };
  return NextResponse.json({ geojson: fc, count: features.length });
}
