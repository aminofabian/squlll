'use client'

import { useParams, useRouter } from 'next/navigation'
import { Building2, Home, School, Globe } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import { SchoolType } from './types'
import { SchoolTypeSelector } from './SchoolTypeSelector'
import { SelectedTypeHeader } from './SelectedTypeHeader'
import { LevelGrid } from './LevelGrid'
import { QuickTip } from './QuickTip'
import { Footer } from './Footer'
import { Header } from './Header'
import { ProgressStepper } from './ProgressStepper'

// Types for API response
interface GradeLevel {
  id: string;
  name: string;
  code: string | null;
  order: number | null;
}

interface SelectedLevel {
  id: string;
  name: string;
  gradeLevels: GradeLevel[];
}

interface Tenant {
  id: string;
  schoolName: string;
}

interface ConfigureSchoolLevelsResponse {
  configureSchoolLevelsByNames: {
    id: string;
    selectedLevels: SelectedLevel[];
    tenant: Tenant;
    createdAt: string;
  };
}

// Mapping from frontend level names to backend level names (exact match with GraphQL schema)
const levelNameMapping: Record<string, Record<string, string>> = {
  madrasa: {
    'Pre-Primary': 'Madrasa Beginners',
    'Lower Primary': 'Madrasa Lower',
    'Upper Primary': 'Madrasa Upper',
    'Junior Secondary': 'Madrasa Secondary',
    'Senior Secondary': 'Madrasa Secondary'
  },
  cbc: {
    'Pre-Primary': 'Pre-Primary',
    'Lower Primary': 'Lower Primary',
    'Upper Primary': 'Upper Primary', 
    'Junior Secondary': 'Junior Secondary',
    'Senior Secondary': 'Senior Secondary'
  },
  international: {
    'IGCSE Early Years': 'IGCSE Early Years',
    'IGCSE Primary': 'IGCSE Primary',
    'IGCSE Lower Secondary': 'IGCSE Lower Secondary',
    'IGCSE Upper Secondary': 'IGCSE Upper Secondary',
    'A-Level': 'A Level'  // Fixed: removed hyphen
  },
  homeschool: {
    'Early Years': 'Homeschool Early Years',
    'Lower Primary': 'Homeschool Lower Primary',
    'Upper Primary': 'Homeschool Upper Primary',
    'Junior Secondary': 'Homeschool Junior Secondary',
    'Senior Secondary': 'Homeschool Senior Secondary'
  }
}

// Fallback mappings to try if the main mapping fails
const fallbackLevelMapping: Record<string, Record<string, string[]>> = {
  cbc: {
    'Pre-Primary': ['pre primary', 'preschool', 'pre-primary', 'Pre Primary'],
    'Lower Primary': ['lower primary', 'Lower Primary', 'primary lower'],
    'Upper Primary': ['upper primary', 'Upper Primary', 'primary upper'],
    'Junior Secondary': ['junior secondary', 'Junior Secondary', 'secondary junior'],
    'Senior Secondary': ['senior secondary', 'Senior Secondary', 'secondary senior']
  }
}

export const SchoolTypeSetup = () => {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  
  // Extract access token from URL parameters
  const getAccessToken = () => {
    if (typeof window === 'undefined') return null
    
    // Try multiple sources for the access token
    let token = null
    
    // 1. Try URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search)
      token = urlParams.get('accessToken')
      
      // URL decode the token if it exists
      if (token) {
        try {
          token = decodeURIComponent(token)
        } catch (error) {
          console.warn('Failed to decode access token from URL:', error)
        }
      }
    } catch (error) {
      console.warn('Failed to parse URL parameters:', error)
    }
    
    // 2. If no token in URL, try cookies
    if (!token) {
      try {
        const cookies = document.cookie.split(';')
        const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='))
        if (accessTokenCookie) {
          token = accessTokenCookie.split('=')[1]
        }
      } catch (error) {
        console.warn('Failed to read access token from cookies:', error)
      }
    }
    
    // 3. If still no token, try localStorage
    if (!token) {
      try {
        token = localStorage.getItem('accessToken')
      } catch (error) {
        console.warn('Failed to read access token from localStorage:', error)
      }
    }
    
    console.log('🔍 Debug - getAccessToken:')
    console.log('  - Current URL:', window.location.href)
    console.log('  - URL search params:', window.location.search)
    console.log('  - Access token found:', token ? `${token.substring(0, 30)}...` : 'No token')
    console.log('  - Token length:', token?.length || 0)
    console.log('  - Token source:', token ? 'URL/cookies/localStorage' : 'None')
    
    return token
  }
  
  // Extract all authentication data from URL parameters
  const getAuthDataFromURL = () => {
    if (typeof window === 'undefined') return null
    
    const urlParams = new URLSearchParams(window.location.search)
    
    // Helper function to safely decode URL parameters
    const safeDecode = (value: string | null) => {
      if (!value) return value
      try {
        return decodeURIComponent(value)
      } catch (error) {
        console.warn('Failed to decode URL parameter:', error)
        return value
      }
    }
    
    const authData = {
      userId: safeDecode(urlParams.get('userId')),
      email: safeDecode(urlParams.get('email')),
      schoolUrl: safeDecode(urlParams.get('schoolUrl')),
      subdomainUrl: safeDecode(urlParams.get('subdomainUrl')),
      tenantId: safeDecode(urlParams.get('tenantId')),
      tenantName: safeDecode(urlParams.get('tenantName')),
      tenantSubdomain: safeDecode(urlParams.get('tenantSubdomain')),
      accessToken: safeDecode(urlParams.get('accessToken')),
      refreshToken: safeDecode(urlParams.get('refreshToken'))
    }
    
    console.log('🔍 Debug - getAuthDataFromURL:')
    console.log('  - Extracted auth data:', {
      ...authData,
      accessToken: authData.accessToken ? `${authData.accessToken.substring(0, 30)}...` : null,
      refreshToken: authData.refreshToken ? `${authData.refreshToken.substring(0, 30)}...` : null
    })
    
    return authData
  }
  
  // Store authentication data in cookies
  const storeAuthDataInCookies = async (authData: any) => {
    if (!authData || !authData.accessToken || !authData.userId || !authData.email) {
      console.log('Missing required auth data for cookie storage')
      return
    }
    
    try {
      // Store tokens via API endpoint for HTTP-only cookies
      const storeResponse = await fetch('/api/auth/store-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      })
      
      if (storeResponse.ok) {
        console.log('HTTP-only cookies stored successfully')
      } else {
        console.error('Failed to store HTTP-only cookies:', storeResponse.status)
      }
      
      // Also set client-side accessible cookies
      const isProduction = process.env.NODE_ENV === 'production'
      const cookieOptions = `max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax${isProduction ? '; Secure' : ''}`
      
      // Set cookies one by one
      document.cookie = `userId=${authData.userId}; ${cookieOptions}`
      document.cookie = `email=${authData.email}; ${cookieOptions}`
      document.cookie = `accessToken=${authData.accessToken}; ${cookieOptions}`
      
      if (authData.refreshToken) {
        document.cookie = `refreshToken=${authData.refreshToken}; ${cookieOptions}`
      }
      if (authData.schoolUrl) {
        document.cookie = `schoolUrl=${authData.schoolUrl}; ${cookieOptions}`
      }
      if (authData.subdomainUrl) {
        document.cookie = `subdomainUrl=${authData.subdomainUrl}; ${cookieOptions}`
      }
      if (authData.tenantId) {
        document.cookie = `tenantId=${authData.tenantId}; ${cookieOptions}`
      }
      if (authData.tenantName) {
        document.cookie = `tenantName=${encodeURIComponent(authData.tenantName)}; ${cookieOptions}`
      }
      if (authData.tenantSubdomain) {
        document.cookie = `tenantSubdomain=${authData.tenantSubdomain}; ${cookieOptions}`
      }
      
      console.log('All authentication data stored in cookies successfully')
      
      // Clean URL parameters
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('userId')
      newUrl.searchParams.delete('email')
      newUrl.searchParams.delete('schoolUrl')
      newUrl.searchParams.delete('subdomainUrl')
      newUrl.searchParams.delete('tenantId')
      newUrl.searchParams.delete('tenantName')
      newUrl.searchParams.delete('tenantSubdomain')
      newUrl.searchParams.delete('accessToken')
      newUrl.searchParams.delete('refreshToken')
      newUrl.searchParams.delete('newRegistration')
      
      window.history.replaceState({}, '', newUrl.toString())
      console.log('URL parameters cleaned')
      
    } catch (error) {
      console.error('Error storing authentication data in cookies:', error)
    }
  }
  const [selectedType, setSelectedType] = useState<string>('cbc')
  const [selectedLevels, setSelectedLevels] = useState<Record<string, Set<string>>>({
    cbc: new Set()
  })
  const [pendingToast, setPendingToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [setupComplete, setSetupComplete] = useState<boolean>(false)
  
  // Refs for scroll animations
  const levelsSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pendingToast) {
      if (pendingToast.type === 'success') {
        toast.success(pendingToast.message)
      } else {
        toast.error(pendingToast.message)
      }
      setPendingToast(null)
    }
  }, [pendingToast])

  // Store access token in localStorage as fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get('accessToken')
      
      if (accessToken) {
        try {
          // Store in localStorage as fallback
          localStorage.setItem('accessToken', accessToken)
          console.log('🔍 Debug - Stored access token in localStorage as fallback')
        } catch (error) {
          console.warn('Failed to store access token in localStorage:', error)
        }
      }
    }
  }, [])

  // Debug URL parameters on mount
  useEffect(() => {
    console.log('🔍 Debug - Component mounted')
    console.log('  - Window location:', window.location.href)
    console.log('  - Search params:', window.location.search)
    
    const urlParams = new URLSearchParams(window.location.search)
    const allParams = Object.fromEntries(urlParams.entries())
    console.log('  - All URL parameters:', allParams)
    console.log('  - Access token present:', !!allParams.accessToken)
    console.log('  - Access token length:', allParams.accessToken?.length || 0)
    
    // Test getAccessToken function
    const token = getAccessToken()
    console.log('  - getAccessToken result:', token ? `${token.substring(0, 30)}...` : 'No token')
    
    // Test API call with token
    const testAuth = async () => {
      try {
        const testToken = getAccessToken()
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        
        if (testToken) {
          headers['Authorization'] = `Bearer ${testToken}`
        }
        
        console.log('🔍 Debug - Testing auth API call with headers:', headers)
        
        const response = await fetch('/api/test-auth', {
          method: 'GET',
          headers,
        })
        
        const result = await response.json()
        console.log('🔍 Debug - Test auth API response:', result)
      } catch (error) {
        console.error('🔍 Debug - Test auth API error:', error)
      }
    }
    
    testAuth()
  }, [])

  const schoolTypes: SchoolType[] = [
    {
      id: 'cbc',
      icon: Building2,
      title: 'CBC School',
      emoji: '🏫',
      description: 'A complete school offering education from pre-primary through senior secondary under the CBC system.',
      menu: ['Home', 'School', 'Teachers', 'Students', 'Attendance', 'Grading', 'Library', 'Finance'],
      levels: [
        {
          level: 'Pre-Primary',
          description: 'Early childhood education for ages 4-5',
          classes: [
            {name: 'Early Childhood', age: '3'},
            { name: 'PP1', age: '4' },
            { name: 'PP2', age: '5' }
          ]
        },
        {
          level: 'Lower Primary',
          description: 'Foundation stage for ages 6-8',
          classes: [
            { name: 'Grade 1', age: '6' },
            { name: 'Grade 2', age: '7' },
            { name: 'Grade 3', age: '8' }
          ]
        },
        {
          level: 'Upper Primary',
          description: 'Intermediate stage for ages 9-11',
          classes: [
            { name: 'Grade 4', age: '9' },
            { name: 'Grade 5', age: '10' },
            { name: 'Grade 6', age: '11' }
          ]
        },
        {
          level: 'Junior Secondary',
          description: 'Middle school stage for ages 12-14',
          classes: [
            { name: 'Grade 7', age: '12' },
            { name: 'Grade 8', age: '13' },
            { name: 'Grade 9', age: '14' }
          ]
        },
        {
          level: 'Senior Secondary',
          description: 'Advanced stage for ages 15-17',
          classes: [
            { name: 'Grade 10', age: '15' },
            { name: 'Grade 11', age: '16' },
            { name: 'Grade 12', age: '17' }
          ]
        }
      ]
    },
    {
      id: 'international',
      icon: Globe,
      title: 'International School',
      emoji: '🌍',
      description: 'An international school in Kenya offers global curricula such as IGCSE, IB, or American, often attracting expatriates and Kenyan students seeking global exposure.',
      menu: ['Home', 'School', 'Teachers', 'Students', 'Attendance', 'Grading', 'International Programs'],
      levels: [
        {
          level: 'IGCSE Early Years',
          description: 'British curriculum early years',
          classes: [
            { name: 'Nursery', age: '3' },
            { name: 'Reception', age: '4' }
          ]
        },
        {
          level: 'IGCSE Primary',
          description: 'British curriculum primary',
          classes: [
            { name: 'Year 1', age: '5' },
            { name: 'Year 2', age: '6' },
            { name: 'Year 3', age: '7' },
            { name: 'Year 4', age: '8' },
            { name: 'Year 5', age: '9' },
            { name: 'Year 6', age: '10' }
          ]
        },
        {
          level: 'IGCSE Lower Secondary',
          description: 'British curriculum lower secondary',
          classes: [
            { name: 'Year 7', age: '11' },
            { name: 'Year 8', age: '12' },
            { name: 'Year 9', age: '13' }
          ]
        },
        {
          level: 'IGCSE Upper Secondary',
          description: 'British curriculum upper secondary',
          classes: [
            { name: 'Year 10', age: '14' },
            { name: 'Year 11', age: '15' }
          ]
        },
        {
          level: 'A-Level',
          description: 'Advanced level studies',
          classes: [
            { name: 'Year 12', age: '16' },
            { name: 'Year 13', age: '17' }
          ]
        }
      ]
    },
    {
      id: 'madrasa',
      icon: School,
      title: 'Madrasa / Faith-based School',
      emoji: '🕌',
      description: 'These schools combine religious instruction (e.g., Islamic, Christian) with academic education, teaching students both secular and spiritual knowledge.',
      menu: ['Home', 'School', 'Teachers', 'Students', 'Attendance', 'Islamic Studies', 'Quran'],
      levels: [
        {
          level: 'Pre-Primary',
          description: 'Early childhood education with religious foundation',
          classes: [
            {name: 'Early Childhood', age: '3'},
            { name: 'PP1', age: '4' },
            { name: 'PP2', age: '5' }
          ]
        },
        {
          level: 'Lower Primary',
          description: 'Foundation stage with religious instruction',
          classes: [
            { name: 'Grade 1', age: '6' },
            { name: 'Grade 2', age: '7' },
            { name: 'Grade 3', age: '8' }
          ]
        },
        {
          level: 'Upper Primary',
          description: 'Intermediate stage with religious education',
          classes: [
            { name: 'Grade 4', age: '9' },
            { name: 'Grade 5', age: '10' },
            { name: 'Grade 6', age: '11' }
          ]
        },
        {
          level: 'Junior Secondary',
          description: 'Middle school stage with religious studies integration',
          classes: [
            { name: 'Grade 7', age: '12' },
            { name: 'Grade 8', age: '13' },
            { name: 'Grade 9', age: '14' }
          ]
        },
        {
          level: 'Senior Secondary',
          description: 'Advanced stage with specialized religious education',
          classes: [
            { name: 'Grade 10', age: '15' },
            { name: 'Grade 11', age: '16' },
            { name: 'Grade 12', age: '17' }
          ]
        }
      ]
    },
    {
      id: 'homeschool',
      icon: Home,
      title: 'Homeschool',
      emoji: '🏠',
      description: 'Homeschooling in Kenya involves parents or tutors educating children at home instead of enrolling them in formal schools, often using international curricula like IGCSE or American systems.',
      menu: ['Home', 'Curriculum', 'Lessons', 'Assessment', 'Reports'],
      levels: [
        {
          level: 'Early Years',
          description: 'Early childhood homeschool education',
          classes: [
            { name: 'Nursery', age: '3' },
            { name: 'Pre-K', age: '4' }
          ]
        },
        {
          level: 'Lower Primary',
          description: 'Foundation homeschool education',
          classes: [
            { name: 'Grade 1', age: '6' }, { name: 'Grade 2', age: '7' }, { name: 'Grade 3', age: '8' }
          ]
        },
        {
          level: 'Upper Primary',
          description: 'Intermediate homeschool education',
          classes: [
            { name: 'Grade 4', age: '9' }, { name: 'Grade 5', age: '10' }, { name: 'Grade 6', age: '11' }
          ]
        },
        {
          level: 'Junior Secondary',
          description: 'Middle school homeschool education',
          classes: [
            { name: 'Grade 7', age: '12' }, { name: 'Grade 8', age: '13' }, { name: 'Grade 9', age: '14' }
          ]
        },
        {
          level: 'Senior Secondary',
          description: 'High school homeschool education',
          classes: [
            { name: 'Grade 10', age: '15' }, { name: 'Grade 11', age: '16' }, { name: 'Grade 12', age: '17' }
          ]
        }
      ]
    }
  ]

  const toggleLevel = useCallback((e: React.MouseEvent, typeId: string, levelName: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setSelectedLevels(prev => {
      const newLevels = Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [key, new Set(value)])
      )
      
      if (!newLevels[typeId]) {
        newLevels[typeId] = new Set()
      }
      
      const wasSelected = newLevels[typeId].has(levelName)
      if (wasSelected) {
        newLevels[typeId].delete(levelName)
        setPendingToast({ type: 'error', message: `Removed ${levelName}` })
      } else {
        newLevels[typeId].add(levelName)
        setPendingToast({ type: 'success', message: `Added ${levelName}` })
      }
      
      return newLevels
    })
  }, [])

  const handleTypeSelect = useCallback((typeId: string) => {
    if (typeId === selectedType) return

    setSelectedType(typeId)
    setSelectedLevels(prev => {
      const newLevels = Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [key, new Set(value)])
      )
      if (!newLevels[typeId]) {
        newLevels[typeId] = new Set()
      }
      return newLevels
    })
    setPendingToast({ type: 'success', message: `Switched to ${typeId.toUpperCase()} curriculum` })
  }, [selectedType])

  const handleContinue = async () => {
    if (!canProceed) return;

    setIsLoading(true);
    const selectedLevelsList = Array.from(selectedLevels[selectedType]);
    
    try {
      // Smart level mapping with fallback support
      const attemptConfiguration = async (levelNames: string[], attemptNumber: number = 1): Promise<any> => {
        console.log(`🔄 Configuration attempt #${attemptNumber} with levels:`, levelNames);
        
        const accessToken = getAccessToken()
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        
        // Add authorization header if access token is available
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`
        }
        
        console.log('🔍 Debug - attemptConfiguration:')
        console.log('  - Access token available:', !!accessToken)
        console.log('  - Headers being sent:', headers)
        console.log('  - Request URL:', '/api/school/configure-levels')
        console.log('  - Request body:', { levelNames })
        
        const response = await fetch('/api/school/configure-levels', {
          method: 'POST',
          headers,
          body: JSON.stringify({ levelNames }),
        });

        const responseData = await response.json();
        
        if (!response.ok && responseData.error && !responseData.error.includes('SCHOOL_ALREADY_CONFIGURED')) {
          throw new Error(`Attempt ${attemptNumber} failed: ${responseData.error}`);
        }
        
        return { response, responseData };
      };

      // Primary mapping - try official KICD terms first
      let mappedLevelNames = selectedLevelsList
        .map(levelName => {
          const mappedName = levelNameMapping[selectedType]?.[levelName] || levelName;
          console.log(`📍 Level mapping: "${levelName}" → "${mappedName}"`);
          return mappedName;
        })
        .filter(Boolean);

      console.log('🔄 Primary attempt - Configuring school levels:', { 
        selectedType, 
        frontendLevels: selectedLevelsList,
        mappedLevels: mappedLevelNames,
        availableMapping: levelNameMapping[selectedType]
      });

      let configResult;
      let successful = false;
      
      try {
        // Try primary mapping first
        configResult = await attemptConfiguration(mappedLevelNames, 1);
        successful = true;
        console.log('✅ Primary mapping succeeded!');
      } catch (primaryError) {
        console.warn('⚠️ Primary mapping failed:', primaryError);
        
        // Try fallback mappings for CBC system
        if (selectedType === 'cbc' && fallbackLevelMapping.cbc) {
          for (let attempt = 0; attempt < 4; attempt++) {
            try {
              const fallbackNames = selectedLevelsList.map(levelName => {
                const fallbacks = fallbackLevelMapping.cbc[levelName];
                return fallbacks?.[attempt] || levelName;
              });
              
              console.log(`🔄 Trying fallback attempt ${attempt + 1}:`, fallbackNames);
              configResult = await attemptConfiguration(fallbackNames, attempt + 2);
              successful = true;
              console.log(`✅ Fallback attempt ${attempt + 1} succeeded!`);
              break;
            } catch (fallbackError) {
              console.warn(`⚠️ Fallback attempt ${attempt + 1} failed:`, fallbackError);
              if (attempt === 3) {
                throw new Error(`All configuration attempts failed. Last error: ${fallbackError}`);
              }
            }
          }
        } else {
          throw primaryError;
        }
      }
      
      if (!successful) {
        throw new Error('Failed to configure school levels with any mapping approach');
      }

      const { response: finalResponse, responseData: finalResponseData } = configResult;

      // Handle specific case where school is already configured
      if (finalResponseData.error === 'SCHOOL_ALREADY_CONFIGURED') {
        toast.error(
          <div className="space-y-3 p-2">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <School className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  School Already Configured
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Your school has already been set up. You can continue to your dashboard.
                </div>
              </div>
            </div>
            <div className="flex justify-end">
                              <button
                  onClick={() => {
                    toast.dismiss();
                    router.push(`/classes`);
                  }}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Go to Dashboard
              </button>
            </div>
          </div>,
          { 
            duration: 10000,
            style: {
              maxWidth: '420px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }
          }
        );
        return;
      }

      const result: ConfigureSchoolLevelsResponse = finalResponseData;

      console.log('School configuration response:', result);

      if (result.configureSchoolLevelsByNames) {
        const configData = result.configureSchoolLevelsByNames;
        toast.success(
          `🎉 Successfully configured ${configData.selectedLevels.length} levels for ${configData.tenant.schoolName}!`,
          { duration: 4000 }
        );
        setSetupComplete(true);
        
        // Store authentication data in cookies after successful configuration
        const authData = getAuthDataFromURL();
        if (authData) {
          console.log('Storing authentication data in cookies...');
          await storeAuthDataInCookies(authData);
        }
        
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          router.push(`/classes`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error configuring school levels:', error);
      toast.error(
        `Failed to configure school levels. ${error instanceof Error ? error.message : 'Please try again.'}`,
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  }

  const setupSteps = [
    { id: 1, name: 'School Type', description: 'Select your curriculum type' },
    { id: 2, name: 'Classes', description: 'Configure grade levels and classes' },
    { id: 3, name: 'Teachers', description: 'Add teaching staff' },
    { id: 4, name: 'Settings', description: 'School details and preferences' },
  ]

  const getSelectedLevelsCount = (typeId: string) => {
    return selectedLevels[typeId]?.size || 0
  }

  const canProceed = Boolean(selectedType) && getSelectedLevelsCount(selectedType) > 0

  const selectedSchoolType = schoolTypes.find(type => type.id === selectedType)

  const styles = `
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <Toaster position="top-center" />
      
      <Header subdomain={subdomain} currentStep={currentStep} totalSteps={setupSteps.length} />
      
      <main className="flex-1 w-full px-2 sm:px-4 lg:px-6 py-4">
        <div className="w-full">
          {/* Progress Stepper */}
          <ProgressStepper steps={setupSteps} currentStep={currentStep} />
          
          {/* School Type and Levels Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 mt-1 w-full">
            {/* School Type Selection - Left Column */}
            <div className="lg:col-span-3 w-full border-r">
              <SchoolTypeSelector
                schoolTypes={schoolTypes}
                selectedType={selectedType}
                handleTypeSelect={handleTypeSelect}
                getSelectedLevelsCount={getSelectedLevelsCount}
              />
            </div>
            
            {/* Selected Type Details - Right Column */}
            {selectedSchoolType && (
              <div className="lg:col-span-9 w-full lg:pl-2 lg:pr-4">
                <SelectedTypeHeader
                  selectedSchoolType={selectedSchoolType}
                  getSelectedLevelsCount={getSelectedLevelsCount}
                  selectedType={selectedType}
                />
                
                {/* Level Selection Grid */}
                <div className="mt-2 relative">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#246a59]/5 via-transparent to-transparent rounded-lg" />
                  
                  <LevelGrid
                    selectedSchoolType={selectedSchoolType}
                    selectedType={selectedType}
                    selectedLevels={selectedLevels}
                    toggleLevel={toggleLevel}
                    levelsSectionRef={levelsSectionRef}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Tip */}
          <QuickTip currentStep={currentStep} />
        </div>
      </main>
      
      {/* Footer */}
      <Footer
        canProceed={canProceed}
        isLoading={isLoading}
        handleContinue={handleContinue}
        getSelectedLevelsCount={getSelectedLevelsCount}
        selectedType={selectedType}
      />
    </div>
  )
}
