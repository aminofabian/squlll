import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function resolveStorageUploadUrl(): string {
  const base = (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:3001'
  )
    .trim()
    .replace(/\/+$/, '');
  return `${base}/api/storage/upload/single`;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieStore = await cookies();
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    const token =
      tokenFromHeader ?? cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const response = await fetch(resolveStorageUploadUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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
