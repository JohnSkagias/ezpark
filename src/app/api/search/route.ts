// app/api/search/route.ts
import { prisma } from "../../../../lib/prisma";
export const runtime = 'nodejs';

// ----- helpers -----
type Row = {
  id: string;
  road_name: string | null;
  municipality: string | null;
  latitude: number | null;
  longitude: number | null;
  weekday_iso: number | null;
  distance_m: number;
  permanent: boolean | null;
  season_start: string | null;
  season_end: string | null;
};

function isoDay(js: number) {
  // JS: 0=Sun..6=Sat -> ISO: 1=Mon..7=Sun
  return ((js + 6) % 7) + 1;
}
const nextIso = (d: number) => (d === 7 ? 1 : d + 1);


function safeStringify(obj: unknown) {
  return JSON.stringify(obj, (_, v) =>
    typeof v === "bigint" ? v.toString() : v
  );
}

// season parsing: "YYYY/MM/DD" -> {m,d}  (αγνοούμε το έτος)
// αν το string είναι άκυρο/κενό -> return null
function parseSeasonMD(s: string | null): { m: number; d: number } | null {
  if (!s) return null;
  // επιτρέπουμε μορφές με '-' ή '/' ή ' ' κ.λπ.: κρατάμε μόνο ψηφία
  const parts = s.trim().split(/[\/\-\.\s]+/).filter(Boolean);
  if (parts.length < 3) return null;
  // τελευταία 2 είναι μήνας/ημέρα (οι πηγές σου: YYYY/MM/DD)
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { m, d };
}

// true αν target (m,d) είναι μέσα στο [start,end] αγνοώντας έτος
// υποστηρίζει wrap π.χ. 07/12 -> 03/20
function inSeason(target: { m: number; d: number }, start: { m: number; d: number }, end: { m: number; d: number }): boolean {
  const code = target.m * 100 + target.d;
  const s = start.m * 100 + start.d;
  const e = end.m * 100 + end.d;

  if (s <= e) {
    // κανονικό εύρος εντός ίδιου έτους
    return code >= s && code <= e;
  } else {
    // wrap στο νέο έτος (π.χ. 10/15..03/20)
    return code >= s || code <= e;
  }
}

// επιστρέφει την ΗΜΕΡΟΜΗΝΙΑ που θα χρησιμοποιήσουμε για seasonal check,
// ανάλογα με mode + optional weekdayOverride
function getTargetDate(mode: "night" | "long", weekdayOverride?: number): Date {
  const now = new Date(); // τοπική ώρα server
  // αν υπάρχει override: υπολόγισε την επόμενη ημερομηνία που αντιστοιχεί σ’ αυτό το ISO day
  if (typeof weekdayOverride === "number") {
    // βρες πόσες μέρες να προσθέσεις από σήμερα για να πας στη συγκεκριμένη ISO μέρα
    const todayIso = isoDay(now.getDay());
    // αν mode=night -> χρειαζόμαστε την ΕΠΟΜΕΝΗ μέρα του override
    const targetIso = mode === "night" ? nextIso(weekdayOverride) : weekdayOverride;
    let diff = targetIso - todayIso;
    if (diff < 0) diff += 7;
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return d;
  }

  // αλλιώς, βασικός κανόνας: night -> αύριο, long -> σήμερα
  if (mode === "night") {
    const d = new Date(now);
    d.setDate(now.getDate() + 1);
    return d;
  }
  return now;
}

// ----- handler -----
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat") ?? "37.9755");
  const lng = Number(searchParams.get("lng") ?? "23.7348");
  const radius = Number(searchParams.get("radius") ?? "2000");
  const mode = (searchParams.get("mode") ?? "night") as "night" | "long";

  // weekday (1..7) προαιρετικό
  const weekdayParam = searchParams.get("weekday");
  let weekdayOverride: number | undefined;
  if (weekdayParam !== null) {
    const n = Number(weekdayParam);
    if (!Number.isNaN(n) && n >= 1 && n <= 7) weekdayOverride = n;
  }

  // Ημερομηνία target για seasonal check
  const targetDate = getTargetDate(mode, weekdayOverride);
  const targetMD = { m: targetDate.getMonth() + 1, d: targetDate.getDate() };

  // ISO day που θα χρησιμοποιήσουμε στο weekday filter του SQL
  // (αν υπάρχει weekdayOverride, το API λογικά φιλτράρει βάσει του
  // "τελικού" ISO που αντιστοιχεί στην ημέρα που θέλουμε να δούμε στον χάρτη)
  const todayIso = isoDay(new Date().getDay());
  const tomorrowIso = todayIso === 7 ? 1 : todayIso + 1;
  const nextIsoVal = (d: number) => (d === 7 ? 1 : d + 1);

  const targetIso: number =
    typeof weekdayOverride === "number"
      ? (mode === "night" ? nextIsoVal(weekdayOverride) : weekdayOverride)
      : (mode === "night" ? tomorrowIso : todayIso);

  // SQL: κρατάμε φιλτράρισμα για απόσταση + weekday,
  // και φέρνουμε και τα πεδία season/permanent για post-filter στο Node
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
      e.permanent,
      e.season_start,
      e.season_end,
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
    limit 500;
  `;

  // Seasonal post-filter
  const filtered = rows.filter((r) => {
    if (r.permanent === true) return true; // μόνιμο -> πάντα μέσα
    const s = parseSeasonMD(r.season_start);
    const e = parseSeasonMD(r.season_end);
    if (!s || !e) return true; // αν λείπουν σεζόν πεδία, θεωρούμε «ενεργό» (ή άλλαξε το σε false αν προτιμάς)
    return inSeason(targetMD, s, e);
  });

  const features: GeoJSON.Feature[] = filtered.map((r) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [r.longitude!, r.latitude!] },
    properties: {
      id: r.id,
      name: r.road_name ?? "Οδός",
      municipality: r.municipality ?? "",
      distance_m: Math.round(r.distance_m),
      weekday: r.weekday_iso ?? undefined,
      permanent: r.permanent ?? false,
      season_start: r.season_start ?? undefined,
      season_end: r.season_end ?? undefined,
    },
  }));

  const suggestedWindow = mode === "night" ? "21:00 - 04:00" : "14:30 - 16:30";
  const payload = {
    geojson: { type: "FeatureCollection", features },
    count: features.length,
    suggestedWindow,
    mode,
  };
  return new Response(safeStringify(payload), { headers: { "content-type": "application/json" } });
}
