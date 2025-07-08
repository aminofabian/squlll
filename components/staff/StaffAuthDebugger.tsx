import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getTenantInfo, checkAuthStatus } from '../../lib/utils';
import { Info, AlertCircle, CheckCircle, XCircle, Users } from 'lucide-react';

export const StaffAuthDebugger: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const status = checkAuthStatus();
    setAuthStatus(status);
  }, []);

  const runTests = async () => {
    setIsTesting(true);
    const results: any = {};

    try {
      // Test 1: Staff Query via GraphQL
      console.log('Testing staff query via GraphQL...');
      const staffResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetStaffByTenant($tenantId: String!, $role: String!) {
              usersByTenant(tenantId: $tenantId, role: $role) {
                id
                name
                email
              }
            }
          `,
          variables: { 
            tenantId: authStatus?.tenantId,
            role: 'STAFF'
          }
        })
      });
      results.staffQuery = {
        status: staffResponse.status,
        ok: staffResponse.ok,
        data: await staffResponse.json()
      };

      // Test 2: Teachers Query for comparison
      console.log('Testing teachers query for comparison...');
      const teachersResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetTeachersByTenant($tenantId: String!, $role: String!) {
              usersByTenant(tenantId: $tenantId, role: $role) {
                id
                name
                email
              }
            }
          `,
          variables: { 
            tenantId: authStatus?.tenantId,
            role: 'TEACHER'
          }
        })
      });
      results.teachersQuery = {
        status: teachersResponse.status,
        ok: teachersResponse.ok,
        data: await teachersResponse.json()
      };

      // Test 3: Store-based staff query
      console.log('Testing store-based staff query...');
      const storeResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetStaffByTenant($tenantId: String!, $role: String!) {
              usersByTenant(tenantId: $tenantId, role: $role) {
                id
                name
                email
              }
            }
          `,
          variables: { 
            tenantId: authStatus?.tenantId,
            role: 'STAFF'
          }
        })
      });
      results.storeQuery = {
        status: storeResponse.status,
        ok: storeResponse.ok,
        data: await storeResponse.json()
      };

    } catch (error) {
      console.error('Test error:', error);
      results.error = error;
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getResponseDetails = (result: any) => {
    if (!result) return null;
    
    const hasErrors = result.data?.errors && result.data.errors.length > 0;
    const errorMessages = hasErrors ? result.data.errors.map((e: any) => e.message).join(', ') : null;
    
    return {
      status: result.status,
      ok: result.ok,
      hasErrors,
      errorMessages,
      userCount: result.data?.data?.usersByTenant?.length || 0
    };
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Users className="h-5 w-5" />
          Staff Authentication Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auth Status */}
        <div>
          <h4 className="font-semibold mb-2">Authentication Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(authStatus?.isAuthenticated)}
              <span>Authenticated: {authStatus?.isAuthenticated ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(authStatus?.hasAccessToken)}
              <span>Has Token: {authStatus?.hasAccessToken ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!authStatus?.tenantId)}
              <span>Tenant ID: {authStatus?.tenantId ? 'Present' : 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!authStatus?.userId)}
              <span>User ID: {authStatus?.userId ? 'Present' : 'Missing'}</span>
            </div>
          </div>
        </div>

        {/* Cookie Info */}
        {authStatus?.tenantId && (
          <div>
            <h4 className="font-semibold mb-2">Current Tenant:</h4>
            <div className="bg-white p-2 rounded border">
              <code className="text-xs break-all">{authStatus.tenantId}</code>
            </div>
          </div>
        )}

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-3">
              {testResults.staffQuery && (
                <div className="border rounded p-3 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(testResults.staffQuery.ok)}
                    <span className="font-medium">Staff Query (STAFF role)</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Status: {testResults.staffQuery.status}</div>
                    <div>Users found: {getResponseDetails(testResults.staffQuery)?.userCount || 0}</div>
                    {getResponseDetails(testResults.staffQuery)?.errorMessages && (
                      <div className="text-red-600">
                        Error: {getResponseDetails(testResults.staffQuery)?.errorMessages}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {testResults.teachersQuery && (
                <div className="border rounded p-3 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(testResults.teachersQuery.ok)}
                    <span className="font-medium">Teachers Query (TEACHER role)</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Status: {testResults.teachersQuery.status}</div>
                    <div>Users found: {getResponseDetails(testResults.teachersQuery)?.userCount || 0}</div>
                    {getResponseDetails(testResults.teachersQuery)?.errorMessages && (
                      <div className="text-red-600">
                        Error: {getResponseDetails(testResults.teachersQuery)?.errorMessages}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {testResults.storeQuery && (
                <div className="border rounded p-3 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(testResults.storeQuery.ok)}
                    <span className="font-medium">Store Query (STAFF role)</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Status: {testResults.storeQuery.status}</div>
                    <div>Users found: {getResponseDetails(testResults.storeQuery)?.userCount || 0}</div>
                    {getResponseDetails(testResults.storeQuery)?.errorMessages && (
                      <div className="text-red-600">
                        Error: {getResponseDetails(testResults.storeQuery)?.errorMessages}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={isTesting}
            variant="outline"
            size="sm"
          >
            {isTesting ? 'Testing...' : 'Run Staff Tests'}
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Refresh Page
          </Button>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Staff-Specific Recommendations:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• If staff query fails but teachers works: Check if "STAFF" role exists in your system</li>
            <li>• If both fail: Authentication issue - log out and log back in</li>
            <li>• If no users found: Check if there are staff members with role "STAFF" in your tenant</li>
            <li>• If 500 error: Check GraphQL server logs for role permission issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffAuthDebugger; 