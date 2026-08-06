import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

function makeReference(subdomain: string) {
  const year = new Date().getFullYear()
  const slug = subdomain.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `APP-${year}-${slug}${rand}`
}

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
    const reference = makeReference(data.subdomain)

    // Persist later (admissions inbox / CRM). For now acknowledge + log.
    console.info('[school-apply]', {
      reference,
      subdomain: data.subdomain,
      student: `${data.studentFirstName} ${data.studentLastName}`,
      programme: data.programme,
      guardianEmail: data.guardianEmail,
    })

    return NextResponse.json({
      ok: true,
      reference,
      message:
        'Your application is in. Admissions will review it and reach out shortly.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong submitting your application.' },
      { status: 500 },
    )
  }
}
