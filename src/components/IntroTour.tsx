"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = {
  title: string;
  body: string;
};

type IntroTourProps = {
  open: boolean;
  onClose: () => void;          // κλείσιμο (dismiss ή ολοκλήρωση)
};

export default function IntroTour({ open, onClose }: IntroTourProps) {
  const [i, setI] = useState(0);

  // περιεχόμενο βημάτων (κράτα το λιτό)
  const steps: Step[] = useMemo(
    () => [
      {
        title: "Καλώς ήρθες στο ezpark.gr",
        body:
          "Βρες ‘φιλικούς’ δρόμους για στάθμευση στην Αθήνα. Διάλεξε λειτουργία και προαιρετικά εβδομάδα/ακτίνα.",
      },
      {
        title: "Δύο λειτουργίες",
        body:
          "• Βραδινή Έξοδος: προτείνει για σήμερα/σήμερα βράδυ.\n• Μόνιμη Στάθμευση: σταθερά, χωρίς λαϊκές/αγορές να σε επηρεάζουν.",
      },
      {
        title: "Χάρτης & Λίστα",
        body:
          "Τα αποτελέσματα εμφανίζονται στον χάρτη (pins) και σε λίστα. Κλικ στο pin ή στη λίστα για λεπτομέρειες/Google Maps.",
      },
    ],
    []
  );

  useEffect(() => {
    if (!open) setI(0);
  }, [open]);

  // Responsive layout: mobile = bottom sheet, desktop = centered modal
  // Backdrop δείχνει μόνο σε desktop (για να μη βαραίνει το mobile)
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (desktop only) */}
          <div className="hidden lg:block fixed inset-0 z-[80] bg-black/60" onClick={onClose} />

          {/* Container */}
          <div
            className="
              fixed z-[90]
              inset-x-0 bottom-0 lg:inset-0
              flex lg:items-center lg:justify-center
              pointer-events-none
            "
          >
            <motion.div
              key="intro-card"
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="
                pointer-events-auto
                mx-auto w-full lg:w-[560px]
                rounded-t-3xl lg:rounded-3xl
                bg-[rgba(20,24,22,0.86)] text-white
                backdrop-blur-xl ring-1 ring-white/15
                shadow-2xl
              "
            >
              {/* Handle (mobile) */}
              <div className="lg:hidden h-5 flex items-center justify-center">
                <span className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>

              {/* Content */}
              <div className="px-5 py-4 lg:px-6 lg:py-6">
                <h3 className="text-lg font-semibold tracking-tight mb-2">{steps[i].title}</h3>
                <p className="whitespace-pre-line text-white/80 leading-relaxed">{steps[i].body}</p>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xs text-white/50">
                    Βήμα {i + 1} / {steps.length}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onClose}
                      className="px-3 py-2 rounded-full text-sm bg-white/10 hover:bg-white/15 ring-1 ring-white/15"
                    >
                      Παράλειψη
                    </button>
                    {i > 0 && (
                      <button
                        onClick={() => setI((n) => Math.max(0, n - 1))}
                        className="px-3 py-2 rounded-full text-sm bg-white/10 hover:bg-white/15 ring-1 ring-white/15"
                      >
                        Πίσω
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (i < steps.length - 1) setI((n) => n + 1);
                        else onClose();
                      }}
                      className="px-3 py-2 rounded-full text-sm bg-emerald-600/85 hover:bg-emerald-600"
                    >
                      {i < steps.length - 1 ? "Επόμενο" : "Τέλος"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
