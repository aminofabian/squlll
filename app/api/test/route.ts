import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      message: 'API is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Test API failed' },
      { status: 500 }
    )
  }
} 