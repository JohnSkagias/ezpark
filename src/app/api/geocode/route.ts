import { NextResponse } from "next/server";
export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

const ATTICA_VIEWBOX = {
  // περίπου: (left, top, right, bottom)  => (lng_min, lat_max, lng_max, lat_min)
  left: 23.05,
  top: 38.35,
  right: 24.15,
  bottom: 37.55,
};

function buildLabel(r: any) {
  const a = r.address || {};
  // κύρια γραμμή: όνομα entity ή οδός
  const primary =
    r.name ||
    a.road ||
    a.neighbourhood ||
    a.suburb ||
    a.village ||
    a.town ||
    a.city ||
    r.display_name;

  // δεύτερη γραμμή: γειτονιά/συνοικία → δήμος/πόλη
  const hood = a.neighbourhood || a.suburb || a.city_district;
  const muni = a.municipality || a.town || a.city || a.village;
  const secondary = [hood, muni].filter(Boolean).join(" • ");

  return { primary, secondary };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.trim().length < 3) return NextResponse.json({ results: [] });

  const { left, top, right, bottom } = ATTICA_VIEWBOX;
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?format=jsonv2&addressdetails=1&limit=8` +
    `&countrycodes=gr` +
    `&viewbox=${left},${top},${right},${bottom}&bounded=1` + // ΜΟΝΟ μέσα στην Αττική
    `&accept-language=el` +
    `&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "ezpark.dev demo", "Accept-Language": "el" },
  });
  const data = (await res.json()) as Array<any>;

  // Κρατάμε μόνο αποτελέσματα που έχουν τουλάχιστον primary
  const results = data
    .map((r) => {
      const { primary, secondary } = buildLabel(r);
      return {
        primary,
        secondary,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      };
    })
    .filter((x) => !!x.primary);

  return NextResponse.json({ results });
}
