import { LegalDocument } from "@/components/legal/LegalDocument";
import { LEGAL_META } from "@/lib/legal/legal-meta";

const SECTIONS = [
  {
    heading: "1. Agreement",
    paragraphs: [
      `By creating an account or using SQUL at ${LEGAL_META.websiteUrl} or in the SQUL mobile app, you agree to these Terms of Service. The service is provided by ${LEGAL_META.entityName}.`,
    ],
  },
  {
    heading: "2. The service",
    paragraphs: [
      "SQUL provides school management tools for administrators, teachers, parents and other school users, including records, fees, attendance, communications and school transport tracking. We may add, change or remove features over time.",
    ],
  },
  {
    heading: "3. Accounts",
    paragraphs: [
      "Keep your login details confidential and tell us promptly if you think your account has been used without permission. Schools are responsible for the users they invite and for the access those users have.",
    ],
  },
  {
    heading: "4. Schools' responsibilities",
    paragraphs: [
      "Schools must have a lawful basis for the learner and staff information they record in SQUL, keep that information accurate, and comply with the Kenya Data Protection Act, 2019 as the data controller.",
    ],
  },
  {
    heading: "5. School fees and payments",
    paragraphs: [
      "Fee payments made through SQUL are payments to the school. SQUL does not decide fee amounts and is not responsible for a school's fee policies. [Confirm with your payment provider how settlement works before publishing this section.]",
    ],
  },
  {
    heading: "6. Acceptable use",
    paragraphs: [
      "Do not use SQUL for anything unlawful, attempt to gain access to data you are not authorised to see, copy or reverse engineer the service, or interfere with its operation.",
    ],
  },
  {
    heading: "7. Availability",
    paragraphs: [
      "We work to keep SQUL available and secure, but we do not guarantee that it will be uninterrupted or error-free.",
    ],
  },
  {
    heading: "8. Limitation of liability",
    paragraphs: [
      "To the extent permitted by Kenyan law, SQUL is not liable for indirect or consequential losses arising from use of the service. [Insert liability cap after legal review.]",
    ],
  },
  {
    heading: "9. Ending use",
    paragraphs: [
      "You can stop using SQUL at any time. Schools should export the records they need before ending their subscription. We may suspend or end access for breach of these terms.",
    ],
  },
  {
    heading: "10. Governing law and changes",
    paragraphs: [
      "These terms are governed by the laws of the Republic of Kenya. We may update them and will change the date at the top of this page when we do.",
    ],
  },
  {
    heading: "11. Contact",
    paragraphs: [
      `Email ${LEGAL_META.contactEmail} or call ${LEGAL_META.contactPhone} with questions about these terms.`,
    ],
  },
];

export default function TermsPage() {
  return <LegalDocument title="Terms of Service" sections={SECTIONS} />;
}
