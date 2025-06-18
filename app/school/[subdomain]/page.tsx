'use client'

import { useParams, useRouter } from 'next/navigation'
import { Building2, Home, School, Globe, Check, Sparkles, ChevronRight, BookOpen, GraduationCap, Users, Calendar, Award, Library, DollarSign, Layers, ArrowRight, Settings, BarChart, Clock, Lightbulb } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface Class {
  name: string
  age?: string | number
  description?: string
}

interface Level {
  level: string
  classes: Class[]
  description?: string
}

interface SchoolType {
  id: string
  icon: any
  title: string
  description: string
  emoji?: string
  menu: string[]
  levels: Level[]
}

export default function SchoolHome() {
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

  const handleContinue = () => {
    if (canProceed) {
      setIsLoading(true);
      const selectedLevelsList = Array.from(selectedLevels[selectedType]);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep(currentStep + 1);
        toast.success(`Saved ${selectedLevelsList.length} levels: ${selectedLevelsList.join(', ')}`);
        
        // Scroll to top smoothly when advancing
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (currentStep >= 3) {
          setSetupComplete(true);
          // Redirect after setup completion
          setTimeout(() => {
            router.push(`/school/${subdomain}/dashboard`);
          }, 2000);
        }
      }, 800);
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

  const canProceed = selectedType && getSelectedLevelsCount(selectedType) > 0

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
        <div className="mb-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              {setupSteps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                return (
                  <div key={step.id} className="flex-1 relative">
                    <div className="flex items-center justify-center">
                      {/* Line before */}
                      {index > 0 && (
                        <div 
                          className={`absolute left-0 right-1/2 top-1/2 h-0.5 -translate-y-1/2 transition-colors duration-300 ${isCompleted ? 'bg-[#246a59]' : 'bg-gray-200'}`}
                        aria-hidden="true"
                        style={{ zIndex: 0 }}
                        />
                      )}
                      {/* Line after */}
                      {index < setupSteps.length - 1 && (
                        <div 
                          className={`absolute left-1/2 right-0 top-1/2 h-0.5 -translate-y-1/2 transition-colors duration-300 ${step.id < currentStep ? 'bg-[#246a59]' : 'bg-gray-200'}`}
                          aria-hidden="true"
                          style={{ zIndex: 0 }}
                        />
                      )}
                      {/* Step circle */}
                      <div 
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive ? 'border-[#246a59] bg-[#246a59]/10 shadow-md' : isCompleted ? 'border-[#246a59] bg-[#246a59] text-white' : 'border-gray-300 bg-white'}`}
                        style={{ zIndex: 1 }}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span className={`text-sm font-medium ${isActive ? 'text-[#246a59]' : 'text-gray-500'}`}>{step.id}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-[#246a59]' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>{step.name}</div>
                      <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Logo Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-[#246a59] rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#246a59] to-[#2d8872]"></div>
                <span className="relative text-2xl font-bold text-white">
                  {subdomain.charAt(0).toUpperCase()}
                </span>
                <div className="absolute top-0 right-0">
                  <Sparkles className="w-3 h-3 text-white/50" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2d8872] rounded-sm shadow-lg transform rotate-12"></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {subdomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h1>
              <p className="text-sm text-gray-500">School Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-[#246a59]/10 px-3 py-2 rounded-md">
            <Clock className="w-4 h-4 text-[#246a59]" />
            <span className="text-[#246a59] font-medium">Setup step {currentStep} of {setupSteps.length}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 pb-8">
          {/* Sidebar with School Types */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-4 space-y-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">School Types</h3>
                <p className="text-sm text-gray-500 hidden lg:block">Choose the curriculum that best fits your educational goals.</p>
              </div>
              {/* Mobile View */}
              <div className="lg:hidden">
                <div className="grid grid-cols-2 grid-rows-2 gap-4">
                  {schoolTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selectedType === type.id
                    const selectedLevelCount = getSelectedLevelsCount(type.id)

                    return (
                      <button
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className={`flex flex-col items-center justify-center aspect-square rounded-2xl transition-all duration-300 relative overflow-hidden border-2
                          ${isSelected
                            ? 'bg-[#246a59] text-white shadow-xl scale-[0.98] border-[#246a59]'
                            : 'bg-white hover:bg-[#246a59]/5 text-gray-900 shadow-lg hover:scale-[0.98] border-gray-200 hover:border-[#246a59]/50'
                          }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${
                          isSelected ? 'from-white via-transparent to-black/20' : 'from-gray-50 via-transparent to-transparent'
                        }`} />
                        <div className={`mb-3 p-4 rounded-xl transition-all duration-300 ${
                          isSelected ? 'bg-white/10' : 'bg-[#246a59]/5'
                        }`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-center font-semibold text-base">
                            {type.title.split(' ')[0]}
                          </span>
                          {selectedLevelCount > 0 && (
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              isSelected ? 'bg-white/20' : 'bg-[#246a59] text-white'
                            }`}>
                              {selectedLevelCount}
                            </span>
                          )}
                        </div>
                        {type.emoji && (
                          <span className="absolute bottom-3 opacity-75 text-lg">{type.emoji}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Desktop View */}
              <div className="hidden lg:grid lg:grid-cols-1 gap-3">
                {schoolTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedType === type.id
                  const selectedLevelCount = getSelectedLevelsCount(type.id)

                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`group w-full p-4 border transition-all duration-300 relative overflow-hidden rounded-lg ${
                        isSelected
                          ? 'border-[#246a59] bg-[#246a59]/5 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-[#246a59]/50'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-[#246a59]/5 transition-all duration-500"></div>
                      <div className="relative flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`p-2 transition-all duration-300 ${
                            isSelected ? 'bg-[#246a59]/10' : 'bg-gray-50 group-hover:bg-[#246a59]/5'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              isSelected ? 'text-[#246a59]' : 'text-gray-500 group-hover:text-[#246a59]'
                            }`} />
                          </div>
                          {type.emoji && (
                            <span className="text-xl mt-2 block">{type.emoji}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold transition-colors duration-300 ${
                              isSelected ? 'text-[#246a59]' : 'text-gray-900 group-hover:text-[#246a59]'
                            }`}>{type.title}</h3>
                            {selectedLevelCount > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#246a59] text-white">
                                {selectedLevelCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Levels */}
          <div className="flex-1 min-w-0">
            {selectedSchoolType && (
              <div className="space-y-6">
                <div className="bg-white border-l-4 border-l-[#246a59] p-4 sm:p-6 shadow-sm rounded-r-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#246a59] flex items-center">
                        {selectedSchoolType.title}
                        {selectedSchoolType.emoji && (
                          <span className="ml-2">{selectedSchoolType.emoji}</span>
                        )}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">{selectedSchoolType.description}</p>
                    </div>
                    <div className="bg-[#246a59]/5 px-4 py-2 rounded-sm">
                      <span className="text-sm font-medium text-[#246a59]">
                        {getSelectedLevelsCount(selectedType)} levels selected
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 hide-scrollbar overflow-x-auto pb-2 max-w-full">
                    {selectedSchoolType.menu.map((item, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium bg-[#246a59]/10 text-[#246a59] hover:bg-[#246a59]/20 transition-all duration-200 rounded-md hover:scale-105"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div ref={levelsSectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {selectedSchoolType.levels.map((level) => {
                    const isSelected = selectedLevels[selectedType]?.has(level.level) || false
                    return (
                      <div
                        key={level.level}
                        onClick={(e) => toggleLevel(e, selectedType, level.level)}
                        className={`group relative overflow-hidden transition-all duration-300 rounded-lg border cursor-pointer
                          ${isSelected
                            ? 'bg-[#246a59]/5 shadow-lg border-[#246a59]'
                            : 'bg-gradient-to-br from-white to-gray-50 hover:shadow-md hover:-translate-y-0.5 border-gray-200 hover:border-[#246a59]/50'
                          }`}
                      >
                        <div 
                          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none
                            ${isSelected 
                              ? 'bg-gradient-to-br from-[#246a59]/5 via-transparent to-[#246a59]/5'
                              : 'bg-[url("/grid.svg")] opacity-[0.02] group-hover:opacity-[0.05]'
                            }`}
                        />
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#246a59]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="p-6 relative">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                                  isSelected
                                    ? 'text-[#246a59]'
                                    : 'text-gray-900 group-hover:text-[#246a59]'
                                }`}>{level.level}</h3>
                                <div className={`h-px flex-1 transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-[#246a59]/30'
                                    : 'bg-gray-200 group-hover:bg-[#246a59]/20'
                                }`} />
                              </div>
                              {level.description && (
                                <div className="relative">
                                  <p className="text-sm text-gray-500 mt-2 group-hover:text-gray-600 transition-colors duration-300 pr-8">
                                    {level.description}
                                  </p>
                                  <div className={`absolute -left-4 top-0 bottom-0 w-0.5 transition-colors duration-300 ${
                                    isSelected
                                      ? 'bg-[#246a59]/40'
                                      : 'bg-gray-200 group-hover:bg-[#246a59]/20'
                                  }`} />
                                </div>
                              )}
                            </div>
                            <div
                              className={`relative w-7 h-7 border-2 flex items-center justify-center transition-all duration-300
                                ${isSelected
                                  ? 'border-[#246a59] bg-[#246a59] text-white shadow-sm'
                                  : 'border-gray-300 group-hover:border-[#246a59] group-hover:shadow bg-white'
                                }
                                group-hover:scale-105 group-active:scale-95
                              `}
                            >
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {level.classes.map((cls) => (
                              <div
                                key={cls.name}
                                className="relative overflow-hidden group/class"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="relative p-4 bg-white border rounded-lg border-[#246a59]/10 hover:border-[#246a59]/30
                                  shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5
                                  group-hover:bg-gradient-to-br from-white to-[#246a59]/5 hover:cursor-pointer">
                                  <div>
                                    <div className="font-medium text-gray-900 group-hover:text-[#246a59] transition-colors duration-300">
                                      {cls.name}
                                    </div>
                                    {cls.age && (
                                      <div className="text-sm text-gray-500 mt-2">
                                        {typeof cls.age === 'number' ? `${cls.age} years` : cls.age}
                                      </div>
                                    )}
                                    {cls.description && (
                                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {cls.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#246a59]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="fixed right-6 bottom-24 max-w-xs">
        <div className="bg-white border border-[#246a59]/20 rounded-lg shadow-lg p-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[#246a59]/10 rounded-full">
              <Lightbulb className="w-5 h-5 text-[#246a59]" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Quick Tip</h4>
              <p className="text-sm text-gray-600 mt-1">
                {currentStep === 1 ? 'Select a school type that best matches your curriculum needs.' : 
                 currentStep === 2 ? 'Click on levels to select which grades your school will offer.' : 
                 'Add your teaching staff details in the next step.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#246a59]/10 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-start">
            <div className="text-sm text-gray-500">
              {canProceed ? 
                <span className="flex items-center">
                  <Check className="w-4 h-4 text-[#246a59] mr-2" />
                  {getSelectedLevelsCount(selectedType)} levels selected
                </span> : 
                'Please select at least one level to continue'
              }
            </div>
          </div>
          <button
            onClick={handleContinue}
            disabled={!canProceed || isLoading}
            className={`w-full sm:w-auto px-8 py-3 relative overflow-hidden transition-all duration-300 rounded-md ${
              canProceed && !isLoading
                ? 'bg-[#246a59] hover:bg-[#246a59]/90 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Continue Setup</span>
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </div>
            {canProceed && !isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}