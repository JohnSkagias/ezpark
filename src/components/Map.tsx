"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapProps = {
  geojson?: GeoJSON.FeatureCollection;
  center?: [number, number];
  zoom?: number;
};

/** Σταθερό id για κάθε feature ώστε Map ↔ Sidebar να “μιλάνε”. */
function makeFeatureId(props: any) {
  const name = (props?.name ?? "").toString().trim();
  const muni = (props?.municipality ?? "").toString().trim();
  // το ίδιο rule θα χρησιμοποιηθεί και στις κάρτες
  return `${name}|${muni}` || Math.random().toString(36).slice(2);
}

/** Μετατρέπει τις γραμμές σε pins (midpoint), και ορίζει __syncedId. */
function toPins(fc: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  const pts: GeoJSON.Feature[] = [];
  for (const f of fc.features) {
    if (f.geometry?.type === "LineString") {
      const coords = (f.geometry.coordinates as number[][]) || [];
      if (coords.length >= 2) {
        const mid = coords[Math.floor(coords.length / 2)];
        const fid = makeFeatureId(f.properties);
        pts.push({
          type: "Feature",
          id: fid, // optional, το promoteId αρκεί – αλλά ας υπάρχει
          geometry: { type: "Point", coordinates: mid },
          properties: { ...(f.properties || {}), __syncedId: fid },
        });
      }
    } else if (f.geometry?.type === "Point") {
      const fid = makeFeatureId(f.properties);
      pts.push({
        type: "Feature",
        id: fid,
        geometry: { type: "Point", coordinates: f.geometry.coordinates as number[] },
        properties: { ...(f.properties || {}), __syncedId: fid },
      });
    }
  }
  return { type: "FeatureCollection", features: pts };
}

function boundsOfCoords(coords: number[][]) {
  let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  if (minLng === maxLng) { minLng -= 0.0008; maxLng += 0.0008; }
  if (minLat === maxLat) { minLat -= 0.0008; maxLat += 0.0008; }
  return [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]];
}

function boundsOfFeatureCollection(fc: GeoJSON.FeatureCollection) {
  let acc: [[number, number], [number, number]] | null = null;
  for (const f of fc.features) {
    if (!f.geometry) continue;
    if (f.geometry.type === "LineString") {
      const b = boundsOfCoords(f.geometry.coordinates as number[][]);
      acc = acc
        ? [[Math.min(acc[0][0], b[0][0]), Math.min(acc[0][1], b[0][1])],
        [Math.max(acc[1][0], b[1][0]), Math.max(acc[1][1], b[1][1])]]
        : b;
    } else if (f.geometry.type === "Point") {
      const [lng, lat] = f.geometry.coordinates as number[];
      const b = boundsOfCoords([[lng, lat], [lng, lat]]);
      acc = acc
        ? [[Math.min(acc[0][0], b[0][0]), Math.min(acc[0][1], b[0][1])],
        [Math.max(acc[1][0], b[1][0]), Math.max(acc[1][1], b[1][1])]]
        : b;
    }
  }
  return acc;
}

export default function Map({
  geojson,
  center = [23.709115, 37.963455],
  zoom = 12,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;
    const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
    mapObj.current = new maplibregl.Map({ container: mapRef.current, style: DARK_STYLE, center, zoom });

    mapObj.current.on("load", () => {
      if (!mapObj.current) return;

      // Γραμμές (όπως είχες)
      mapObj.current.addSource("roads", {
        type: "geojson",
        data: geojson ?? { type: "FeatureCollection", features: [] },
      });
      mapObj.current.addLayer({
        id: "roads-line",
        type: "line",
        source: "roads",
        paint: { "line-width": 2.5, "line-color": "#ffffff", "line-opacity": 0.8 },
        layout: { "line-join": "round", "line-cap": "round" },
      });

      // Pins με promoteId ώστε κάθε feature να έχει σταθερό id
      mapObj.current.addSource("road-pins", {
        type: "geojson",
        promoteId: "__syncedId", // 🔑 κρίσιμο για feature-state
        data: geojson ? toPins(geojson) : { type: "FeatureCollection", features: [] },
      });
      mapObj.current.addLayer({
        id: "road-pins-circle",
        type: "circle",
        source: "road-pins",
        paint: {
          "circle-radius": [
            "case", ["boolean", ["feature-state", "highlight"], false],
            8, // highlighted
            5  // normal
          ],
          "circle-color": [
            "case", ["boolean", ["feature-state", "highlight"], false],
            "#f59e0b", // highlighted
            "#ef4444"  // normal
          ],
        },
      });

      // Click σε pin → popup + flyTo (όπως είχες)
      mapObj.current.on("click", "road-pins-circle", (e) => {
        const feat = e.features?.[0]; if (!feat) return;
        const coords = (feat.geometry as any).coordinates;
        const props = (feat.properties ?? {}) as any;
        const name = props.name || "Οδός";
        const muni = props.municipality || "";
        const q = encodeURIComponent(`${name}, ${muni}`);
        const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
        const html = `
          <div style="font-weight:700;margin-bottom:2px">${name}</div>
          <div style="opacity:.8;margin-bottom:8px">${muni}</div>
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="ezpopup-btn">Open in Google Maps</a>
        `;
        mapObj.current!.flyTo({ center: coords, zoom: 15 });
        new maplibregl.Popup({ closeButton: false, offset: 10, className: "ezpopup" })
          .setLngLat(coords).setHTML(html).addTo(mapObj.current!);
      });

      mapObj.current.on("mouseenter", "road-pins-circle", () => (mapObj.current!.getCanvas().style.cursor = "pointer"));
      mapObj.current.on("mouseleave", "road-pins-circle", () => (mapObj.current!.getCanvas().style.cursor = ""));

      // Hover σε pin → τόνισε pin + ενημέρωσε Sidebar
      let hoveredId: string | number | null = null;
      mapObj.current.on("mousemove", "road-pins-circle", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const id = (f.id ?? (f.properties as any)?.__syncedId) as string | number;
        if (id == null) return;

        if (hoveredId !== id) {
          if (hoveredId !== null) {
            mapObj.current!.setFeatureState({ source: "road-pins", id: hoveredId }, { highlight: false });
          }
          hoveredId = id;
          mapObj.current!.setFeatureState({ source: "road-pins", id }, { highlight: true });
          window.dispatchEvent(new CustomEvent("highlight-card", { detail: { id } }));
        }
      });

      mapObj.current.on("mouseleave", "road-pins-circle", () => {
        if (hoveredId !== null) {
          mapObj.current!.setFeatureState({ source: "road-pins", id: hoveredId }, { highlight: false });
          hoveredId = null;
          window.dispatchEvent(new CustomEvent("unhighlight-card", {}));
        }
      });
    });

    return () => { mapObj.current?.remove(); mapObj.current = null; };
  }, [center, zoom, geojson]);

  // Update data + fitBounds (ίδιο με το δικό σου)
  useEffect(() => {
    if (!mapObj.current || !geojson) return;

    const roadsSrc = mapObj.current.getSource("roads") as maplibregl.GeoJSONSource | undefined;
    const pinsSrc = mapObj.current.getSource("road-pins") as maplibregl.GeoJSONSource | undefined;

    if (roadsSrc) roadsSrc.setData(geojson);
    if (pinsSrc) pinsSrc.setData(toPins(geojson)); // περιέχει __syncedId

    const b = boundsOfFeatureCollection(geojson);
    if (b) {
      mapObj.current.fitBounds(b, {
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        duration: 700,
        maxZoom: 13,
      });
    }
  }, [geojson]);

  // Sidebar → Map: άκου highlight-pin/unhighlight-pin
  useEffect(() => {
    if (!mapObj.current) return;

    const onHi = (e: any) => {
      const id = e.detail?.id;
      if (id == null) return;
      mapObj.current!.setFeatureState({ source: "road-pins", id }, { highlight: true });
    };
    const onUn = (e: any) => {
      const id = e.detail?.id;
      if (id == null) return;
      mapObj.current!.setFeatureState({ source: "road-pins", id }, { highlight: false });
    };

    window.addEventListener("highlight-pin", onHi as EventListener);
    window.addEventListener("unhighlight-pin", onUn as EventListener);
    return () => {
      window.removeEventListener("highlight-pin", onHi as EventListener);
      window.removeEventListener("unhighlight-pin", onUn as EventListener);
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
