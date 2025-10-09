"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapProps = {
  geojson?: GeoJSON.FeatureCollection;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
};

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

    mapObj.current.on("load", () => {
      if (!mapObj.current) return;
      // add source + layer if not present
      if (!mapObj.current.getSource("roads")) {
        mapObj.current.addSource("roads", {
          type: "geojson",
          data: geojson ?? { type: "FeatureCollection", features: [] },
        });
        mapObj.current.addLayer({
          id: "roads-line",
          type: "line",
          source: "roads",
          paint: { "line-width": 4, "line-color": "#ffffff" },
        });
      }
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

    const src = mapObj.current.getSource("roads") as maplibregl.GeoJSONSource | undefined;
    if (src && typeof src.setData === "function") {
      src.setData(geojson);
    } else {
      // if the source was removed for some reason, re-add it and the layer
      if (mapObj.current && mapObj.current.isStyleLoaded()) {
        if (!mapObj.current.getSource("roads")) {
          mapObj.current.addSource("roads", { type: "geojson", data: geojson });
        }
        if (!mapObj.current.getLayer("roads-line")) {
          mapObj.current.addLayer({ id: "roads-line", type: "line", source: "roads", paint: { "line-width": 4, "line-color": "#ffffff" } });
        }
      }
    }
  }, [geojson]);

  return <div ref={mapRef} style={{ width: "100%", height: "70vh" }} />;
}
