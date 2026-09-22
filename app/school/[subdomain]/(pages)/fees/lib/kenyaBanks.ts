/**
 * Common Kenyan bank Lipa Na M-Pesa / bank paybill (business) numbers.
 * `businessNumber: null` means the school must confirm with the bank.
 */
export type KenyaBankOption = {
  id: string
  name: string
  businessNumber: string | null
}

export const KENYA_BANKS: KenyaBankOption[] = [
  { id: 'absa', name: 'Absa Bank Kenya PLC', businessNumber: '303030' },
  { id: 'boa', name: 'Bank of Africa Kenya Limited', businessNumber: '972900' },
  {
    id: 'barclays',
    name: 'Barclays Bank of Kenya Limited',
    businessNumber: '303030',
  },
  {
    id: 'coop',
    name: 'Cooperative Bank of Kenya Limited',
    businessNumber: '400200',
  },
  { id: 'equity', name: 'Equity Bank Limited', businessNumber: '247247' },
  { id: 'family', name: 'Family Bank Limited', businessNumber: '222111' },
  { id: 'kcb', name: 'KCB Bank Kenya Limited', businessNumber: '522522' },
  { id: 'ncba', name: 'NCBA Bank Kenya PLC', businessNumber: '627627' },
  {
    id: 'stanchart',
    name: 'Standard Chartered Bank Kenya Limited',
    businessNumber: '329329',
  },
  { id: 'im', name: 'I&M Bank Limited', businessNumber: '542542' },
  {
    id: 'nbk',
    name: 'National Bank of Kenya Limited',
    businessNumber: '547700',
  },
  { id: 'nic', name: 'NIC Bank Limited', businessNumber: '488488' },
  { id: 'sbm', name: 'SBM Bank (Kenya) Limited', businessNumber: '552800' },
  { id: 'credit', name: 'Credit Bank Limited', businessNumber: '972700' },
  {
    id: 'fcb',
    name: 'First Community Bank Limited',
    businessNumber: '919700',
  },
  {
    id: 'gtb',
    name: 'Guaranty Trust Bank (Kenya) Limited',
    businessNumber: '910200',
  },
  { id: 'jamii', name: 'Jamii Bora Bank Limited', businessNumber: '529901' },
  { id: 'mayfair', name: 'Mayfair Bank Limited', businessNumber: '502800' },
  {
    id: 'paramount',
    name: 'Paramount Universal Bank Limited',
    businessNumber: '888700',
  },
  { id: 'sidian', name: 'Sidian Bank Limited', businessNumber: '111999' },
  {
    id: 'baroda',
    name: 'Bank of Baroda (Kenya) Limited',
    businessNumber: null,
  },
  { id: 'boi', name: 'Bank of India', businessNumber: null },
  { id: 'citi', name: 'Citi Bank', businessNumber: '100229' },
  {
    id: 'cba',
    name: 'Commercial Bank of Africa Limited',
    businessNumber: '880100',
  },
  {
    id: 'dtb',
    name: 'Diamond Trust Bank Kenya Limited',
    businessNumber: '516600',
  },
  { id: 'ecobank', name: 'Ecobank Kenya Limited', businessNumber: '700201' },
  {
    id: 'equatorial',
    name: 'Equatorial Commercial Bank Limited',
    businessNumber: '498100',
  },
  { id: 'habib', name: 'Habib Bank AG Zurich', businessNumber: '787800' },
  {
    id: 'hf',
    name: 'Housing Finance Company of Kenya Limited',
    businessNumber: '100400',
  },
  {
    id: 'meb',
    name: 'Middle East Bank Kenya Limited',
    businessNumber: '400800',
  },
  { id: 'prime', name: 'Prime Bank Limited', businessNumber: '982800' },
  { id: 'spire', name: 'Spire Bank Limited', businessNumber: '498400' },
  {
    id: 'tnb',
    name: 'Trans National Bank Kenya Limited',
    businessNumber: '862862',
  },
  {
    id: 'uba',
    name: 'United Bank for Africa Limited',
    businessNumber: '559900',
  },
]

/** Sentinel for “Other / my bank isn’t listed”. */
export const CUSTOM_BANK_ID = '__custom__'

function normalizeBankKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(limited|ltd|plc|kenya|bank|of|the|company)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function findKenyaBankByName(name: string): KenyaBankOption | null {
  const raw = name.trim()
  if (!raw) return null
  const exact = KENYA_BANKS.find(
    (b) => b.name.toLowerCase() === raw.toLowerCase(),
  )
  if (exact) return exact

  const aliases: Record<string, string> = {
    kcb: 'kcb',
    kenyacommercial: 'kcb',
    kenyacommercialbank: 'kcb',
    coop: 'coop',
    cooperative: 'coop',
    cooperativebank: 'coop',
    equity: 'equity',
    equitybank: 'equity',
    ncba: 'ncba',
    cba: 'cba',
    commercialbankofafrica: 'cba',
    absa: 'absa',
    barclays: 'barclays',
    stanchart: 'stanchart',
    standardchartered: 'stanchart',
    dtb: 'dtb',
    diamondtrust: 'dtb',
  }
  const aliasKey = normalizeBankKey(raw)
  if (aliases[aliasKey]) {
    return KENYA_BANKS.find((b) => b.id === aliases[aliasKey]) ?? null
  }

  const key = normalizeBankKey(raw)
  if (!key) return null
  return (
    KENYA_BANKS.find((b) => normalizeBankKey(b.name) === key) ??
    KENYA_BANKS.find((b) => normalizeBankKey(b.name).includes(key)) ??
    KENYA_BANKS.find((b) => key.includes(normalizeBankKey(b.name))) ??
    null
  )
}

/** Format branch/paybill for fee-letter print. */
export function formatBankPaybillLine(branchOrPaybill?: string | null): string {
  const v = (branchOrPaybill ?? '').trim()
  if (!v) return ''
  if (/^\d{5,7}$/.test(v)) return `Paybill ${v}`
  return v
}
