import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Row = {
  id: string;
  name: string;
  municipality: string;
  geom_geojson: string | null;
  distance_m: number;
  weekday: number;          // 1..7 (ISO)
  start_time: string;       // "HH:mm"
  end_time: string;         // "HH:mm"
  buffer_before_hours: number;
  buffer_after_hours: number;
};

function isoDay(js: number) {
  // JS: 0=Κυρ … 6=Σάβ, ISO: 1=Δευ … 7=Κυρ
  return ((js + 6) % 7) + 1;
}

function parseHM(hhmm: string) {
  // δέχεται "08:00" ή "8:00" κ.λπ.
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return { h: 0, m: 0 };
  const h = Math.min(23, Math.max(0, Number(m[1])));
  const mi = Math.min(59, Math.max(0, Number(m[2])));
  return { h, m: mi };
}

/**
 * Επιστρέφει την επόμενη ημερομηνία (00:00) για τον δοσμένο ISO weekday (1..7)
 * σε σχέση με το now. Αν είναι η ίδια μέρα, γυρνάει "σήμερα".
 */
function nextDateForISO(weekdayISO: number, now: Date): Date {
  const currentISO = isoDay(now.getDay());
  let daysAhead = weekdayISO - currentISO;
  if (daysAhead < 0) daysAhead += 7;
  const dt = new Date(now);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + daysAhead);
  return dt;
}

/**
 * Δομεί start/end Date για την επόμενη εμφάνιση, λαμβάνοντας υπόψη:
 * - αν end < start => περνάει μετά τα μεσάνυχτα
 * - buffers πριν/μετά
 * - αν "σήμερα" αλλά έχει ήδη λήξει => σπρώχνει στην επόμενη εβδομάδα
 */
function buildWindowForRow(row: Row, now: Date): { start: Date; end: Date } {
  let base = nextDateForISO(row.weekday, now); // αρχικά η επόμενη μέρα με αυτό το weekday (μπορεί να είναι σήμερα)
  const { h: sh, m: sm } = parseHM(row.start_time);
  const { h: eh, m: em } = parseHM(row.end_time);

  // start/end στο base date
  let start = new Date(base);
  start.setHours(sh, sm, 0, 0);

  let end = new Date(base);
  end.setHours(eh, em, 0, 0);

  // Αν περνάει μετά τα μεσάνυχτα
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  // Εφάρμοσε buffer
  if (Number.isFinite(row.buffer_before_hours) && row.buffer_before_hours > 0) {
    start = new Date(start.getTime() - row.buffer_before_hours * 3600_000);
  }
  if (Number.isFinite(row.buffer_after_hours) && row.buffer_after_hours > 0) {
    end = new Date(end.getTime() + row.buffer_after_hours * 3600_000);
  }

  // Αν είναι η ίδια εβδομάδα (daysAhead==0 μέσω nextDateForISO) και το παράθυρο έχει ήδη λήξει,
  // τότε μετακίνησέ το στην επόμενη εβδομάδα (δηλ. "επόμενη Παρασκευή" κ.ο.κ.)
  if (end <= now) {
    start = new Date(start.getTime() + 7 * 24 * 3600_000);
    end = new Date(end.getTime() + 7 * 24 * 3600_000);
  }

  return { start, end };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat") ?? "37.9755");
  const lng = Number(searchParams.get("lng") ?? "23.7348");
  const radius = Math.max(50, Number(searchParams.get("radius") ?? "2000")); // μικρό clamp
  const mode = (searchParams.get("mode") ?? "night") as "night" | "long";

  // optional weekday=1..7 από query
  const weekdayParam = searchParams.get("weekday");
  const weekdayNum = weekdayParam ? Number(weekdayParam) : undefined;
  const weekday = (typeof weekdayNum === "number" && !Number.isNaN(weekdayNum))
    ? Math.min(7, Math.max(1, weekdayNum))
    : undefined;

  const now = new Date();
  const todayIso = isoDay(now.getDay());
  const tomorrowIso = todayIso === 7 ? 1 : todayIso + 1;

  // default στόχευση (αν δεν δόθηκε weekday)
  let targetIso = mode === "night" ? tomorrowIso : todayIso;
  if (typeof weekday === "number") targetIso = weekday;

  const rows = await prisma.$queryRaw<Row[]>`
    with center as (
      select ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography as g
    )
    select r.id, r.name, r.municipality,
           ST_AsGeoJSON(r.geom)::text as geom_geojson,
           ST_DistanceSphere(r.geom, (select g::geometry from center)) as distance_m,
           m.weekday, m.start_time, m.end_time,
           m.buffer_before_hours, m.buffer_after_hours
    from roads r
    join markets m on m.road_id = r.id
    where m.weekday = ${targetIso}
      and ST_DWithin(r.geom::geography, (select g from center), ${radius})
    limit 400;
  `;

  // Φιλτράρισμα με βάση το "παράθυρο" της επόμενης εμφάνισης (να μην έχει λήξει)
  const filtered = rows.filter(r => {
    if (!r.geom_geojson) return false;
    const { end } = buildWindowForRow(r, now);
    return end > now;
  });

  const features: GeoJSON.Feature[] = filtered.map(r => {
    const window = buildWindowForRow(r, now);
    return {
      type: "Feature",
      geometry: JSON.parse(r.geom_geojson!) as GeoJSON.Geometry,
      properties: {
        id: r.id,
        name: r.name,
        municipality: r.municipality,
        distance_m: Math.round(r.distance_m),
        market: {
          weekday: r.weekday,
          start: r.start_time,
          end: r.end_time,
          // προαιρετικά εκθέτω το επόμενο παράθυρο που υπολογίσαμε:
          nextStartISO: window.start.toISOString(),
          nextEndISO: window.end.toISOString(),
        },
      },
    };
  });

  const suggestedWindow = mode === "night" ? "21:00 - 04:00" : "16:30 - 18:30";

  return NextResponse.json({
    geojson: { type: "FeatureCollection", features: features as any },
    count: features.length,
    suggestedWindow,
    mode,
  });
}
