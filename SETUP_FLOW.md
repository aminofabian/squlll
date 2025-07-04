# School Setup Flow

## Overview

When a new school registers, the system now uses a dedicated setup page to handle authentication and configuration. This ensures that authentication tokens are properly stored in cookies before the user proceeds to configure their school.

## Flow Description

### 1. Registration
- User registers a new school at `/register`
- Registration API creates the school and returns user data with tokens
- User is redirected to `/school/{subdomain}/setup` with all authentication data as URL parameters

### 2. Setup Page (`/school/{subdomain}/setup`)
- Renders the SchoolTypeSetup component
- Layout handles authentication parameter processing and cookie storage
- URL parameters are cleaned automatically by the layout

### 3. Dashboard Page (`/school/{subdomain}/dashboard`)
- Checks if school configuration exists
- If no configuration exists, redirects to main school page
- If configuration exists, shows dashboard

### 4. Main School Page (`/school/{subdomain}`)
- If school is already configured, redirects to dashboard
- If no configuration exists, shows `SchoolTypeSetup` component

### 5. School Type Setup
- User selects school type (CBC, International, etc.)
- User selects education levels
- Configuration is saved via GraphQL API
- User is redirected to dashboard
- All authentication is handled automatically by the layout

## URL Parameters

The setup page expects these URL parameters:

```
?userId={user_id}
&email={user_email}
&schoolUrl={school_url}
&subdomainUrl={subdomain_url}
&tenantId={tenant_id}
&tenantName={tenant_name}
&tenantSubdomain={tenant_subdomain}
&accessToken={access_token}
&refreshToken={refresh_token}
&newRegistration=true
```

## Cookie Storage

The setup page stores authentication data in two ways:

### HTTP-only Cookies (via API)
- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token

### Client-side Cookies
- `userId` - User ID
- `email` - User email
- `schoolUrl` - School URL
- `subdomainUrl` - Subdomain URL
- `tenantId` - Tenant ID
- `tenantName` - Tenant name
- `tenantSubdomain` - Tenant subdomain

## Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Register a new school at `/register`
3. Verify redirect to setup page
4. Verify cookies are set correctly
5. Verify redirect to dashboard
6. Verify dashboard redirects to SchoolTypeSetup if not configured

### Test Script
Run the test script to see the expected flow:

```bash
node scripts/test-setup-flow.js
```

### Cookie Verification
Check browser dev tools > Application > Cookies to verify:
- All required cookies are set
- Cookie values are correct
- Cookie security settings are appropriate

### URL Verification
- URL parameters should be cleaned after setup
- No sensitive data should remain in URL
- Redirect should go to clean dashboard URL

## Error Handling

The setup page handles various error scenarios:

- Missing required parameters
- Failed API calls
- Cookie storage failures
- Network errors

Users can retry the setup or continue anyway if there are non-critical errors.

## Security Considerations

- URL parameters are cleaned immediately after processing
- Sensitive tokens are stored in HTTP-only cookies
- Client-side cookies are used only for non-sensitive data
- All cookies use appropriate security flags in production

## Production Deployment

In production:
- All cookies use `Secure` flag
- Domain is set appropriately for subdomain support
- Error handling is more robust
- Logging is configured for debugging

## Troubleshooting

### Common Issues

1. **Cookies not being set**
   - Check browser console for errors
   - Verify API endpoint is working
   - Check domain/subdomain configuration

2. **Setup page not redirecting**
   - Check for JavaScript errors
   - Verify all required parameters are present
   - Check network requests

3. **SchoolTypeSetup not showing**
   - Verify cookies are set correctly
   - Check GraphQL client configuration
   - Verify authentication is working

### Debug Steps

1. Check browser console for errors
2. Verify cookies in dev tools
3. Check network requests in dev tools
4. Verify URL parameters are present
5. Check GraphQL API responses 