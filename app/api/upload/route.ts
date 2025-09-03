import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
      console.log('No auth header provided');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    console.log('Using real Skool API for upload');

    // Get the form data from the request
    const formData = await request.formData();
    
    // Forward the request to the Skool API
    const response = await fetch('https://skool.zelisline.com/api/storage/upload/single', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        // Note: Don't set Content-Type for FormData, let fetch handle it
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Skool API Error:', response.status, response.statusText, errorText);
      
      return NextResponse.json(
        { 
          error: `Upload failed: ${response.status} ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    // Parse and return the successful response
    const result = await response.json();
    
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Proxy upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
