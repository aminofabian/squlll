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

export const SchoolTypeSetup = () => {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
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
          level: 'Pre-primary',
          description: 'Early childhood education for ages 4-5',
          classes: [
            {name: 'Early Childhood', age: '3 years'},
            { name: 'PP1', age: '4 years' },
            { name: 'PP2', age: '5 years' }
          ]
        },
        {
          level: 'Lower Primary',
          description: 'Foundation stage for ages 6-8',
          classes: [
            { name: 'Grade 1', age: '6 years' },
            { name: 'Grade 2', age: '7 years' },
            { name: 'Grade 3', age: '8 years' }
          ]
        },
        {
          level: 'Upper Primary',
          description: 'Intermediate stage for ages 9-11',
          classes: [
            { name: 'Grade 4', age: '9 years' },
            { name: 'Grade 5', age: '10 years' },
            { name: 'Grade 6', age: '11 years' }
          ]
        },
        {
          level: 'Junior Secondary',
          description: 'Middle school stage for ages 12-14',
          classes: [
            { name: 'Grade 7', age: '12 years' },
            { name: 'Grade 8', age: '13 years' },
            { name: 'Grade 9', age: '14 years' }
          ]
        },
        {
          level: 'Senior Secondary',
          description: 'Advanced stage for ages 15-17',
          classes: [
            { name: 'Grade 10', age: '15 years' },
            { name: 'Grade 11', age: '16 years' },
            { name: 'Grade 12', age: '17 years' }
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
            { name: 'Nursery' },
            { name: 'Reception' }
          ]
        },
        {
          level: 'IGCSE Primary',
          description: 'British curriculum primary',
          classes: [
            { name: 'Year 1' }, { name: 'Year 2' }, { name: 'Year 3' },
            { name: 'Year 4' }, { name: 'Year 5' }, { name: 'Year 6' }
          ]
        },
        {
          level: 'IGCSE Secondary',
          description: 'British curriculum secondary',
          classes: [
            { name: 'Year 7' }, { name: 'Year 8' }, { name: 'Year 9' },
            { name: 'Year 10' }, { name: 'Year 11' }
          ]
        },
        {
          level: 'A-Level',
          description: 'Advanced level studies',
          classes: [
            { name: 'Year 12' },
            { name: 'Year 13' }
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
          level: 'Pre-primary',
          description: 'Early childhood education with religious foundation',
          classes: [
            {name: 'Early Childhood', age: '3 years'},
            { name: 'PP1', age: '4 years' },
            { name: 'PP2', age: '5 years' }
          ]
        },
        {
          level: 'Lower Primary',
          description: 'Foundation stage with religious instruction',
          classes: [
            { name: 'Grade 1', age: '6 years' },
            { name: 'Grade 2', age: '7 years' },
            { name: 'Grade 3', age: '8 years' }
          ]
        },
        {
          level: 'Upper Primary',
          description: 'Intermediate stage with religious education',
          classes: [
            { name: 'Grade 4', age: '9 years' },
            { name: 'Grade 5', age: '10 years' },
            { name: 'Grade 6', age: '11 years' }
          ]
        },
        {
          level: 'Junior Secondary',
          description: 'Middle school stage with religious studies integration',
          classes: [
            { name: 'Grade 7', age: '12 years' },
            { name: 'Grade 8', age: '13 years' },
            { name: 'Grade 9', age: '14 years' }
          ]
        },
        {
          level: 'Senior Secondary',
          description: 'Advanced stage with specialized religious education',
          classes: [
            { name: 'Grade 10', age: '15 years' },
            { name: 'Grade 11', age: '16 years' },
            { name: 'Grade 12', age: '17 years' }
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
          level: 'Elementary',
          classes: [
            { name: 'Grade 1' }, { name: 'Grade 2' }, { name: 'Grade 3' },
            { name: 'Grade 4' }, { name: 'Grade 5' }
          ]
        },
        {
          level: 'Middle School',
          classes: [
            { name: 'Grade 6' }, { name: 'Grade 7' }, { name: 'Grade 8' }
          ]
        },
        {
          level: 'High School',
          classes: [
            { name: 'Grade 9' }, { name: 'Grade 10' },
            { name: 'Grade 11' }, { name: 'Grade 12' }
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
    if (canProceed) {
      setIsLoading(true);
      const selectedLevelsList = Array.from(selectedLevels[selectedType]);
      
      try {
        // Call our API endpoint which forwards to GraphQL
        const response = await fetch('/api/school/configure-levels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            levels: selectedLevelsList,
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to configure school levels');
        }
        
        setIsLoading(false);
        toast.success(`Saved ${selectedLevelsList.length} levels: ${selectedLevelsList.join(', ')}`);
        
        // Set setup as complete
        setSetupComplete(true);
        
        // Redirect immediately to dashboard
        toast.success('Redirecting to dashboard...', { duration: 2000 });
        setTimeout(() => {
          router.push(`/dashboard`);
        }, 1000);
      } catch (error) {
        setIsLoading(false);
        toast.error(error instanceof Error ? error.message : 'Failed to configure school levels');
        console.error('Error configuring school levels:', error);
      }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#246a59',
              color: 'white',
              border: 'none',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#246a59',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: 'white',
              border: 'none',
            },
          },
          duration: 2000,
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Progress Stepper */}
        <ProgressStepper steps={setupSteps} currentStep={currentStep} />
        
        {/* Logo Section */}
        <Header subdomain={subdomain} currentStep={currentStep} totalSteps={setupSteps.length} />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 pb-8">
          {/* Sidebar with School Types */}
          <SchoolTypeSelector 
            schoolTypes={schoolTypes}
            selectedType={selectedType}
            handleTypeSelect={handleTypeSelect}
            getSelectedLevelsCount={getSelectedLevelsCount}
          />

          {/* Main Content - Levels */}
          <div className="flex-1 min-w-0">
            {selectedSchoolType && (
              <div className="space-y-6">
                <SelectedTypeHeader 
                  selectedSchoolType={selectedSchoolType}
                  getSelectedLevelsCount={getSelectedLevelsCount}
                  selectedType={selectedType}
                />

                <LevelGrid 
                  selectedSchoolType={selectedSchoolType}
                  selectedType={selectedType}
                  selectedLevels={selectedLevels}
                  toggleLevel={toggleLevel}
                  levelsSectionRef={levelsSectionRef}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <QuickTip currentStep={currentStep} />

      {/* Footer Action Bar */}
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
