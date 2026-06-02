'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createDefaultLetterSchoolDetails,
  type LetterSchoolDetailsPayload,
} from '../lib/feeLetter/letterSchoolDetails'
import {
  getDisplayErrorMessage,
  parseGraphQLResponse,
} from '@/lib/utils/graphql-errors'

const GET_QUERY = `
  query TenantFeeLetterSettings {
    tenantFeeLetterSettings {
      schoolDetails {
        name
        address
        contact
        email
        principalName
        principalTitle
      }
      paymentModes {
        bankAccounts {
          bankName
          branch
          accountNumber
        }
        postalAddress
        includePostalMoneyOrder
        notes
      }
      logoUrl
      schoolMotto
    }
  }
`

const UPSERT_MUTATION = `
  mutation UpsertTenantFeeLetterSettings($input: UpsertTenantFeeLetterSettingsInput!) {
    upsertTenantFeeLetterSettings(input: $input) {
      schoolDetails {
        name
        address
        contact
        email
        principalName
        principalTitle
      }
      paymentModes {
        bankAccounts {
          bankName
          branch
          accountNumber
        }
        postalAddress
        includePostalMoneyOrder
        notes
      }
      logoUrl
      schoolMotto
    }
  }
`

type TenantFeeLetterSettingsRecord = NonNullable<
  Awaited<ReturnType<typeof fetchSettings>>['tenantFeeLetterSettings']
>

function toPayload(data: TenantFeeLetterSettingsRecord): LetterSchoolDetailsPayload {
  return {
    schoolDetails: data.schoolDetails,
    paymentModes: {
      bankAccounts: data.paymentModes.bankAccounts,
      postalAddress: data.paymentModes.postalAddress ?? '',
      includePostalMoneyOrder: data.paymentModes.includePostalMoneyOrder ?? false,
      notes: data.paymentModes.notes ?? [],
    },
    logoUrl: data.logoUrl ?? null,
    schoolMotto: data.schoolMotto,
  }
}

async function gqlRequest<T>(body: {
  query: string
  variables?: Record<string, unknown>
}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const accessToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('accessToken')
      : null
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const response = await fetch('/api/graphql', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  })

  const payload = await parseGraphQLResponse<{
    data?: T
    errors?: Array<{ message?: string }>
  }>(response)

  if (payload.errors?.length) {
    throw new Error(getDisplayErrorMessage(payload.errors))
  }

  return payload.data as T
}

async function fetchSettings() {
  return gqlRequest<{
    tenantFeeLetterSettings: {
      schoolDetails: LetterSchoolDetailsPayload['schoolDetails']
      paymentModes: LetterSchoolDetailsPayload['paymentModes']
      logoUrl: string | null
      schoolMotto: string
    } | null
  }>({ query: GET_QUERY })
}

function toInput(details: LetterSchoolDetailsPayload) {
  return {
    schoolDetails: details.schoolDetails,
    paymentModes: {
      bankAccounts: details.paymentModes.bankAccounts,
      postalAddress: details.paymentModes.postalAddress ?? '',
      includePostalMoneyOrder: Boolean(
        details.paymentModes.includePostalMoneyOrder,
      ),
      notes: details.paymentModes.notes,
    },
    logoUrl: details.logoUrl,
    schoolMotto: details.schoolMotto,
  }
}

export function useTenantFeeLetterSettings(subdomain: string) {
  const [details, setDetails] = useState<LetterSchoolDetailsPayload>(() =>
    createDefaultLetterSchoolDetails(subdomain),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSettings()
      if (data.tenantFeeLetterSettings) {
        setDetails(toPayload(data.tenantFeeLetterSettings))
      } else {
        setDetails(createDefaultLetterSchoolDetails(subdomain))
      }
      setLoaded(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load letter details')
      setDetails(createDefaultLetterSchoolDetails(subdomain))
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    load()
  }, [load])

  const saveNow = useCallback(
    async (next: LetterSchoolDetailsPayload) => {
      setSaving(true)
      setError(null)
      try {
        const data = await gqlRequest<{
          upsertTenantFeeLetterSettings: LetterSchoolDetailsPayload & {
            paymentModes: LetterSchoolDetailsPayload['paymentModes']
          }
        }>({
          query: UPSERT_MUTATION,
          variables: { input: toInput(next) },
        })
        setDetails(toPayload(data.upsertTenantFeeLetterSettings))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save')
        throw e
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const setDetailsAndPersist = useCallback(
    (next: LetterSchoolDetailsPayload) => {
      setDetails(next)
      if (!loaded) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        saveNow(next).catch(() => {})
      }, 1200)
    },
    [loaded, saveNow],
  )

  return {
    details,
    setDetails: setDetailsAndPersist,
    saveNow,
    loading,
    saving,
    error,
    reload: load,
    loaded,
  }
}
