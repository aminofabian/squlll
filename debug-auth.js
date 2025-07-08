// Debug script to help identify authentication issues

console.log('=== Authentication Debug Guide ===\n');

console.log('1. CHECK COOKIES:');
console.log('   - Open browser dev tools (F12)');
console.log('   - Go to Application/Storage > Cookies');
console.log('   - Look for these cookies:');
console.log('     * accessToken');
console.log('     * tenantId');
console.log('     * userId');
console.log('     * email');
console.log('   - Verify they exist and have values\n');

console.log('2. CHECK TOKEN VALIDITY:');
console.log('   - Copy the accessToken value');
console.log('   - Go to jwt.io to decode it');
console.log('   - Check if it\'s expired');
console.log('   - Verify the tenantId in the token matches your tenant\n');

console.log('3. TEST WITH CURL:');
console.log('   Replace YOUR_TOKEN and YOUR_TENANT_ID with actual values:');
console.log(`
curl -X POST https://skool.zelisline.com/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "query": "query GetTeachersByTenant($tenantId: String!, $role: String!) { usersByTenant(tenantId: $tenantId, role: $role) { id name email } }",
    "variables": {
      "tenantId": "YOUR_TENANT_ID",
      "role": "TEACHER/STAFF"
    }
  }'
`);

console.log('\n4. POSSIBLE ISSUES:');
console.log('   - Token expired (check expiration time)');
console.log('   - Wrong tenant ID (token tenant vs cookie tenant)');
console.log('   - Insufficient permissions for usersByTenant query');
console.log('   - User not associated with the specified tenant');
console.log('   - Token format incorrect');

console.log('\n5. NEXT STEPS:');
console.log('   - Try logging out and logging back in');
console.log('   - Check if other GraphQL queries work (like getPendingInvitations)');
console.log('   - Verify the tenant ID is correct for your school');
console.log('   - Contact API provider if token seems valid but query fails');

console.log('\n=== End Debug Guide ==='); 