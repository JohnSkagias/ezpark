"use client";
import { useEffect, useState } from "react";
import { getConsent, onConsentChange, ConsentLevel } from "@/lib/consent";

export default function ConsentGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const cur = getConsent();
    setOk(cur === "all");
    const off = onConsentChange((lvl: ConsentLevel) => setOk(lvl === "all"));
    return off;
  }, []);

  if (!ok) return null;
  return <>{children}</>;
}
