// app/api/geocode/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.trim().length < 3) return NextResponse.json({ results: [] });

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
    q
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "ezpark.dev demo",
      "Accept-Language": "el",
    },
    // cache: "no-store", // αν θέλεις καθόλου caching
  });

  const data = (await res.json()) as Array<any>;

  const results = data.map((r) => ({
    label:
      r.display_name ||
      [r.name, r.address?.road, r.address?.city || r.address?.town || r.address?.village]
        .filter(Boolean)
        .join(", "),
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }));

  return NextResponse.json({ results });
}
