"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
            🔒 Πολιτική Απορρήτου
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
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">1. Ποια δεδομένα συλλέγουμε</h2>
            <p>
              Όταν το επιλέξετε (π.χ. πατώντας «Χρήση τρέχουσας τοποθεσίας» ή αποδεχόμενοι σχετικό prompt),
              ο browser σας μπορεί να μας παρέχει την τρέχουσα γεωτοποθεσία σας. Χρησιμοποιούμε τη
              γεωτοποθεσία αποκλειστικά για την παροχή της λειτουργικότητας του EzPark (εύρεση δρόμων
              στάθμευσης κοντά σας) και δεν την αποθηκεύουμε μόνιμα στον server μας.
            </p>
            <p className="text-white/80">
              Επιπλέον, το EzPark χρησιμοποιεί <strong>Vercel Analytics</strong> για ανώνυμες και συγκεντρωτικές
              μετρήσεις επισκεψιμότητας/απόδοσης (χωρίς αναγνώριση ταυτότητας χρήστη).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">2. Cookies</h2>
            <p>
              Το ezpark.gr δεν χρησιμοποιεί διαφημιστικά cookies. Ενδέχεται να χρησιμοποιούνται μόνο
              τεχνικά απαραίτητες τεχνολογίες για τη βασική λειτουργία της εφαρμογής. Για λεπτομέρειες,
              δείτε την <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300">Πολιτική Cookies</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">3. Πώς τα αποθηκεύουμε/μοιραζόμαστε</h2>
            <p>
              Φιλοξενούμε την υπηρεσία σε αξιόπιστους παρόχους υποδομής. Τα δεδομένα επεξεργάζονται μόνο
              όπου είναι απαραίτητο για την παροχή της υπηρεσίας. Δεν πουλάμε προσωπικά δεδομένα. Αν
              χρησιμοποιούνται τρίτοι πάροχοι (π.χ. Vercel για hosting/analytics, Supabase για βάση
              δεδομένων), ενεργούν ως εκτελούντες την επεξεργασία σύμφωνα με οδηγίες μας.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">4. Σκοπός χρήσης των δεδομένων</h2>
            <p>
              Η γεωτοποθεσία και τυχόν παράμετροι αναζήτησης χρησιμοποιούνται αποκλειστικά για να
              εμφανιστούν σχετικά αποτελέσματα στάθμευσης κοντά σας. Οι ανώνυμες μετρήσεις απόδοσης
              χρησιμοποιούνται για βελτιστοποίηση ταχύτητας και εμπειρίας χρήσης.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">5. Επικοινωνία</h2>
            <p>
              Αν έχετε οποιαδήποτε ερώτηση σχετικά με την πολιτική απορρήτου, επικοινωνήστε στο:
              📧 contactezparkgr@gmail.com
            </p>
          </section>

          {/* ΝΕΑ τμήματα: δικαιώματα & αλλαγές πολιτικής */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">6. Τα δικαιώματά σας</h2>
            <p>
              Μπορείτε να ζητήσετε ενημέρωση για τα δεδομένα που τηρούμε, διόρθωση ή διαγραφή τους, όπου
              εφαρμόζεται. Επίσης, μπορείτε να ανακαλέσετε τη συγκατάθεσή σας για γεωτοποθεσία από τις
              ρυθμίσεις του browser σας ανά πάσα στιγμή.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400">7. Αλλαγές στην Πολιτική</h2>
            <p>
              Ενδέχεται να τροποποιούμε την παρούσα πολιτική όταν αλλάζουν οι τεχνολογίες ή η νομοθεσία.
              Οι ενημερώσεις θα δημοσιεύονται σε αυτή τη σελίδα με σχετική ημερομηνία.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
