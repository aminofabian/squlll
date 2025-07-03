'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function DebugPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        subdomain,
        userAgent: navigator.userAgent,
        url: window.location.href,
        cookies: {},
        localStorage: {},
        sessionStorage: {},
      }

      // Check cookies
      try {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          if (key && value) {
            acc[key] = value
          }
          return acc
        }, {} as Record<string, string>)
        info.cookies = cookies
      } catch (error) {
        info.cookieError = error
      }

      // Check localStorage
      try {
        const localStorageData: Record<string, string> = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            localStorageData[key] = localStorage.getItem(key) || ''
          }
        }
        info.localStorage = localStorageData
      } catch (error) {
        info.localStorageError = error
      }

      // Check sessionStorage
      try {
        const sessionStorageData: Record<string, string> = {}
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key) {
            sessionStorageData[key] = sessionStorage.getItem(key) || ''
          }
        }
        info.sessionStorage = sessionStorageData
      } catch (error) {
        info.sessionStorageError = error
      }

      // Test GraphQL endpoint
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query TestQuery {
                __typename
              }
            `
          }),
        })
        
        info.graphqlTest = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        }

        if (response.ok) {
          const data = await response.json()
          info.graphqlTest.data = data
        } else {
          const errorData = await response.json().catch(() => ({}))
          info.graphqlTest.error = errorData
        }
      } catch (error) {
        info.graphqlTestError = error
      }

      setDebugInfo(info)
      setIsLoading(false)
    }

    gatherDebugInfo()
  }, [subdomain])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Basic Info</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify({
                timestamp: debugInfo.timestamp,
                subdomain: debugInfo.subdomain,
                url: debugInfo.url,
                userAgent: debugInfo.userAgent,
              }, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Cookies</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.cookies, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">GraphQL Test</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.graphqlTest, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Local Storage</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.localStorage, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Session Storage</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.sessionStorage, null, 2)}
            </pre>
          </div>

          {debugInfo.graphqlTestError && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h2 className="text-lg font-semibold mb-2 text-red-800">GraphQL Test Error</h2>
              <pre className="text-sm text-red-700 overflow-auto">
                {JSON.stringify(debugInfo.graphqlTestError, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 