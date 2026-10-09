import { LegalDocument } from "@/components/legal/LegalDocument";
import { LEGAL_META } from "@/lib/legal/legal-meta";

const SECTIONS = [
  {
    heading: "1. Who we are",
    paragraphs: [
      `SQUL provides school management software through the SQUL website (${LEGAL_META.websiteUrl}) and the SQUL mobile app. The operator is ${LEGAL_META.entityName}, ${LEGAL_META.registeredAddressPlaceholder}, registered with the Office of the Data Protection Commissioner under ${LEGAL_META.odpcRegistrationPlaceholder}.`,
      "For learner, staff and parent records that a school enters into SQUL, the school is the data controller and SQUL processes that information on the school's instructions. For your SQUL account and app usage, SQUL is the data controller.",
    ],
  },
  {
    heading: "2. Information we collect",
    paragraphs: [
      "Account details: name, email address, phone number and your role in a school (for example administrator, teacher or parent).",
      "School records entered by schools or staff: learner names, classes, attendance, grades, fee balances and transport stops.",
      "Payment information: amounts, payment status and transaction references for school fees. SQUL does not store M-Pesa PINs or card numbers.",
      "Device information: push notification tokens and app version.",
      "Location: precise location, collected only while a school trip is running and the app is open, so the school and parents can see the bus on a map. Location tracking stops when the trip ends.",
      "Files you choose to attach: receipts, assignments and photos taken or selected in the app.",
      "Biometric unlock (Face ID or fingerprint) is handled by your device. SQUL does not receive or store your biometric data.",
    ],
  },
  {
    heading: "3. How we use information",
    paragraphs: [
      "We use this information to provide the app and website, send notifications you have enabled (for example attendance, fees and transport updates), show payment status, keep accounts secure, provide support, and meet legal obligations.",
    ],
  },
  {
    heading: "4. Who we share information with",
    paragraphs: [
      "We share information only with the school that owns the records, with the people the school authorises (for example parents viewing their child's trip), and with service providers that help us run SQUL, such as hosting, email, SMS and WhatsApp messaging, push notifications and payment processors. These providers act under contracts that limit how they may use the data.",
      "We do not sell personal information. We disclose information where the law requires it.",
    ],
  },
  {
    heading: "5. How long we keep information",
    paragraphs: [
      `We keep information while your account or the school's subscription is active. After that, we delete or anonymise it within ${LEGAL_META.retentionPlaceholder}, unless the law requires us to keep it longer.`,
    ],
  },
  {
    heading: "6. Security",
    paragraphs: [
      "We use role-based access so users see only the information their role allows, encrypted connections (HTTPS), and daily backups.",
    ],
  },
  {
    heading: "7. Your rights",
    paragraphs: [
      "Under the Kenya Data Protection Act, 2019, you can ask to access, correct or delete your personal information, object to certain processing, and complain to the Office of the Data Protection Commissioner (odpc.go.ke).",
      "For records a school holds, contact your school first. We will help the school respond.",
    ],
  },
  {
    heading: "8. Children",
    paragraphs: [
      "SQUL is not designed for children to use directly. Learner information is entered by schools and their staff.",
    ],
  },
  {
    heading: "9. Changes to this policy",
    paragraphs: [
      "We may update this policy. We will change the date at the top of this page and, for material changes, tell users in the app or by email.",
    ],
  },
  {
    heading: "10. Contact us",
    paragraphs: [
      `Email ${LEGAL_META.contactEmail} with questions about this policy or your information.`,
    ],
  },
];

export default function PrivacyPage() {
  return <LegalDocument title="Privacy Policy" sections={SECTIONS} />;
}
