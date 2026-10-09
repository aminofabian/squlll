import { LegalDocument } from "@/components/legal/LegalDocument";
import { LEGAL_META } from "@/lib/legal/legal-meta";

const SECTIONS = [
  {
    heading: "1. How to request deletion",
    paragraphs: [
      `You can ask us to delete your SQUL account by emailing ${LEGAL_META.contactEmail} from the email address registered on your account. Use the subject line "Account deletion request" and include your full name and your role at the school (for example parent, teacher or driver).`,
      "You can also ask your school administrator to remove your account. The school can then take the removal action in SQUL.",
    ],
  },
  {
    heading: "2. Verifying your request",
    paragraphs: [
      "We may ask you to confirm you control the account before we act on a request. This protects your account from deletion requests made by someone else.",
    ],
  },
  {
    heading: "3. What we delete",
    paragraphs: [
      "When we process your request we delete your login details, your profile information (name, email address and phone number), the push notification tokens and device registrations linked to your account, and other personal data we hold as the controller of your account.",
    ],
  },
  {
    heading: "4. What we keep",
    paragraphs: [
      "School records such as attendance, grades, fee statements and transport records are held on behalf of the school, which is the data controller for them. The school decides whether those records are kept or deleted. If a record must be kept for legal, tax or accounting reasons, we keep it only for as long as needed: [retention period].",
      "Backup copies are removed from our systems on their normal rotation: [backup rotation period].",
    ],
  },
  {
    heading: "5. Timing",
    paragraphs: [
      "We aim to complete a deletion request within [30] days and will confirm to you by email once it is done. If we need more time, we will tell you why.",
    ],
  },
  {
    heading: "6. Questions",
    paragraphs: [
      `If you have questions about this process, contact us at ${LEGAL_META.contactEmail}. You can also read our Privacy Policy for more detail on how we handle personal data.`,
    ],
  },
];

export default function AccountDeletionPage() {
  return <LegalDocument title="Delete your SQUL account" sections={SECTIONS} />;
}
