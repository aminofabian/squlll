import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getTenantInfo, checkAuthStatus } from '../../lib/utils';
import { Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const AuthDebugger: React.FC = () => {
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
      // Test 1: Pending Invitations
      console.log('Testing pending invitations...');
      const pendingResponse = await fetch('/api/teachers/pending-invitations?tenantId=' + authStatus?.tenantId, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      results.pendingInvitations = {
        status: pendingResponse.status,
        ok: pendingResponse.ok,
        data: await pendingResponse.json()
      };

      // Test 2: Regular Teachers
      console.log('Testing regular teachers...');
      const teachersResponse = await fetch('/api/teachers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      results.regularTeachers = {
        status: teachersResponse.status,
        ok: teachersResponse.ok,
        data: await teachersResponse.json()
      };

      // Test 3: GraphQL Direct
      console.log('Testing GraphQL directly...');
      const graphqlResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetPendingInvitations($tenantId: String!) {
              getPendingInvitations(tenantId: $tenantId) {
                id
                email
                role
                status
              }
            }
          `,
          variables: { tenantId: authStatus?.tenantId }
        })
      });
      results.graphqlDirect = {
        status: graphqlResponse.status,
        ok: graphqlResponse.ok,
        data: await graphqlResponse.json()
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

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Authentication Debugger
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
            <div className="space-y-2">
              {testResults.pendingInvitations && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.pendingInvitations.ok)}
                  <span>Pending Invitations: {testResults.pendingInvitations.status}</span>
                </div>
              )}
              {testResults.regularTeachers && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.regularTeachers.ok)}
                  <span>Regular Teachers: {testResults.regularTeachers.status}</span>
                </div>
              )}
              {testResults.graphqlDirect && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.graphqlDirect.ok)}
                  <span>GraphQL Direct: {testResults.graphqlDirect.status}</span>
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
            {isTesting ? 'Testing...' : 'Run Tests'}
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
          <h4 className="font-semibold text-blue-800 mb-2">Recommendations:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• If tests fail: Log out and log back in</li>
            <li>• If pending invitations work but usersByTenant doesn't: Check role permissions</li>
            <li>• If all fail: Check token expiration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger; 