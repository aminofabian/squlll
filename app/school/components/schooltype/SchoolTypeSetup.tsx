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

// Mapping from frontend level names to backend level names
const levelNameMapping: Record<string, Record<string, string>> = {
  madrasa: {
    'Pre-Primary': 'Madrasa Beginners',
    'Lower Primary': 'Madrasa Lower',
    'Upper Primary': 'Madrasa Upper',
    'Junior Secondary': 'Madrasa Secondary',
    'Senior Secondary': 'Madrasa Secondary'
  },
  cbc: {
    'Pre-Primary': 'pre primary',
    'Lower Primary': 'lower primary',
    'Upper Primary': 'upper primary',
    'Junior Secondary': 'junior secondary',
    'Senior Secondary': 'Senior Secondary'
  },
  international: {
    'IGCSE Early Years': 'IGCSE Early Years',
    'IGCSE Primary': 'IGCSE Primary',
    'IGCSE Secondary': 'IGCSE Secondary',
    'A-Level': 'A-Level'
  },
  homeschool: {
    'Elementary': 'Homeschool Elementary',
    'Middle School': 'Homeschool Middle School',
    'High School': 'Homeschool High School'
  }
}

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
          level: 'IGCSE Secondary',
          description: 'British curriculum secondary',
          classes: [
            { name: 'Year 7', age: '11' },
            { name: 'Year 8', age: '12' },
            { name: 'Year 9', age: '13' },
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
    if (!canProceed) return;

    setIsLoading(true);
    const selectedLevelsList = Array.from(selectedLevels[selectedType]);
    
    try {
      // Map frontend level names to backend level names
      const mappedLevelNames = selectedLevelsList
        .map(levelName => levelNameMapping[selectedType]?.[levelName] || levelName)
        .filter(Boolean);

      console.log('Configuring school levels:', { 
        selectedType, 
        frontendLevels: selectedLevelsList,
        mappedLevels: mappedLevelNames 
      });

      // Call the API endpoint
      const response = await fetch('/api/school/configure-levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ levelNames: mappedLevelNames }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to configure school levels');
      }

      const result: ConfigureSchoolLevelsResponse = await response.json();

      console.log('School configuration response:', result);

      if (result.configureSchoolLevelsByNames) {
        const configData = result.configureSchoolLevelsByNames;
        toast.success(
          `🎉 Successfully configured ${configData.selectedLevels.length} levels for ${configData.tenant.schoolName}!`,
          { duration: 4000 }
        );
        setSetupComplete(true);
        
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          router.push(`/dashboard`);
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
