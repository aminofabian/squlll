export interface VerifiedReceipt {
  schoolName: string;
  receiptNumber: string;
  amount: number;
  receiptDate: string;
  studentName: string;
  admissionNumber: string | null;
  className: string | null;
  termName: string | null;
  academicYearName: string | null;
  paymentMethod: string | null;
  transactionReference: string | null;
  isVoided: boolean;
}
