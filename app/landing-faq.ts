/**
 * Homepage FAQ — single source of truth.
 *
 * Rendered by the client hero (`app/HomeClient.tsx`) and emitted as `FAQPage`
 * structured data by the server page (`app/page.tsx`). Icons are stored as
 * string keys so this module stays plain data (importable from a server
 * component without pulling client/lucide code into the server bundle).
 */
export type LandingFaqIconName =
  | "shield"
  | "campus"
  | "help"
  | "clock"
  | "parents"
  | "mobile"

export type LandingFaqItem = {
  icon: LandingFaqIconName
  question: string
  answer: string
}

export const LANDING_FAQ_ITEMS: LandingFaqItem[] = [
  {
    icon: "shield",
    question: "How is learner data kept safe?",
    answer:
      "Role-based access—bursars see fees, teachers see their classes, and only admins export full registers. Data is encrypted in transit and backed up daily.",
  },
  {
    icon: "campus",
    question: "Can we run more than one campus?",
    answer:
      "Yes. Run your main school and a satellite campus separately—each with its own classes and fee structures—while your principal sees consolidated reports.",
  },
  {
    icon: "help",
    question: "Do we get help during setup?",
    answer:
      "Yes. Support through your first onboarding week—import your existing student list, train the bursar, and go live before parents' reporting day.",
  },
  {
    icon: "clock",
    question: "How fast can we go live?",
    answer:
      "Most schools import learners and start fee collection within the first two weeks of a term. You do not need a six-month IT project.",
  },
  {
    icon: "parents",
    question: "How do parents get updates?",
    answer:
      "Fee receipts, absence alerts, and exam reminders by SMS—the channel parents already check. A parent portal is optional, not required.",
  },
  {
    icon: "mobile",
    question: "Can staff use phones?",
    answer:
      "Teachers mark attendance and view class lists in the browser on any phone. The bursar can reconcile M-Pesa from mobile or desktop.",
  },
]
