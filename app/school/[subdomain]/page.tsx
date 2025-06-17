'use client'

import { useParams } from 'next/navigation'
import { Building2, Home, School, Globe, Check } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
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
  const subdomain = params.subdomain as string
  const [selectedType, setSelectedType] = useState<string>('cbc')
  const [selectedLevels, setSelectedLevels] = useState<Record<string, Set<string>>>({
    cbc: new Set()
  })
  const [pendingToast, setPendingToast] = useState<{type: 'success' | 'error', message: string} | null>(null)

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
          level: 'Lower Primary',
          classes: [
            { name: 'Class 1' }, { name: 'Class 2' },
            { name: 'Class 3' }, { name: 'Class 4' }
          ]
        },
        {
          level: 'Upper Primary',
          classes: [
            { name: 'Class 5' }, { name: 'Class 6' },
            { name: 'Class 7' }, { name: 'Class 8' }
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
      const selectedLevelsList = Array.from(selectedLevels[selectedType])
      toast.success(`Proceeding with ${selectedLevelsList.length} levels: ${selectedLevelsList.join(', ')}`)
    }
  }

  const getSelectedLevelsCount = (typeId: string) => {
    return selectedLevels[typeId]?.size || 0
  }

  const canProceed = selectedType && getSelectedLevelsCount(selectedType) > 0

  const selectedSchoolType = schoolTypes.find(type => type.id === selectedType)

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
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#246a59]/10 to-transparent"></div>
          <div className="relative">
            <div className="text-center space-y-6">
              <div className="inline-block">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-[#246a59] to-[#2d8872] bg-clip-text text-transparent">
                  Welcome to
                </h1>
                <h2 className="text-4xl md:text-6xl font-bold mt-2 text-gray-900">
                  {subdomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h2>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Begin your educational journey by selecting your school type and levels. 
                Our platform is designed to support your unique educational needs.
              </p>
              <div className="flex justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#246a59] mr-2" />
                  Personalized Learning
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#246a59] mr-2" />
                  Expert Support
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#246a59] mr-2" />
                  Comprehensive Tools
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8 pb-8">
          {/* Sidebar with School Types */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-4 space-y-3">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">School Types</h3>
                <p className="text-sm text-gray-500">Choose the curriculum that best fits your educational goals.</p>
              </div>
              {schoolTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.id
                const selectedLevelCount = getSelectedLevelsCount(type.id)

                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className={`group w-full p-4 border-l-4 transition-all duration-300 relative overflow-hidden ${
                      isSelected
                        ? 'border-l-[#246a59] bg-[#246a59]/5 shadow-lg'
                        : 'border-l-transparent bg-white hover:border-l-[#246a59]/50'
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

          {/* Main Content - Levels */}
          <div className="flex-1">
            {selectedSchoolType && (
              <div className="space-y-6">
                <div className="bg-white border-l-4 border-l-[#246a59] p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-[#246a59] mb-2 flex items-center">
                        {selectedSchoolType.title}
                        {selectedSchoolType.emoji && (
                          <span className="ml-2">{selectedSchoolType.emoji}</span>
                        )}
                      </h2>
                      <p className="text-gray-600">{selectedSchoolType.description}</p>
                    </div>
                    <div className="bg-[#246a59]/5 px-4 py-2 rounded-sm">
                      <span className="text-sm font-medium text-[#246a59]">
                        {getSelectedLevelsCount(selectedType)} levels selected
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedSchoolType.menu.map((item, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium bg-[#246a59]/10 text-[#246a59] hover:bg-[#246a59]/20 transition-colors duration-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSchoolType.levels.map((level) => {
                    const isSelected = selectedLevels[selectedType]?.has(level.level) || false
                    return (
                      <div
                        key={level.level}
                        className={`group relative overflow-hidden transition-all duration-300 ${
                          isSelected
                            ? 'bg-[#246a59]/5 shadow-lg'
                            : 'bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="absolute inset-0 border-2 border-transparent transition-colors duration-300 pointer-events-none
                          group-hover:border-[#246a59]/30
                          ${isSelected ? '!border-[#246a59]' : ''}"
                        ></div>
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-semibold transition-colors duration-300 ${
                                isSelected
                                  ? 'text-[#246a59]'
                                  : 'text-gray-900'
                              }`}>{level.level}</h3>
                              {level.description && (
                                <p className="text-sm text-gray-500 mt-1">{level.description}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => toggleLevel(e, selectedType, level.level)}
                              className={`relative w-6 h-6 border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                                isSelected
                                  ? 'border-[#246a59] bg-[#246a59] text-white'
                                  : 'border-gray-300 group-hover:border-[#246a59]/50'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {level.classes.map((cls) => (
                              <div
                                key={cls.name}
                                className="relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#246a59]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative p-2 border-l-2 border-[#246a59]/20 group-hover:border-[#246a59]/40 transition-colors duration-300">
                                  <div className="font-medium text-gray-700">{cls.name}</div>
                                  {cls.age && (
                                    <div className="text-gray-500 text-xs">Age: {cls.age}</div>
                                  )}
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

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#246a59]/10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center space-x-4">
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
            disabled={!canProceed}
            className={`px-8 py-3 relative overflow-hidden transition-all duration-300 ${
              canProceed
                ? 'bg-[#246a59] hover:bg-[#246a59]/90 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="relative z-10">Continue Setup</div>
            {canProceed && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 