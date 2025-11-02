// /lib/consent.ts
export type ConsentLevel = "all" | "necessary";

const KEY = "ezp_consent";
const EVT = "ezp-consent-changed";

export function getConsent(): ConsentLevel | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "all" || v === "necessary" ? v : null;
}

export function setConsent(level: ConsentLevel) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, level);
  window.dispatchEvent(new CustomEvent(EVT, { detail: { level } }));
}

export function onConsentChange(cb: (level: ConsentLevel) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.level) cb(detail.level);
  };
  window.addEventListener(EVT as any, handler);
  return () => window.removeEventListener(EVT as any, handler);
}

/** Utility για άνοιγμα banner απ’ οπουδήποτε */
export function openConsentBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ezp-open-consent"));
}
