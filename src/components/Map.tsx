"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapProps = {
  geojson?: GeoJSON.FeatureCollection;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
};

export default function Map({ geojson, center = [23.7275, 37.9838], zoom = 12 }: MapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    mapObj.current = new maplibregl.Map({
      container: mapRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center,
      zoom,
    });

    mapObj.current.on("load", () => {
      mapObj.current!.addSource("roads", {
        type: "geojson",
        data: geojson ?? { type: "FeatureCollection", features: [] },
      });
      mapObj.current!.addLayer({
        id: "roads-line",
        type: "line",
        source: "roads",
        paint: { "line-width": 4 },
      });
    });
  }, []);

  useEffect(() => {
    if (!mapObj.current || !geojson) return;
    const src = mapObj.current.getSource("roads") as maplibregl.GeoJSONSource;
    if (src) src.setData(geojson);
  }, [geojson]);

  return <div ref={mapRef} style={{ width: "100%", height: "60vh" }} />;
}
