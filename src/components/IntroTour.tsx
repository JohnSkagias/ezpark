"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = {
  title: string;
  body: React.ReactNode; // JSX για bullets/underline κ.λπ.
};

type IntroTourProps = {
  open: boolean;
  onClose: () => void; // κλείσιμο (dismiss ή ολοκλήρωση)
};

export default function IntroTour({ open, onClose }: IntroTourProps) {
  const [i, setI] = useState(0);

  const steps: Step[] = useMemo(
    () => [
      {
        title: "Καλώς ήρθες στο EzPark!",
        body: (
          <p className="text-white/80 leading-relaxed">
            Ο σκοπός του EzPark είναι να σε βοηθήσει να βρίσκεις πιο εύκολα parking στην
            Αθήνα και στα προάστια.
          </p>
        ),
      },
      {
        title: "Λειτουργίες",
        body: (
          <ul className="space-y-3 text-white/80 leading-relaxed">
            <li>
              <span className="font-semibold">• Βραδινή Έξοδος:</span>{" "}
              Σου δείχνουμε δρόμους όπου είναι πολύ πιθανό να βρεις θέση για παρκάρισμα σήμερα το βράδυ.{" "}
              <span className="underline font-medium">Προσοχή:</span>{" "}
              Σε ορισμένους από αυτούς τους δρόμους ισχύουν πρωινές κυκλοφοριακές ρυθμίσεις, γι’ αυτό προτείνουμε να έχεις απομακρύνει το όχημά σου μέχρι τις 05:00 το πρωί.
            </li>
            <li>
              <span className="font-semibold">• Μόνιμη Στάθμευση:</span>{" "}
              Σου δείχνουμε προτάσεις δρόμων στους οποίους είναι πιθανό να βρεις να παρκάρεις
              σήμερα το μεσημέρι / απόγευμα. Σε αυτούς τους δρόμους μπορείς συνήθως να
              παρκάρεις για αρκετές μέρες συνεχόμενα.{" "}
              <span className="font-semibold">Προσοχή:</span> Σε κάποιους από αυτούς τους δρόμους ισχύουν συγκεκριμένες ημερήσιες ρυθμίσεις, οπότε έλεγξε την περιοχή αν σκοπεύεις να το αφήσεις για πολλές μέρες.
            </li>
          </ul>
        ),
      },
      {
        title: "Όλα / Συγκεκριμένη Διεύθυνση (Scope)",
        body: (
          <div className="space-y-3 text-white/80 leading-relaxed">
            <p>
              Στη λειτουργία <span className="font-semibold">Όλα</span> θα δεις συνολικά αποτελέσματα για
              δρόμους με πιθανό parking στην Αθήνα και στα προάστια.
            </p>
            <p>
              Πατώντας <span className="font-semibold">Συγκεκριμένη Διεύθυνση</span> μπορείς:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Να γράψεις <span className="font-semibold">όνομα δρόμου, περιοχή, γειτονιά ή
                  μαγαζί</span> και θα δεις αποτελέσματα σε ακτίνα <span className="font-semibold">1km</span>.
              </li>
              <li>
                Να πατήσεις το <span className="font-semibold">κουμπί τοποθεσίας</span> δίπλα
                στη μπάρα αναζήτησης και να βρεις δρόμους κοντά σου (σε ακτίνα{" "}
                <span className="font-semibold">1km</span> από την τρέχουσα τοποθεσία σου).
              </li>
            </ol>
            <p>
              Μέσα από τις <span className="font-semibold">Σύνθετες Επιλογές</span> μπορείς να
              αναζητήσεις για <span className="font-semibold">όλες τις ημέρες της εβδομάδας,</span>{" "}
              ακομα και με <span className="font-semibold">ρυθμιζόμενη ακτίνα</span> από κάποιο σημείο.
            </p>
          </div>
        ),
      },
      {
        title: "Χάρτης & Λίστα Αποτελεσμάτων",
        body: (
          <ul className="space-y-3 text-white/80 leading-relaxed">
            <li>
              Κάνε <span className="font-semibold">zoom</span> και <span className="font-semibold">μετακινήσου</span> στον χάρτη,
              όπου θα δεις <span className="font-semibold">πινέζες</span> με προτάσεις για οδούς.
              Πάτησε πάνω σε μία για λεπτομέριες, και δυνατότητα άμεσης αναζήτησης στους χάρτες πατώντας{" "}
              <span className="font-semibold">Open in Google Maps</span>.
            </li>
            <li>
              Ακόμα, κάνε <span className="font-semibold">scroll</span> στην λίστα κάτω από τον χάρτη, για να δεις
              αναλυτικά όλα τα αποτελέσματα οδών της αναζήτησης σου. <span className="font-semibold">Πάτησε</span> πάνω
              σε ένα από τα στοιχεία της λίστας για να δεις την τοποθεσία του στον χάρτη.
            </li>
          </ul>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    if (!open) setI(0);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (desktop only) */}
          <div
            className="hidden lg:block fixed inset-0 z-[80] bg-black/60"
            onClick={onClose}
          />

          {/* 
            Wrapper:
            - Mobile: fixed top-0, height = 100svh, items-end => κάθεται πάντα ΣΤΟΝ ΠΑΤΟ του visible viewport.
            - Desktop: centered.
          */}
          <div
            className="
              fixed z-[90]
              inset-x-0 top-0 lg:inset-0
              h-[100svh] lg:h-auto
              flex items-end lg:items-center lg:justify-center
              pointer-events-none
            "
          >
            {/* Card (layout-enabled για smooth αλλαγή ύψους/περιεχομένου) */}
            <motion.div
              key="intro-card"
              layout
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
                layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              }}
              className="
                pointer-events-auto
                mx-auto w-full lg:w-[680px]
                rounded-t-3xl lg:rounded-3xl
                bg-[rgba(20,24,22,0.9)] text-white
                backdrop-blur-xl ring-1 ring-white/15 shadow-2xl
                min-h-[auto] max-h-[100svh] lg:max-h-[88vh] overflow-hidden
              "
              style={{
                // στο mobile, να «κάθεται» πάνω από τη safe-area μπάρα
                paddingBottom: "max(16px, env(safe-area-inset-bottom))",
              }}
            >
              {/* Handle (mobile) */}
              <div className="lg:hidden h-5 flex items-center justify-center">
                <span className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>

              {/* Περιεχόμενο ως στήλη: τίτλος/κείμενο πάνω, footer κολλημένο στον πάτο */}
              <motion.div
                layout
                className="px-5 py-6 lg:px-8 lg:py-8 flex flex-col"
                transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
              >
                {/* Τίτλος */}
                <h3 className="text-lg lg:text-xl font-semibold tracking-tight mb-2">
                  {steps[i].title}
                </h3>

                {/* Σώμα step */}
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="text-base"
                  >
                    {steps[i].body}
                  </motion.div>
                </AnimatePresence>

                {/* Footer — πάντα στον πάτο της κάρτας */}
                <motion.div
                  layout
                  className="mt-8 lg:mt-10 flex items-center justify-between pt-2"
                  transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                  style={{ marginTop: "auto" }}
                >
                  <div className="text-xs text-white/55">
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
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}