'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { SchoolSidebar } from '@/components/dashboard/SchoolSidebar'
import { Button } from '@/components/ui/button'
import { Bell, User, Menu } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [schoolName, setSchoolName] = useState('School Dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check for URL parameters from registration
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const schoolUrl = searchParams.get('schoolUrl')
    const subdomainUrl = searchParams.get('subdomainUrl')
    const accessToken = searchParams.get('accessToken')
    const isNewRegistration = searchParams.get('newRegistration') === 'true'

    // If this is a new registration, store the data in cookies
    if (isNewRegistration && userId && email) {
      console.log('New registration detected, storing user data in cookies')
      
      // Store user data in cookies (30 day expiry)
      document.cookie = `userId=${userId}; max-age=${60 * 60 * 24 * 30}; path=/`
      document.cookie = `email=${email}; max-age=${60 * 60 * 24 * 30}; path=/`
      
      if (schoolUrl) {
        document.cookie = `schoolUrl=${schoolUrl}; max-age=${60 * 60 * 24 * 30}; path=/`
      }
      
      if (subdomainUrl) {
        document.cookie = `subdomainUrl=${subdomainUrl}; max-age=${60 * 60 * 24 * 30}; path=/`
      }
      
      if (accessToken) {
        document.cookie = `accessToken=${accessToken}; max-age=${60 * 60 * 24 * 30}; path=/`
      }
      
      // Remove parameters from URL to prevent sharing sensitive data
      router.replace(`/`)
    }

    // Fetch school-specific data based on the subdomain
    console.log('School subdomain:', subdomain)
    
    // Simulate fetching school name from API
    if (subdomain) {
      // This would normally be an API call
      const formattedName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1) + ' School'
      setSchoolName(formattedName)
    }
  }, [subdomain, searchParams, router])

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">{schoolName}</h2>
        </div>
        <SchoolSidebar subdomain={subdomain} schoolName={schoolName} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold hidden md:block">{schoolName}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(schoolName)}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        {/* Main content area with scrolling */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}