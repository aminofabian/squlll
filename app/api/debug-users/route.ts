import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant ID' }, { status: 400 });
    }

    console.log('Debug Users - Tenant ID:', tenantId);
    console.log('Debug Users - Token present:', !!token);

    const roles = ['TEACHER', 'STAFF', 'STUDENT', 'ADMIN', 'PARENT'];
    const results: any = {};

    for (const role of roles) {
      const query = `
        query GetUsersByTenant($tenantId: String!, $role: String!) {
          usersByTenant(tenantId: $tenantId, role: $role) {
            id
            name
            email
          }
        }
      `;

      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query,
            variables: { tenantId, role }
          })
        });

        const result = await response.json();
        
        if (result.errors) {
          console.error(`Debug Users - ${role} errors:`, result.errors);
          results[role] = { 
            error: result.errors[0].message, 
            count: 0,
            users: [] 
          };
        } else {
          results[role] = {
            count: result.data.usersByTenant.length,
            users: result.data.usersByTenant,
            error: null
          };
        }
        
        console.log(`Debug Users - ${role}:`, results[role]);
      } catch (error) {
        console.error(`Debug Users - ${role} request failed:`, error);
        results[role] = { error: 'Request failed', count: 0, users: [] };
      }
    }

    return NextResponse.json({
      tenantId,
      results,
      summary: Object.keys(results).map(role => ({
        role,
        count: results[role].count,
        hasError: !!results[role].error,
        errorMessage: results[role].error
      }))
    });
    
  } catch (error) {
    console.error('Debug Users - Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 