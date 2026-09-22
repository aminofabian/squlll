'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getDisplayErrorMessage,
  parseGraphQLResponse,
} from '@/lib/utils/graphql-errors'

export type CustodyDestinationType = 'till' | 'paybill'

export type TenantMpesaCustodyDestination = {
  id: string
  type: CustodyDestinationType
  tillNumber: string | null
  businessNumber: string | null
  accountNumber: string | null
  label: string | null
  active: boolean
}

export type MpesaCustodyAvailability = {
  available: boolean
  custodyProvider: string
  platformDarajaEnabled: boolean
  reason: string | null
}

export type MpesaStkIntent = {
  id: string
  status: string
  amount: number
  phone: string
  partyB: string
  transactionType: string
  accountReference: string | null
  checkoutRequestId: string | null
  resultCode: string | null
  resultDesc: string | null
  mpesaReceipt: string | null
  paymentId: string | null
  invoiceId: string | null
  purpose: string
  createdAt: string
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

const AVAILABILITY_QUERY = `
  query MpesaCustodyAvailability {
    mpesaCustodyAvailability {
      available
      custodyProvider
      platformDarajaEnabled
      reason
    }
  }
`

const DESTINATION_QUERY = `
  query TenantMpesaCustodyDestination {
    tenantMpesaCustodyDestination {
      id
      type
      tillNumber
      businessNumber
      accountNumber
      label
      active
    }
  }
`

const UPSERT_MUTATION = `
  mutation UpsertTenantMpesaCustodyDestination($input: UpsertTenantMpesaCustodyDestinationInput!) {
    upsertTenantMpesaCustodyDestination(input: $input) {
      id
      type
      tillNumber
      businessNumber
      accountNumber
      label
      active
    }
  }
`

const RECEIVE_TEST_MUTATION = `
  mutation CustodyMpesaReceiveTest($input: CustodyReceiveTestInput!) {
    custodyMpesaReceiveTest(input: $input) {
      id
      status
      amount
      phone
      partyB
      checkoutRequestId
      resultDesc
      purpose
    }
  }
`

const INITIATE_STK_MUTATION = `
  mutation InitiateCustodyMpesaStk($input: InitiateCustodyMpesaStkInput!) {
    initiateCustodyMpesaStk(input: $input) {
      id
      status
      amount
      phone
      partyB
      transactionType
      accountReference
      checkoutRequestId
      resultCode
      resultDesc
      mpesaReceipt
      paymentId
      invoiceId
      purpose
      createdAt
    }
  }
`

const INTENT_QUERY = `
  query CustodyMpesaStkIntent($id: String!) {
    custodyMpesaStkIntent(id: $id) {
      id
      status
      amount
      phone
      partyB
      transactionType
      accountReference
      checkoutRequestId
      resultCode
      resultDesc
      mpesaReceipt
      paymentId
      invoiceId
      purpose
      createdAt
    }
  }
`

export function useMpesaCustody() {
  const [availability, setAvailability] =
    useState<MpesaCustodyAvailability | null>(null)
  const [destination, setDestination] =
    useState<TenantMpesaCustodyDestination | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [avail, dest] = await Promise.all([
        gqlRequest<{ mpesaCustodyAvailability: MpesaCustodyAvailability }>({
          query: AVAILABILITY_QUERY,
        }),
        gqlRequest<{
          tenantMpesaCustodyDestination: TenantMpesaCustodyDestination | null
        }>({ query: DESTINATION_QUERY }),
      ])
      setAvailability(avail.mpesaCustodyAvailability)
      setDestination(dest.tenantMpesaCustodyDestination)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load M-Pesa settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const saveDestination = useCallback(
    async (input: {
      type: CustodyDestinationType
      tillNumber?: string
      businessNumber?: string
      accountNumber?: string
      label?: string
    }) => {
      setSaving(true)
      setError(null)
      try {
        const data = await gqlRequest<{
          upsertTenantMpesaCustodyDestination: TenantMpesaCustodyDestination
        }>({
          query: UPSERT_MUTATION,
          variables: { input },
        })
        setDestination(data.upsertTenantMpesaCustodyDestination)
        return data.upsertTenantMpesaCustodyDestination
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to save'
        setError(msg)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const receiveTest = useCallback(
    async (input: {
      destination: {
        type: CustodyDestinationType
        tillNumber?: string
        businessNumber?: string
        accountNumber?: string
        label?: string
      }
      phone: string
    }) => {
      const data = await gqlRequest<{
        custodyMpesaReceiveTest: MpesaStkIntent
      }>({
        query: RECEIVE_TEST_MUTATION,
        variables: { input },
      })
      await load()
      return data.custodyMpesaReceiveTest
    },
    [load],
  )

  const initiateStk = useCallback(
    async (input: {
      amount: number
      phone: string
      invoiceId: string
      accountReference?: string
      notes?: string
    }) => {
      const data = await gqlRequest<{
        initiateCustodyMpesaStk: MpesaStkIntent
      }>({
        query: INITIATE_STK_MUTATION,
        variables: { input },
      })
      return data.initiateCustodyMpesaStk
    },
    [],
  )

  const pollIntent = useCallback(async (id: string) => {
    const data = await gqlRequest<{
      custodyMpesaStkIntent: MpesaStkIntent
    }>({
      query: INTENT_QUERY,
      variables: { id },
    })
    return data.custodyMpesaStkIntent
  }, [])

  const custodyLine =
    availability?.available && destination
      ? destination.type === 'till'
        ? `Buy Goods till ${destination.tillNumber}`
        : destination.type === 'paybill'
          ? `Paybill ${destination.businessNumber} · Acc ${destination.accountNumber}`
          : null
      : null

  return {
    availability,
    destination,
    custodyLine,
    loading,
    saving,
    error,
    reload: load,
    saveDestination,
    receiveTest,
    initiateStk,
    pollIntent,
  }
}
