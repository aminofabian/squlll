import { NextRequest, NextResponse } from 'next/server'
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint'
import { toWalkthroughInput, walkthroughSchema } from '@/lib/walkthrough'

const SUBMIT_MUTATION = `
  mutation SubmitWalkthroughRequest($input: SubmitWalkthroughRequestInput!) {
    submitWalkthroughRequest(input: $input) {
      ok
      message
    }
  }
`

/** Public "book a walkthrough" lead: validate, then forward to the API's public mutation. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = walkthroughSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Please check the form and try again.',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const data = parsed.data
    const endpoint = resolveGraphqlEndpoint()

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SUBMIT_MUTATION,
        variables: {
          input: toWalkthroughInput(data),
        },
      }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('[walkthrough] upstream HTTP error', response.status, result)
      return NextResponse.json(
        { error: 'Could not send your request. Please try again.' },
        { status: 502 },
      )
    }

    if (result?.errors?.length) {
      console.error('[walkthrough] GraphQL errors', result.errors)
      return NextResponse.json(
        { error: result.errors[0].message || 'Could not send your request.' },
        { status: 400 },
      )
    }

    const payload = result?.data?.submitWalkthroughRequest
    if (!payload) {
      console.error('[walkthrough] unexpected payload', result)
      return NextResponse.json(
        { error: 'Could not send your request.' },
        { status: 500 },
      )
    }

    // `ok: false` means the team notification could not be delivered — surface it
    // so the visitor isn't told a request was received when it wasn't.
    return NextResponse.json(payload, { status: payload.ok ? 200 : 502 })
  } catch (err) {
    console.error('[walkthrough] failed', err)
    return NextResponse.json(
      { error: 'Something went wrong sending your request.' },
      { status: 500 },
    )
  }
}
