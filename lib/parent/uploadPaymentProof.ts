const PROOF_MAX_BYTES = 10 * 1024 * 1024
const PROOF_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
])

export function validatePaymentProofFile(file: File): { valid: boolean; error?: string } {
  if (file.size > PROOF_MAX_BYTES) {
    return { valid: false, error: 'Receipt must be 10 MB or smaller.' }
  }
  if (!PROOF_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: 'Use a photo (JPG, PNG) or PDF of your receipt.',
    }
  }
  return { valid: true }
}

export interface PaymentProofUploadResult {
  url: string
  fileName: string
  mimeType: string
}

/**
 * Upload bank/M-Pesa receipt proof for parent payment confirmation.
 */
export async function uploadParentPaymentProof(
  file: File,
  studentId: string,
): Promise<PaymentProofUploadResult> {
  const check = validatePaymentProofFile(file)
  if (!check.valid) {
    throw new Error(check.error)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('entityType', 'parent_payment_proof')
  formData.append('entityId', studentId)
  formData.append('description', 'Parent payment receipt')

  const headers: HeadersInit = {}
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('accessToken')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    let message = 'Could not upload receipt'
    try {
      const json = JSON.parse(text) as { error?: string; details?: string }
      message = json.error ?? json.details ?? message
    } catch {
      if (text) message = text.slice(0, 200)
    }
    throw new Error(message)
  }

  const result = (await response.json()) as {
    url: string
    fileName?: string
    mimeType?: string
  }

  if (!result.url) {
    throw new Error('Upload succeeded but no file URL was returned')
  }

  return {
    url: result.url,
    fileName: result.fileName ?? file.name,
    mimeType: result.mimeType ?? file.type,
  }
}
