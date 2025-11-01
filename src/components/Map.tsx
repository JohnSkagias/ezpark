"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// αλλαγή τύπου props
type MapProps = {
  geojson?: GeoJSON.FeatureCollection;
  center?: [number, number];
  zoom?: number;
  focus?: { coords: [number, number]; props?: any } | null; // ⬅️ ΝΕΟ
  userLocation?: [number, number] | null;
};


function toPins(fc: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  const pts: GeoJSON.Feature[] = [];
  for (const f of fc.features) {
    if (!f.geometry) continue;
    if (f.geometry.type === "LineString") {
      const coords = f.geometry.coordinates as number[][];
      if (coords.length >= 2) {
        const mid = coords[Math.floor(coords.length / 2)];
        pts.push({ type: "Feature", geometry: { type: "Point", coordinates: mid }, properties: f.properties });
      }
    } else if (f.geometry.type === "Point") {
      // αν ήδη είναι point, χρησιμοποίησέ το όπως είναι
      pts.push(f);
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
  // Αν είναι μηδενικού εμβαδού, άνοιξε λίγο
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



export default function Map({ geojson, center = [23.709115, 37.963455], zoom = 12, focus = null, userLocation = null }: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<maplibregl.Map | null>(null);

  const applyUserLocation = (map: maplibregl.Map, loc: [number, number] | null) => {
    const src = map.getSource("user-loc") as maplibregl.GeoJSONSource | undefined;
    if (!src) return false; // πες στον caller ότι «δεν υπήρχε source ακόμη»

    if (loc) {
      const [lng, lat] = loc;
      const fc: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: {} }]
      };
      src.setData(fc);
      map.setLayoutProperty("user-loc-halo", "visibility", "visible");
      map.setLayoutProperty("user-loc-dot", "visibility", "visible");
    } else {
      src.setData({ type: "FeatureCollection", features: [] } as any);
      map.setLayoutProperty("user-loc-halo", "visibility", "none");
      map.setLayoutProperty("user-loc-dot", "visibility", "none");
    }
    return true;
  };


  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;
    const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
    mapObj.current = new maplibregl.Map({ container: mapRef.current, style: DARK_STYLE, center, zoom });

    mapObj.current.on("load", () => {
      if (!mapObj.current) return;
      mapObj.current.addSource("roads", { type: "geojson", data: geojson ?? { type: "FeatureCollection", features: [] } });
      mapObj.current.addLayer({
        id: "roads-line",
        type: "line",
        source: "roads",
        paint: { "line-width": 2.5, "line-color": "#ffffff", "line-opacity": 0.8 },
        layout: { "line-join": "round", "line-cap": "round" },
      });

      mapObj.current.addSource("road-pins", { type: "geojson", data: geojson ? toPins(geojson) : { type: "FeatureCollection", features: [] } });
      mapObj.current.addLayer({ id: "road-pins-circle", type: "circle", source: "road-pins", paint: { "circle-radius": 5, "circle-color": "#ef4444" } });

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

      // --- USER LOCATION SOURCE + LAYERS ---
      mapObj.current.addSource("user-loc", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });
      mapObj.current.addLayer({
        id: "user-loc-halo",
        type: "circle",
        source: "user-loc",
        paint: {
          "circle-radius": 26,
          "circle-color": "rgba(59,130,246,0.18)", // απαλό μπλε halo
          "circle-blur": 0.2
        },
        layout: { visibility: "none" }
      });
      mapObj.current.addLayer({
        id: "user-loc-dot",
        type: "circle",
        source: "user-loc",
        paint: {
          "circle-radius": 7,
          "circle-color": "#1D4ED8",     // μπλε κουκίδα
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3
        },
        layout: { visibility: "none" }
      });

      // Αν έχουμε ήδη θέση από το parent τη στιγμή που φορτώθηκε το style, εφάρμοσέ την
      if (userLocation) {
        applyUserLocation(mapObj.current!, userLocation);
      }

      mapObj.current.on("mouseenter", "road-pins-circle", () => (mapObj.current!.getCanvas().style.cursor = "pointer"));
      mapObj.current.on("mouseleave", "road-pins-circle", () => (mapObj.current!.getCanvas().style.cursor = ""));
    });

    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, []);  //[center, zoom, geojson]

  const lastBoundsRef = useRef<[[number, number], [number, number]] | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapObj.current || !geojson) return;

    const map = mapObj.current;
    const roadsSrc = map.getSource("roads") as maplibregl.GeoJSONSource | undefined;
    const pinsSrc = map.getSource("road-pins") as maplibregl.GeoJSONSource | undefined;

    // 1) ενημέρωσε ΠΡΩΤΑ τα sources (ένα repaint)
    if (roadsSrc) roadsSrc.setData(geojson);
    if (pinsSrc) pinsSrc.setData(toPins(geojson));

    // 2) υπολόγισε bounds & αν είναι ίδια με τα προηγούμενα, μην κάνεις τίποτα
    const b = boundsOfFeatureCollection(geojson);
    if (!b) return;

    const sameBounds =
      lastBoundsRef.current &&
      lastBoundsRef.current[0][0] === b[0][0] &&
      lastBoundsRef.current[0][1] === b[0][1] &&
      lastBoundsRef.current[1][0] === b[1][0] &&
      lastBoundsRef.current[1][1] === b[1][1];

    if (sameBounds) return; // αποφυγή δεύτερου fit στο ίδιο extent

    lastBoundsRef.current = b;

    // 3) κάνε ΕΝΑ fitBounds στο επόμενο frame (ακυρώνουμε τυχόν προηγούμενο)
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      map.fitBounds(b, {
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        duration: 700,
        maxZoom: 14,
      });
    });

    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [geojson]);

  // focus από έξω (λίστα) → flyTo + popup
  useEffect(() => {
    if (!mapObj.current || !focus) return;
    const map = mapObj.current;

    const props = (focus.props ?? {}) as any;
    const name = props.name || "Οδός";
    const muni = props.municipality || "";
    const q = encodeURIComponent(`${name}, ${muni}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    const html = `
    <div style="font-weight:700;margin-bottom:2px">${name}</div>
    <div style="opacity:.8;margin-bottom:8px">${muni}</div>
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="ezpopup-btn">Open in Google Maps</a>
  `;

    map.flyTo({ center: focus.coords, zoom: 15 });
    new maplibregl.Popup({ closeButton: false, offset: 10, className: "ezpopup" })
      .setLngLat(focus.coords).setHTML(html).addTo(map);
  }, [focus]);


  useEffect(() => {
    if (!mapObj.current) return;
    const map = mapObj.current;

    // προσπάθησε τώρα
    if (applyUserLocation(map, userLocation || null)) return;
    

    // αν δεν υπάρχει ακόμη το source, περίμενε το επόμενο 'styledata' και ξαναπροσπάθησε
    const onStyleData = () => {
      if (applyUserLocation(map, userLocation || null)) {
        map.off("styledata", onStyleData);
      }
    };
    map.on("styledata", onStyleData);

    return () => {
      map.off("styledata", onStyleData);
    };
  }, [userLocation]);




  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
