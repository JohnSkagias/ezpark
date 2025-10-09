"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import ResultsList from "../components/ResultsList";

export default function HomePage() {
  const [data, setData] = useState<GeoJSON.FeatureCollection>({ type: "FeatureCollection", features: [] });

  const runSearch = async ({lat, lng, radius}:{lat:number; lng:number; radius:number}) => {
    const res = await fetch(`/api/search?lat=${lat}&lng=${lng}&radius=${radius}`);
    const json = await res.json();
    setData(json.geojson);
  };

  useEffect(() => { runSearch({lat:37.9790,lng:23.7265,radius:2000}); }, []);

  return (
    <main className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Sidebar onSearch={runSearch}/>
        </div>
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl overflow-hidden border">
            <Map geojson={data} />
          </div>
          <ResultsList features={data.features}/>
        </div>
      </div>
    </main>
  );
}
