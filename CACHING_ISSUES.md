# Caching Issues and Solutions

## Problem Description

The application was experiencing Internal Server Errors (500) in production, specifically on subdomain pages like `https://charlene-hoeger.squl.co.ke/`. These errors were likely caused by caching issues where:

1. **Static Generation Conflicts**: Next.js was trying to statically generate dynamic subdomain pages
2. **Middleware Caching**: The subdomain routing middleware was being cached incorrectly
3. **Client/Server Component Mismatch**: The root layout was marked as client-side but needed server-side rendering
4. **Missing Cache Headers**: No explicit cache control headers were set for dynamic content

## Root Causes

### 1. Layout Component Issues
- Root layout was marked as `'use client'` but should be a server component
- React Query DevTools were included in production builds
- Missing proper error boundaries

### 2. Subdomain Routing Caching
- Middleware was rewriting subdomain requests without proper cache headers
- Static generation was conflicting with dynamic subdomain content
- No cache invalidation for subdomain pages

### 3. Production Build Optimizations
- Next.js was trying to statically optimize dynamic pages
- Missing proper headers configuration
- No cache control for dynamic content

## Solutions Implemented

### 1. Fixed Root Layout
```typescript
// Converted to server component with client wrapper
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add cache control headers for production */}
        {process.env.NODE_ENV === 'production' && (
          <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        )}
      </head>
      <body>
        <QueryClientWrapper>
          {children}
        </QueryClientWrapper>
      </body>
    </html>
  )
}
```

### 2. Enhanced Middleware
```typescript
// Added cache control headers for subdomain pages
if (isSubdomain) {
  const response = NextResponse.rewrite(url)
  
  // Add cache control headers for subdomain pages
  if (isProd) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  return response
}
```

### 3. Subdomain Page Configuration
```typescript
// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SchoolHome() {
  useEffect(() => {
    // Clear browser cache on mount
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
  }, [])

  return (
    <ErrorBoundary>
      <SchoolHomepage />
    </ErrorBoundary>
  )
}
```

### 4. Next.js Configuration
```typescript
// Added proper headers configuration
async headers() {
  return [
    {
      source: '/school/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
        {
          key: 'Pragma',
          value: 'no-cache',
        },
        {
          key: 'Expires',
          value: '0',
        },
      ],
    },
  ]
}
```

### 5. Error Boundary
Created a comprehensive error boundary component to catch and handle errors gracefully with retry functionality.

## Cache Clearing Script

Added a utility script to clear production cache:

```bash
npm run clear-cache
```

This script:
- Removes `.next` directory
- Clears npm cache
- Removes build artifacts
- Provides instructions for Vercel cache clearing

## Deployment Instructions

### For Vercel:
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Settings > General
4. Click "Clear Build Cache"
5. Redeploy your application

### For Other Platforms:
1. Run `npm run clear-cache`
2. Reinstall dependencies: `npm install`
3. Rebuild: `npm run build`
4. Restart your production server

## Monitoring

To monitor for caching issues:

1. **Check Response Headers**: Ensure `Cache-Control: no-cache, no-store, must-revalidate` is present
2. **Monitor Error Logs**: Look for 500 errors on subdomain pages
3. **Test Subdomain Access**: Regularly test subdomain functionality
4. **Clear Cache Periodically**: Run cache clearing script when issues arise

## Prevention

1. **Always use `dynamic = 'force-dynamic'`** for pages with dynamic content
2. **Set proper cache headers** for dynamic routes
3. **Use error boundaries** to catch and handle errors gracefully
4. **Test in production-like environments** before deployment
5. **Monitor subdomain functionality** regularly

## Troubleshooting

If you still experience issues:

1. **Clear all caches**: Run `npm run clear-cache`
2. **Check middleware logs**: Look for subdomain routing issues
3. **Verify headers**: Ensure cache control headers are being set
4. **Test with different browsers**: Clear browser cache and test
5. **Check deployment logs**: Look for build or runtime errors

## Related Files

- `app/layout.tsx` - Root layout with cache control
- `middleware.ts` - Subdomain routing with cache headers
- `app/school/[subdomain]/page.tsx` - Dynamic subdomain page
- `next.config.ts` - Next.js configuration with headers
- `scripts/clear-cache.js` - Cache clearing utility
- `app/school/[subdomain]/(pages)/components/ErrorBoundary.tsx` - Error handling 