import { z } from 'zod'

/** Public "book a walkthrough" lead from the marketing site. */
export const walkthroughSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Enter a valid email address.'),
  schoolName: z.string().trim().min(2, 'Please enter your school name.').max(160),
  phone: z.string().trim().max(30).optional(),
  role: z.string().trim().max(80).optional(),
  county: z.string().trim().max(120).optional(),
  studentCount: z.string().trim().max(40).optional(),
  preferredTime: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1500).optional(),
})

export type WalkthroughInput = z.infer<typeof walkthroughSchema>

/** Keep only fields that carry a value, so optionals stay absent rather than empty. */
export function cleanOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Shape the validated form into the GraphQL `SubmitWalkthroughRequestInput`. */
export function toWalkthroughInput(input: WalkthroughInput) {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    schoolName: input.schoolName.trim(),
    phone: cleanOptional(input.phone),
    role: cleanOptional(input.role),
    county: cleanOptional(input.county),
    studentCount: cleanOptional(input.studentCount),
    preferredTime: cleanOptional(input.preferredTime),
    message: cleanOptional(input.message),
  }
}
