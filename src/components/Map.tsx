"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapProps = {
  geojson?: GeoJSON.FeatureCollection;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
};

function toPins(fc: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  const pts: GeoJSON.Feature[] = [];
  for (const f of fc.features) {
    if (f.geometry?.type === "LineString") {
      const coords = (f.geometry.coordinates as number[][]) || [];
      if (coords.length >= 2) {
        const mid = coords[Math.floor(coords.length / 2)];
        pts.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: mid },
          properties: f.properties,
        });
      }
    }
  }
  return { type: "FeatureCollection", features: pts };
}


export default function Map({ geojson, center = [23.709115, 37.963455], zoom = 12 }: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    // Dark style (Carto Dark Matter)
    const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

    mapObj.current = new maplibregl.Map({
      container: mapRef.current,
      style: DARK_STYLE,
      center,
      zoom,
    });

    // mapObj.current.on("load", () => {
    //   if (!mapObj.current) return;
    //   // add source + layer if not present
    //   if (!mapObj.current.getSource("roads")) {
    //     mapObj.current.addSource("roads", {
    //       type: "geojson",
    //       data: geojson ?? { type: "FeatureCollection", features: [] },
    //     });
    //     mapObj.current.addLayer({
    //       id: "roads-line",
    //       type: "line",
    //       source: "roads",
    //       paint: { "line-width": 4, "line-color": "#ffffff" },
    //     });
    //   }
    // });
    mapObj.current.on("load", () => {
      if (!mapObj.current) return;
      mapObj.current!.addSource("roads", {
        type: "geojson",
        data: geojson ?? { type: "FeatureCollection", features: [] },
      });
      mapObj.current!.addLayer({
        id: "roads-line",
        type: "line",
        source: "roads",
        paint: {
          "line-width": 2.5,
          "line-color": "#ffffff",
          "line-opacity": 0.8,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
      });


      // NEW: pins
      mapObj.current!.addSource("road-pins", {
        type: "geojson",
        data: geojson ? toPins(geojson) : { type: "FeatureCollection", features: [] },
      });
      mapObj.current!.addLayer({
        id: "road-pins-circle",
        type: "circle",
        source: "road-pins",
        paint: { "circle-radius": 5, "circle-color": "#ef4444" }, // κόκκινο pin
      });

      // click → flyTo + μικρό popup
      mapObj.current!.on("click", "road-pins-circle", (e) => {
        const feat = e.features?.[0];
        if (!feat) return;

        const coords = (feat.geometry as any).coordinates;
        const props = (feat.properties ?? {}) as any;
        const name = props.name || "Οδός";
        const muni = props.municipality || "";

        const q = encodeURIComponent(`${name}, ${muni}`);
        const url = `https://www.google.com/maps/search/?api=1&query=${q}`;

        const html = `
          <div style="font-weight:700;margin-bottom:2px">${name}</div>
          <div style="opacity:.8;margin-bottom:8px">${muni}</div>
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="ezpopup-btn">
            Open in Google Maps
          </a>
        `;


        mapObj.current!.flyTo({ center: coords, zoom: 15 });
        new maplibregl.Popup({ closeButton: false, offset: 10, className: "ezpopup" })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(mapObj.current!);
      });


      mapObj.current!.on("mouseenter", "road-pins-circle", () => (mapObj.current!.getCanvas().style.cursor = "pointer"));
      mapObj.current!.on("mouseleave", "road-pins-circle", () => (mapObj.current!.getCanvas().style.cursor = ""));
    });


    // cleanup on unmount
    return () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    };
  }, [center, zoom, geojson]);

  useEffect(() => {
    if (!mapObj.current || !geojson) return;
    const roadsSrc = mapObj.current.getSource("roads") as maplibregl.GeoJSONSource;
    const pinsSrc = mapObj.current.getSource("road-pins") as maplibregl.GeoJSONSource;
    if (roadsSrc) roadsSrc.setData(geojson);
    if (pinsSrc) pinsSrc.setData(toPins(geojson));
  }, [geojson]);


  return <div ref={mapRef} style={{ width: "100%", height: "70vh" }} />;
}
