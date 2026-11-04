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
    bankAccounts: [],
    postalAddress: '',
    includePostalMoneyOrder: false,
    notes: [],
  }
}
