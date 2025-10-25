// components/ui/MapBorderSweep.tsx
"use client";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

export default function MapBorderSweep({
    trigger, radius = 28, thickness = 2, duration = 0.7, fadeOutAfter = 1.0,
}: { trigger: boolean; radius?: number; thickness?: number; duration?: number; fadeOutAfter?: number; }) {
    const ctrl = useAnimationControls();

    useEffect(() => {
        if (!trigger) return;
        (async () => {
            // 1) Κόψε οτιδήποτε animation τρέχει και κάνε άμεσο reset (χωρίς transition)
            ctrl.stop();
            ctrl.set({ "--pos": "-40%", opacity: 1 } as any);

            // 2) Sweep αριστερά -> δεξιά (ίδιες τιμές με πριν)
            await ctrl.start({
                "--pos": "140%",
                transition: { duration, ease: [0.65, 0, 0.55, 1] },
            });

            // 3) Fade out (ίδιες τιμές)
            await ctrl.start({
                opacity: 0,
                transition: { duration: 0.5, delay: Math.max(0, fadeOutAfter - 0.5) },
            });

            // (προαιρετικό) κρατάμε θέση έτοιμη για τον επόμενο κύκλο
            ctrl.set({ "--pos": "-40%" } as any);
        })();
    }, [trigger]); // eslint-disable-line

    return (
        <motion.div
            aria-hidden
            animate={ctrl}
            initial={{ "--pos": "-40%", opacity: 0 } as any}
            className="pointer-events-none absolute inset-0"
            style={{
                borderRadius: `${radius}px`,
                padding: `${thickness}px`,             // πάχος border
                background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 1), transparent)",
                backgroundRepeat: "no-repeat",
                backgroundSize: "60% 100%",
                backgroundPositionX: "var(--pos)",
                // trick για να φαίνεται ΜΟΝΟ το border: content-box XOR border-box
                WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                mask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                maskComposite: "exclude",
                boxShadow: "0 0 28px rgba(0,229,193,.20) inset",
            } as React.CSSProperties}
        />
    );
}
