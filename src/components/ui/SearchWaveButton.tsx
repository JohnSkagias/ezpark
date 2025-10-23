"use client";
import { motion, useAnimationControls } from "framer-motion";
import { useState } from "react";

type Props = {
  onWaveDone?: () => void;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  duration?: number;       // ταχύτητα sweep (sec)
  bandWidthPct?: number;   // πόσο μέρος του κουμπιού “καλύπτει” (0..100), default 40
};

export default function SearchWaveButton({
  onWaveDone,
  className,
  children = "Αναζήτηση",
  onClick,
  duration = 0.8,
  bandWidthPct = 40,
}: Props) {
  const controls = useAnimationControls();
  const [running, setRunning] = useState(false);

  const run = async () => {
    if (running) return;
    setRunning(true);
    onClick?.();

    // reset πάντα πριν ξεκινήσει
    await controls.start({ "--x": "-100%", "--a": 0, transition: { duration: 0 } });

    // sweep αριστερά -> δεξιά
    await controls.start({
      "--x": "160%",       // βγάζει πλήρως το band έξω δεξιά
      "--a": 1,            // ορατότητα band
      transition: { duration, ease: [0.45, 0, 0.55, 1] },  // ease-in-out
    });

    // γρήγορο σβήσιμο στο τέλος
    await controls.start({ "--a": 0, transition: { duration: 0.25 } });
    await controls.start({ "--x": "-100%", transition: { duration: 0 } });

    setRunning(false);
    onWaveDone?.();
  };

  return (
    <button
      onClick={run}
      className={[
        "relative overflow-hidden rounded-full w-full px-6 py-3 font-medium",
        "bg-white/10 text-white border border-white/10 backdrop-blur",
        "transition-shadow hover:shadow-[0_0_20px_rgba(255,255,255,.12)]",
        className || ""
      ].join(" ")}
      aria-label="Αναζήτηση"
    >
      {/* BAND: σταθερό πλάτος (<=40%), ξεκινά έξω αριστερά και κινείται δεξιά.
         Το gradient είναι σχεδιασμένο ώστε να “λάμπει” μόνο στο ΔΕΞΙ άκρο,
         και η αριστερή πλευρά να είναι σχεδόν διάφανη (trailing fade). */}
      <motion.span
        animate={controls}
        initial={{ "--x": "-100%", "--a": 0 } as any}
        className="pointer-events-none absolute inset-y-0 rounded-full"
        style={{
          width: `${Math.max(5, Math.min(100, bandWidthPct))}%`, // π.χ. 40%
          transform: "translateX(var(--x))",
          left: 0,
          opacity: "var(--a)" as any,
          // ΜΟΝΟ το δεξί τμήμα είναι έντονο -> πιο “αιχμηρή” μύτη
          background:
            "linear-gradient(90deg," +
            "rgba(255, 255, 255, 0) 0%," +
            "rgba(255, 255, 255, 0.05) 50%," +   // σχεδόν αόρατο στο αριστερό κομμάτι
            "rgba(255, 255, 255, 0.35) 75%," +
            "rgba(255, 255, 255, 0.55) 88%," +
            "rgba(191, 255, 184, 0.5) 96%," +
            "rgba(255, 255, 255, 0) 100%)",
          filter: "blur(0.4px)",           // μαλακές άκρες
        } as React.CSSProperties}
      />
      {children}
    </button>
  );
}
