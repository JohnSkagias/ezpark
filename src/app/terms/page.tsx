"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Όροι Χρήσης",
  description: "Όροι χρήσης της υπηρεσίας EzPark.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-12 flex items-center justify-center">
      {/* Subtle animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-1/2 h-[860px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-[520px] w-[520px] rounded-full opacity-25 blur-xl [background:conic-gradient(from_90deg,rgba(16,185,129,0.25),transparent_35%,rgba(59,130,246,0.15),transparent_70%,rgba(16,185,129,0.25))] [animation:spin_40s_linear_infinite]" />
      </div>

      {/* Card */}
      <div
        className="
          mx-auto w-full max-w-6xl 
          rounded-[28px] border border-white/15 
          bg-gradient-to-b from-neutral-900/95 to-neutral-950/95 
          shadow-2xl p-6 sm:p-12 text-white
          my-6 md:my-8 lg:my-0
        "
      >
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Επιστροφή στην αρχική
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-2">
            🧾 Όροι Χρήσης
          </h1>
          <p className="text-sm text-white/70 mt-2">Τελευταία ενημέρωση: Οκτώβριος 2025</p>
        </header>

        {/* Content */}
        <article
          className="
            space-y-10
            prose prose-invert max-w-none
            prose-headings:text-emerald-400
            prose-p:whitespace-normal prose-p:break-words prose-p:overflow-visible
            prose-li:whitespace-normal prose-li:break-words prose-li:overflow-visible
            prose-p:[text-overflow:clip] prose-li:[text-overflow:clip]
          "
        >
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">1. Αποδοχή Όρων</h2>
            <p>Χρησιμοποιώντας την υπηρεσία EzPark, συμφωνείτε με τους παρόντες όρους.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">2. Πνευματικά Δικαιώματα</h2>
            <p>
              Όλο το περιεχόμενο (λογότυπα, κείμενα, γραφικά, σχεδιασμός) ανήκει στο EzPark και
              προστατεύεται από τη νομοθεσία περί πνευματικών δικαιωμάτων. Απαγορεύεται η αντιγραφή,
              αναπαραγωγή ή αναδημοσίευση χωρίς προηγούμενη γραπτή άδεια.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">3. Περιορισμός Ευθύνης</h2>
            <p>
              Η υπηρεσία παρέχεται «ως έχει». Το EzPark δεν εγγυάται την ακρίβεια, διαθεσιμότητα ή
              εγκυρότητα των πληροφοριών που εμφανίζονται στην πλατφόρμα. Η χρήση της υπηρεσίας γίνεται
              αποκλειστικά με ευθύνη του χρήστη. Η EzPark δεν φέρει καμία ευθύνη για οποιαδήποτε ζημία,
              απώλεια ή έξοδο που ενδέχεται να προκύψει από: τυχόν λανθασμένες ή ελλιπείς πληροφορίες
              σχετικά με τη διαθεσιμότητα στάθμευσης, την παράνομη ή αντικανονική στάθμευση του οχήματος
              του χρήστη, την επιβολή προστίμων, τη ρυμούλκηση ή οποιαδήποτε άλλη διοικητική ή αστική
              κύρωση που μπορεί να επιβληθεί από τις αρμόδιες αρχές.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">4. Τροποποιήσεις</h2>
            <p>
              Το EzPark διατηρεί το δικαίωμα να τροποποιεί τους παρόντες όρους οποιαδήποτε στιγμή. Οι
              αλλαγές ισχύουν από τη δημοσίευσή τους στο ezpark.gr.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">5. Επικοινωνία</h2>
            <p>Για οποιαδήποτε απορία, μπορείτε να επικοινωνήσετε στο: 📧 contactezparkgr@gmail.com</p>
          </section>

          {/* ΝΕΟ: σαφής αναφορά σε γεωτοποθεσία & παραπομπή στην πολιτική απορρήτου */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">
              6. Γεωτοποθεσία & Πολιτική Απορρήτου
            </h2>
            <p>
              Η υπηρεσία μπορεί να ζητήσει πρόσβαση στην τρέχουσα τοποθεσία σας αποκλειστικά για να
              εμφανίσει «φιλικούς» δρόμους στάθμευσης κοντά σας. Η πρόσβαση πραγματοποιείται μόνο
              με ρητή άδεια του browser σας και μπορείτε να την ανακαλέσετε ανά πάσα στιγμή από τις
              ρυθμίσεις του. Η χρήση και τυχόν επεξεργασία των δεδομένων σας γίνεται σύμφωνα με την
              <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 ml-1">Πολιτική Απορρήτου</Link>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
