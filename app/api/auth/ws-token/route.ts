import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/** Returns the access token for WebSocket auth (httpOnly cookie → client). */
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ token })
}
