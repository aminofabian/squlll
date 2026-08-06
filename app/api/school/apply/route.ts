import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001/graphql'

const applySchema = z.object({
  subdomain: z.string().min(1),
  studentFirstName: z.string().min(1).max(80),
  studentLastName: z.string().min(1).max(80),
  dateOfBirth: z.string().min(1),
  gender: z.enum(['female', 'male', 'prefer-not', 'other']).optional(),
  programme: z.string().min(1),
  startTerm: z.string().min(1),
  currentSchool: z.string().max(120).optional(),
  guardianName: z.string().min(1).max(120),
  relationship: z.string().min(1),
  guardianEmail: z.string().email(),
  guardianPhone: z.string().min(7).max(30),
  interests: z.array(z.string()).max(12).optional(),
  whyUs: z.string().max(1200).optional(),
  notes: z.string().max(1200).optional(),
})

const SUBMIT_MUTATION = `
  mutation SubmitAdmissionApplication($input: SubmitAdmissionApplicationInput!) {
    submitAdmissionApplication(input: $input) {
      ok
      reference
      message
    }
  }
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = applySchema.safeParse(body)

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

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SUBMIT_MUTATION,
        variables: {
          input: {
            subdomain: data.subdomain,
            studentFirstName: data.studentFirstName,
            studentLastName: data.studentLastName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            programme: data.programme,
            startTerm: data.startTerm,
            currentSchool: data.currentSchool,
            guardianName: data.guardianName,
            relationship: data.relationship,
            guardianEmail: data.guardianEmail,
            guardianPhone: data.guardianPhone,
            interests: data.interests,
            whyUs: data.whyUs,
            notes: data.notes,
          },
        },
      }),
    })

    const result = await response.json()

    if (result.errors?.length) {
      return NextResponse.json(
        { error: result.errors[0].message || 'Could not submit application' },
        { status: 400 },
      )
    }

    const payload = result.data?.submitAdmissionApplication
    if (!payload?.ok) {
      return NextResponse.json(
        { error: 'Could not submit application' },
        { status: 500 },
      )
    }

    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong submitting your application.' },
      { status: 500 },
    )
  }
}
