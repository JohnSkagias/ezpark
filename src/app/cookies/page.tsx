"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Πολιτική Cookies",
//   description: "Πώς χρησιμοποιούμε cookies στο EzPark.",
//   alternates: { canonical: "/cookies" },
// };

export default function CookiesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-12 flex items-center justify-center">
      {/* Subtle animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* large emerald glow */}
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />
        {/* rotating conic gradient ring */}
        <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full opacity-25 blur-xl [background:conic-gradient(from_180deg,rgba(16,185,129,0.25),transparent_35%,rgba(59,130,246,0.15),transparent_70%,rgba(16,185,129,0.25))] [animation:spin_40s_linear_infinite]" />
      </div>

      {/* Card */}
      <div className="
                mx-auto w-full max-w-6xl 
                rounded-[28px] border border-white/15 
                bg-gradient-to-b from-neutral-900/95 to-neutral-950/95 
                shadow-2xl p-6 sm:p-12 text-white
                my-6 md:my-8 lg:my-0
                ">
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
            🍪 Πολιτική Cookies
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
            <h2 className="text-xl sm:text-2xl font-semibold">1. Τι είναι τα Cookies;</h2>
            <p>
              Τα cookies είναι μικρά αρχεία κειμένου που αποθηκεύονται στον browser σας όταν
              επισκέπτεστε έναν ιστότοπο. Χρησιμεύουν για τη σωστή λειτουργία του site,
              τη βελτίωση της εμπειρίας χρήσης και (προαιρετικά) για στατιστικά χρήσης.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">2. Κατηγορίες Cookies</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Απαραίτητα (strictly necessary)</strong> — απαιτούνται για την
                τεχνική λειτουργία του ιστότοπου και δεν απενεργοποιούνται μέσω ρυθμίσεων.
              </li>
              <li>
                <strong>Αναλυτικών/στατιστικών</strong> — μας βοηθούν να κατανοήσουμε πώς
                χρησιμοποιείται ο ιστότοπος (π.χ. συγκεντρωτικά και ανώνυμα metrics).
              </li>
              <li>
                <strong>Λειτουργικότητας</strong> — θυμούνται επιλογές/προτιμήσεις χρήστη
                για καλύτερη εμπειρία.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">3. Τι χρησιμοποιούμε στο EzPark</h2>
            <p>
              Το EzPark χρησιμοποιεί απαραίτητες τεχνολογίες για τη λειτουργία της εφαρμογής.
              Επιπλέον, ενδέχεται να χρησιμοποιούμε <strong>βασικές μετρήσεις επισκεψιμότητας</strong>
              (π.χ. μέσω υπηρεσιών παρόχου φιλοξενίας/analytics) σε συγκεντρωτική, ανώνυμη μορφή,
              αποκλειστικά για βελτιστοποίηση απόδοσης και εμπειρίας χρήσης. Δεν χρησιμοποιούμε
              διαφημιστικά cookies.
            </p>
            <p className="text-white/70 text-sm">
              Σημείωση: αν προσθέσουμε μελλοντικά προαιρετικά cookies (π.χ. analytics με cookies ή
              third-party trackers), θα εμφανίζεται σχετικό banner συναίνεσης και θα ενημερωθεί η
              παρούσα σελίδα.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">4. Γεωτοποθεσία & Local Storage</h2>
            <p>
              Η πρόσβαση στην τοποθεσία σας γίνεται μόνο όταν το επιλέξετε (μέσω του
              σχετικού κουμπιού/άδειας του browser) και χρησιμοποιείται αποκλειστικά για
              να εντοπίσουμε δρόμους στάθμευσης κοντά σας. Η άδεια/άρνηση διαχειρίζεται
              από τον browser σας. Τυχόν προσωρινές ρυθμίσεις (π.χ. τελευταία αναζήτηση)
              μπορεί να αποθηκευτούν τοπικά στη συσκευή σας (local storage) για την
              ευχρηστία της εφαρμογής και δεν αποστέλλονται σε εμάς ως cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">5. Πώς να διαχειριστείτε τα Cookies</h2>
            <p>
              Μπορείτε να ρυθμίσετε τον browser σας ώστε να αποδέχεται, να απορρίπτει ή να
              διαγράφει cookies. Οι οδηγίες διαφέρουν ανά browser (Chrome, Firefox, Safari,
              Edge). Η απενεργοποίηση μη απαραίτητων cookies δεν επηρεάζει τη βασική
              λειτουργία του EzPark.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">6. Αλλαγές στην Πολιτική Cookies</h2>
            <p>
              Ενδέχεται να τροποποιούμε την παρούσα πολιτική για να αντανακλά αλλαγές στις
              τεχνολογίες ή στη νομοθεσία. Οι ενημερώσεις θα δημοσιεύονται σε αυτή τη σελίδα
              με σχετική ημερομηνία.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold">7. Επικοινωνία</h2>
            <p>
              Για ερωτήσεις σχετικά με τα cookies, μπορείτε να επικοινωνήσετε στο:
              📧 <span className="whitespace-nowrap">contactezparkgr@gmail.com</span>
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
