import { NextResponse } from 'next/server';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function GET() {
  try {
    // Test the exact GetTimeSlots query structure you provided
    const query = `
      query GetTimeSlots {
        getTimeSlots {
          id
          periodNumber
          displayTime
          startTime
          endTime
          color
        }
      }
    `;

    console.log('Testing GetTimeSlots query:', query);

    // Note: This will likely fail without proper authentication
    // But it shows the structure of what we're trying to achieve
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query
      })
    });

    const result = await response.json();

    console.log('GetTimeSlots query result:', result);

    return NextResponse.json({
      success: true,
      message: 'GetTimeSlots query structure tested',
      query: query,
      result: result,
      expectedResponse: {
        data: {
          getTimeSlots: [
            {
              id: "fc1e5d55-3a3a-4fa9-8837-3e56ed172cae",
              periodNumber: 1,
              displayTime: "8:00 AM – 8:45 AM",
              startTime: "08:00:00",
              endTime: "08:45:00",
              color: "#3B82F6"
            },
            {
              id: "ca5c4920-2421-448c-bcdf-5018994b1dc9",
              periodNumber: 2,
              displayTime: "8:45 AM – 9:30 AM",
              startTime: "08:45:00",
              endTime: "09:30:00",
              color: "#10B981"
            },
            {
              id: "0474c4df-78a5-4fc7-920e-f5018b4265b0",
              periodNumber: 4,
              displayTime: "10:15 AM – 11:30 AM",
              startTime: "11:30:00",
              endTime: "10:15:00",
              color: "#3B82F6"
            }
          ]
        }
      }
    });

  } catch (error) {
    console.error('Error testing GetTimeSlots query:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test GetTimeSlots query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}