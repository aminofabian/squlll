import { NextResponse } from 'next/server';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function GET() {
  try {
    // Test the exact mutation structure you provided
    const mutation = `
      mutation CreateTimeSlots {
        slot1: createTimeSlot(input: {
          periodNumber: 4
          displayTime: "10:15 AM – 11:30 AM"
          startTime: "11:30"
          endTime: "10:15"
          color: "#3B82F6"
        }) {
          id
          periodNumber
          displayTime
        }

        slot2: createTimeSlot(input: {
          periodNumber: 2
          displayTime: "8:45 AM – 9:30 AM"
          startTime: "08:45"
          endTime: "09:30"
          color: "#10B981"
        }) {
          id
          periodNumber
          displayTime
        }

        slot3: createTimeSlot(input: {
          periodNumber: 3
          displayTime: "9:30 AM – 10:15 AM"
          startTime: "09:30"
          endTime: "10:15"
        }) {
          id
          periodNumber
        }
      }
    `;

    console.log('Testing TimeSlot mutation:', mutation);

    // Note: This will likely fail without proper authentication
    // But it shows the structure of what we're trying to achieve
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation
      })
    });

    const result = await response.json();

    console.log('TimeSlot mutation result:', result);

    return NextResponse.json({
      success: true,
      message: 'TimeSlot mutation structure tested',
      query: mutation,
      result: result
    });

  } catch (error) {
    console.error('Error testing time slot mutation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test time slot mutation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}