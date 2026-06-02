import type { BankAccount } from '../types'

export function schoolNameFromSubdomain(subdomain?: string): string {
  if (!subdomain) return 'SCHOOL NAME'
  const base = subdomain
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/\bSchool\b/i, '')
    .trim()
  return base ? `${base} School`.toUpperCase() : 'SCHOOL NAME'
}

export function createDefaultSchoolDetails(subdomain?: string) {
  const name = schoolNameFromSubdomain(subdomain)
  return {
    name,
    address: 'P.O. Box — Kenya',
    contact: '',
    email: subdomain ? `info@${subdomain}.school` : '',
    principalName: '',
    principalTitle: 'PRINCIPAL / SEC BOM',
  }
}

export function createDefaultPaymentModes(): {
  bankAccounts: BankAccount[]
  postalAddress: string
  includePostalMoneyOrder: boolean
  notes: string[]
} {
  return {
    bankAccounts: [
      {
        bankName: 'Kenya Commercial Bank',
        branch: '',
        accountNumber: '',
      },
      {
        bankName: 'Co-operative Bank of Kenya',
        branch: '',
        accountNumber: '',
      },
    ],
    postalAddress: '',
    includePostalMoneyOrder: false,
    notes: [
      'The school official receipts shall be issued upon presentation of original pay-in slips or money order copies.',
      'Fees may be deposited at any branch of the listed banks countrywide.',
      "Fees can be paid by banker's cheque; personal cheques will not be accepted unless otherwise stated.",
    ],
  }
}
