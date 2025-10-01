"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Circle, GraduationCap, Users } from "lucide-react"
import { useEffect, useState, useMemo } from 'react'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useStudentsStore } from '@/lib/stores/useStudentsStore'
import { mockClasses } from '@/lib/data/mockclasses'

// Helper function to get the numeric value from a grade name (e.g., "Grade 1" -> 1)
function getGradeNumber(gradeName: string): number {
  const match = gradeName.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
}

// Helper function to convert grade names to display names
function getGradeDisplayName(gradeName: string): string {
  const lowerName = gradeName.toLowerCase();
  
  // Handle special cases first
  if (lowerName.includes('pp1') || lowerName.includes('baby')) return 'PP1';
  if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 'PP2';
  if (lowerName.includes('pp3') || lowerName.includes('reception')) return 'PP3';
  
  // Handle Form grades (Grade 7+ becomes Form 1+)
  if (lowerName.includes('grade 7') || lowerName.includes('g7')) return 'Form 1';
  if (lowerName.includes('grade 8') || lowerName.includes('g8')) return 'Form 2';
  if (lowerName.includes('grade 9') || lowerName.includes('g9')) return 'Form 3';
  if (lowerName.includes('grade 10') || lowerName.includes('g10')) return 'Form 4';
  if (lowerName.includes('grade 11') || lowerName.includes('g11')) return 'Form 5';
  if (lowerName.includes('grade 12') || lowerName.includes('g12')) return 'Form 6';
  
  // Handle regular grade numbers
  const match = gradeName.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 6) {
      return `Grade ${num}`;
    }
  }
  
  // If no pattern matches, return the original name
  return gradeName;
}

// Helper function to sort grades
function sortGrades(grades: Array<Omit<Grade, 'displayName'>>): Array<Omit<Grade, 'displayName'>> {
  return [...grades].sort((a, b) => {
    const aNum = getGradeNumber(a.name);
    const bNum = getGradeNumber(b.name);
    
    // Special handling for PP grades
    const aIsPP = a.name.toLowerCase().includes('pp');
    const bIsPP = b.name.toLowerCase().includes('pp');
    
    if (aIsPP && !bIsPP) return -1;
    if (!aIsPP && bIsPP) return 1;
    
    // For PP grades, sort by number
    if (aIsPP && bIsPP) {
      return aNum - bNum;
    }
    
    // For regular grades, sort in ascending order
    return aNum - bNum;
  });
}

interface Store {
  id: number
  name: string
  created_at: string
}

interface APIKey {
  id: number
  key: string
  store_name: string
  status: 'active' | 'inactive'
  created_at: string
}

interface Credential {
  id: number
  store_name: string
  provider: 'GAMEROOM' | 'GAMEVAULT'
  username: string
  status: 'active' | 'inactive'
  created_at: string
}

interface Provider {
  id: number
  name: 'GAMEROOM' | 'GAMEVAULT'
  status: 'active' | 'inactive'
  created_at: string
}

interface Log {
  id: number
  store_name: string
  provider: 'GAMEROOM' | 'GAMEVAULT'
  operation: string
  status: 'success' | 'failed'
  timestamp: string
  request_id: string
}

interface Grade {
  id: string
  name: string
  displayName: string
  studentCount: number
  subjectCount: number
  classCount: number
  streams: Array<{
    id: string
    name: string
  }>
}

interface DashboardFilter {
  id: number
  name: string
  type: 'store' | 'provider' | 'status'
  value: string
  count: number
  created_at: string
}

interface SearchFilterProps {
  className?: string
  type?: 'logs' | 'providers' | 'stores' | 'credentials' | 'api-keys' | 'dashboard'
  onStoreSelect?: (storeId: string) => void
  onSearch?: (term: string) => void
}

interface FilterOption {
  value: string
  label: string
}

interface Filter {
  type: 'select' | 'date'
  label: string
  options?: FilterOption[]
}

interface FilterConfig {
  title: string
  filters: Filter[]
}

interface FilterConfigs {
  [key: string]: FilterConfig
}

// Add type guard
const isSelectFilter = (filter: Filter): filter is Filter & { options: FilterOption[] } => {
  return filter.type === 'select' && !!filter.options
}

// Update mock stores data with 5 stores
const mockStores = [
  {
    id: 1,
    name: "GameStore Alpha",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "BetaCasino",
    created_at: "2024-01-16T14:20:00Z"
  },
  {
    id: 3,
    name: "Lucky Games",
    created_at: "2024-01-17T09:15:00Z"
  },
  {
    id: 4,
    name: "VIP Casino",
    created_at: "2024-01-18T11:45:00Z"
  },
  {
    id: 5,
    name: "Royal Gaming",
    created_at: "2024-01-19T16:30:00Z"
  }
]

// Update mock API keys data with explicit status type
const mockAPIKeys: APIKey[] = [
  {
    id: 1,
    key: "gapi_k2n3j4n23k4...",
    store_name: "GameStore Alpha",
    status: "active" as const,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    key: "gapi_8h9j2k3h4k...",
    store_name: "BetaCasino",
    status: "active" as const,
    created_at: "2024-01-16T14:20:00Z"
  },
  {
    id: 3,
    key: "gapi_9k8l7j6h5g...",
    store_name: "Lucky Games",
    status: "inactive" as const,
    created_at: "2024-01-17T09:15:00Z"
  }
]

// Add mock credentials data
const mockCredentials: Credential[] = [
  {
    id: 1,
    store_name: "GameStore Alpha",
    provider: "GAMEROOM",
    username: "gamestore_alpha",
    status: "active" as const,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    store_name: "BetaCasino",
    provider: "GAMEVAULT",
    username: "betacasino_gv",
    status: "active" as const,
    created_at: "2024-01-16T14:20:00Z"
  },
  {
    id: 3,
    store_name: "Lucky Games",
    provider: "GAMEROOM",
    username: "lucky_games",
    status: "inactive" as const,
    created_at: "2024-01-17T09:15:00Z"
  }
]

// Add mock providers data
const mockProviders: Provider[] = [
  {
    id: 1,
    name: "GAMEROOM",
    status: "active" as const,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "GAMEVAULT",
    status: "active" as const,
    created_at: "2024-01-16T14:20:00Z"
  }
]

// Add mock logs data
const mockLogs: Log[] = [
  {
    id: 1,
    store_name: "GameStore Alpha",
    provider: "GAMEROOM",
    operation: "get_user_balance",
    status: "success",
    timestamp: "2024-01-15T10:30:00Z",
    request_id: "req_abc123"
  },
  {
    id: 2,
    store_name: "BetaCasino",
    provider: "GAMEVAULT",
    operation: "recharge",
    status: "failed",
    timestamp: "2024-01-15T10:35:00Z",
    request_id: "req_def456"
  },
  {
    id: 3,
    store_name: "Lucky Games",
    provider: "GAMEROOM",
    operation: "get_user_balance",
    status: "success",
    timestamp: "2024-01-15T10:40:00Z",
    request_id: "req_ghi789"
  }
]

// Get grades from school config store
const useGradesFromStore = () => {
  const { getAllGradeLevels, config } = useSchoolConfigStore();
  const { students } = useStudentsStore();
  const allGradeLevels = getAllGradeLevels();
  
  // Flatten all grades from all levels into a single array
  const grades = allGradeLevels.flatMap(level => 
    level.grades.map(grade => {
      // Count students in this grade
      const studentCount = students.filter(student => {
        if (typeof student.grade === 'string') return false
        return student.grade.gradeLevel.name.toLowerCase() === grade.name.toLowerCase()
      }).length;
      
      // Get subject count for this level
      const levelSubjects = config?.selectedLevels.find(l => l.id === level.levelId)?.subjects || [];
      const subjectCount = levelSubjects.length;
      
      // Count classes for this grade
      const classCount = mockClasses.filter(cls => 
        cls.grade.toLowerCase() === grade.name.toLowerCase() && cls.status === 'active'
      ).length;
      
      return {
        id: grade.id,
        name: grade.name,
        studentCount,
        subjectCount,
        classCount,
        streams: grade.streams || []
      };
    })
  );
  
  // Sort grades and add display names
  return sortGrades(grades).map(grade => ({
    ...grade,
    displayName: getGradeDisplayName(grade.name)
  }));
};

export function SearchFilter({ 
  className, 
  type = 'logs',
  onStoreSelect,
  onSearch
}: SearchFilterProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [visibleGrades, setVisibleGrades] = useState(5)
  
  // Get grades from store
  const grades = useGradesFromStore()

  useEffect(() => {
    if (type === 'stores') {
      setTimeout(() => {
        setStores(mockStores)
      }, 500)
    } else if (type === 'api-keys') {
      setTimeout(() => {
        setApiKeys(mockAPIKeys)
      }, 500)
    } else if (type === 'credentials') {
      setTimeout(() => {
        setCredentials(mockCredentials)
      }, 500)
    } else if (type === 'providers') {
      setTimeout(() => {
        setProviders(mockProviders)
      }, 500)
    } else if (type === 'logs') {
      setTimeout(() => {
        setLogs(mockLogs)
      }, 500)
    }
  }, [type])

  // Filter stores based on search term
  const filteredStores = useMemo(() => {
    if (!searchTerm) return stores
    const term = searchTerm.toLowerCase()
    return stores.filter(store => 
      store.name.toLowerCase().includes(term)
    )
  }, [stores, searchTerm])

  // Filter API keys based on search term
  const filteredAPIKeys = useMemo(() => {
    if (!searchTerm) return apiKeys
    const term = searchTerm.toLowerCase()
    return apiKeys.filter(key => 
      key.store_name.toLowerCase().includes(term) ||
      key.key.toLowerCase().includes(term)
    )
  }, [apiKeys, searchTerm])

  // Add credentials filter
  const filteredCredentials = useMemo(() => {
    if (!searchTerm) return credentials
    const term = searchTerm.toLowerCase()
    return credentials.filter(cred => 
      cred.store_name.toLowerCase().includes(term) ||
      cred.username.toLowerCase().includes(term) ||
      cred.provider.toLowerCase().includes(term)
    )
  }, [credentials, searchTerm])

  // Add providers filter
  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers
    const term = searchTerm.toLowerCase()
    return providers.filter(provider => 
      provider.name.toLowerCase().includes(term)
    )
  }, [providers, searchTerm])

  // Add logs filter
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs
    const term = searchTerm.toLowerCase()
    return logs.filter(log => 
      log.store_name.toLowerCase().includes(term) ||
      log.operation.toLowerCase().includes(term) ||
      log.request_id.toLowerCase().includes(term)
    )
  }, [logs, searchTerm])

  // Add grades filter
  const filteredGrades = useMemo(() => {
    if (!searchTerm) return grades
    const term = searchTerm.toLowerCase()
    return grades.filter(grade => 
      grade.name.toLowerCase().includes(term) ||
      grade.displayName.toLowerCase().includes(term) ||
      grade.id.toLowerCase().includes(term)
    )
  }, [grades, searchTerm])

  // Get visible grades for pagination
  const visibleGradesList = useMemo(() => {
    return filteredGrades.slice(0, visibleGrades)
  }, [filteredGrades, visibleGrades])

  // Check if there are more grades to show
  const hasMoreGrades = visibleGrades < filteredGrades.length

  // Handle expand/collapse grades
  const handleExpandGrades = () => {
    setVisibleGrades(prev => prev + 5)
  }

  const handleCollapseGrades = () => {
    setVisibleGrades(5)
  }

  const filterConfigs: FilterConfigs = {
    'stores': {
      title: 'Store List',
      filters: [] // Remove filters since we're using a custom list view
    },
    'logs': {
      title: 'Log Filters',
      filters: [
        {
          type: 'select',
          label: 'Store ID',
          options: [
            { value: 'all', label: 'All Stores' },
            ...mockStores.map(store => ({
              value: store.id.toString(),
              label: store.name
            }))
          ]
        },
        {
          type: 'select',
          label: 'Provider',
          options: [
            { value: 'all', label: 'All Providers' },
            { value: 'GAMEROOM', label: 'GAMEROOM' },
            { value: 'GAMEVAULT', label: 'GAMEVAULT' }
          ]
        },
        {
          type: 'select',
          label: 'Operation',
          options: [
            { value: 'all', label: 'All Operations' },
            { value: 'get_user_balance', label: 'Get Balance' },
            { value: 'recharge', label: 'Recharge' }
          ]
        },
        {
          type: 'select',
          label: 'Status',
          options: [
            { value: 'all', label: 'All Status' },
            { value: 'success', label: 'Successful' },
            { value: 'failed', label: 'Failed' }
          ]
        },
        {
          type: 'date',
          label: 'Date From'
        },
        {
          type: 'date',
          label: 'Date To'
        }
      ]
    },
    'credentials': {
      title: 'Credential Filters',
      filters: [
        {
          type: 'select',
          label: 'Store ID',
          options: [
            { value: 'all', label: 'All Stores' },
            ...mockStores.map(store => ({
              value: store.id.toString(),
              label: store.name
            }))
          ]
        },
        {
          type: 'select',
          label: 'Provider',
          options: [
            { value: 'all', label: 'All Providers' },
            { value: 'GAMEROOM', label: 'GAMEROOM' },
            { value: 'GAMEVAULT', label: 'GAMEVAULT' }
          ]
        }
      ]
    },
    'api-keys': {
      title: 'API Key Filters',
      filters: [
        {
          type: 'select',
          label: 'Store ID',
          options: [
            { value: 'all', label: 'All Stores' },
            ...mockStores.map(store => ({
              value: store.id.toString(),
              label: store.name
            }))
          ]
        }
      ]
    },
    'providers': {
      title: 'Provider Filters',
      filters: [
        {
          type: 'select',
          label: 'Provider',
          options: [
            { value: 'all', label: 'All Providers' },
            { value: 'GAMEROOM', label: 'GAMEROOM' },
            { value: 'GAMEVAULT', label: 'GAMEVAULT' }
          ]
        }
      ]
    },
    'dashboard': {
      title: 'Dashboard Filters',
      filters: [
        {
          type: 'select',
          label: 'Filter',
          options: [
            { value: 'all', label: 'All Filters' },
            ...grades.map(grade => ({
              value: grade.id,
              label: grade.name
            }))
          ]
        }
      ]
    }
  }

  const currentConfig = filterConfigs[type]

  const handleItemClick = (id: string) => {
    setSelectedStore(id)
    if (onStoreSelect) {
      onStoreSelect(id)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    // Reset visible grades when search changes
    setVisibleGrades(5)
    onSearch?.(term)
    // Reset store selection when searching
    setSelectedStore('all')
  }

  return (
    <div className={`bg-white dark:bg-slate-900 shadow-lg ${className}`}>
      {/* Search */}
      <div className="p-6 border-b dark:border-slate-700">
        <Label htmlFor="search" className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Search {currentConfig.title}
        </Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            id="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={`Search ${type}...`}
            className="h-11 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-[#246a59] dark:focus-visible:ring-[#246a59]/50 font-mono text-sm"
          />
        </div>
      </div>

      {/* Lists Container */}
      <div className="p-6 space-y-6">
        {/* Store List - Only show for stores page */}
        {type === 'stores' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Stores
            </div>
            
            <div className="space-y-2">
              {filteredStores.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">No stores found</p>
                </div>
              ) : (
                filteredStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleItemClick(store.id.toString())}
                    className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                      ${selectedStore === store.id.toString()
                        ? 'bg-[#246a59]/5 dark:bg-[#246a59]/10 shadow-sm border border-[#246a59]/20' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#246a59]/30 hover:shadow-md'
                      }`}
                  >
                    <div className="font-mono font-medium group-hover:text-[#246a59] transition-colors">
                      {store.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Created: {new Date(store.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* API Keys List */}
        {type === 'api-keys' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              API Keys
            </div>
            
            <div className="space-y-2">
              {filteredAPIKeys.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">No API keys found</p>
                </div>
              ) : (
                filteredAPIKeys.map((key) => (
                  <button
                    key={key.id}
                    onClick={() => handleItemClick(key.id.toString())}
                    className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                      ${selectedStore === key.id.toString()
                        ? 'bg-[#246a59]/5 dark:bg-[#246a59]/10 shadow-sm border border-[#246a59]/20' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#246a59]/30 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-medium group-hover:text-[#246a59] transition-colors">
                        {key.store_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className={`w-2 h-2 ${
                          key.status === 'active' 
                            ? 'fill-emerald-500 text-emerald-500' 
                            : 'fill-red-500 text-red-500'
                        }`} />
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      {key.key}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Credentials List */}
        {type === 'credentials' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Credentials
            </div>
            
            <div className="space-y-2">
              {filteredCredentials.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">No credentials found</p>
                </div>
              ) : (
                filteredCredentials.map((cred) => (
                  <button
                    key={cred.id}
                    onClick={() => handleItemClick(cred.id.toString())}
                    className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                      ${selectedStore === cred.id.toString()
                        ? 'bg-[#246a59]/5 dark:bg-[#246a59]/10 shadow-sm border border-[#246a59]/20' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#246a59]/30 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-medium group-hover:text-[#246a59] transition-colors">
                        {cred.store_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 bg-[#246a59]/5 dark:bg-[#246a59]/10 text-[#246a59] dark:text-[#246a59]/90 text-xs font-mono rounded-md border border-[#246a59]/20">
                          {cred.provider}
                        </div>
                        <Circle className={`w-2 h-2 ${
                          cred.status === 'active' 
                            ? 'fill-emerald-500 text-emerald-500' 
                            : 'fill-red-500 text-red-500'
                        }`} />
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Username: <span className="font-medium">{cred.username}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Providers List */}
        {type === 'providers' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Providers
            </div>
            
            <div className="space-y-2">
              {filteredProviders.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">No providers found</p>
                </div>
              ) : (
                filteredProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleItemClick(provider.id.toString())}
                    className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                      ${selectedStore === provider.id.toString()
                        ? 'bg-[#246a59]/5 dark:bg-[#246a59]/10 shadow-sm border border-[#246a59]/20' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#246a59]/30 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-medium group-hover:text-[#246a59] transition-colors">
                        {provider.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className={`w-2 h-2 ${
                          provider.status === 'active' 
                            ? 'fill-emerald-500 text-emerald-500' 
                            : 'fill-red-500 text-red-500'
                        }`} />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Logs List */}
        {type === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Recent Logs
            </div>
            
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">No logs found</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => handleItemClick(log.id.toString())}
                    className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                      ${selectedStore === log.id.toString()
                        ? 'bg-[#246a59]/5 dark:bg-[#246a59]/10 shadow-sm border border-[#246a59]/20' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#246a59]/30 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-medium group-hover:text-[#246a59] transition-colors">
                        {log.store_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 bg-[#246a59]/5 dark:bg-[#246a59]/10 text-[#246a59] dark:text-[#246a59]/90 text-xs font-mono rounded-md border border-[#246a59]/20">
                          {log.provider}
                        </div>
                        <Circle className={`w-2 h-2 ${
                          log.status === 'success' 
                            ? 'fill-emerald-500 text-emerald-500' 
                            : 'fill-red-500 text-red-500'
                        }`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        {log.operation}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Request ID: <span className="font-medium">{log.request_id}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Dashboard Filters */}
        {type === 'dashboard' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <GraduationCap className="h-3.5 w-3.5" />
              Grade Filters
            </div>
            
            <div className="space-y-2">
              {filteredGrades.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">No grades found</p>
                </div>
              ) : (
                <>
                  {visibleGradesList.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => handleItemClick(grade.id)}
                    className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                      ${selectedStore === grade.id
                        ? 'bg-[#246a59]/5 dark:bg-[#246a59]/10 shadow-sm border border-[#246a59]/20' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#246a59]/30 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#246a59]/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-[#246a59]" />
                        </div>
                        <div className="text-left">
                          <div className="font-mono font-medium group-hover:text-[#246a59] transition-colors">
                            {grade.displayName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {grade.studentCount} students • {grade.subjectCount} subjects
                            {grade.streams.length > 0 && ` • ${grade.streams.length} streams`}
                          </div>
                        </div>
                      </div>
                      {grade.streams.length > 0 && (
                        <div className="px-2.5 py-1 bg-[#246a59]/5 dark:bg-[#246a59]/10 text-[#246a59] dark:text-[#246a59]/90 text-xs font-mono rounded-md border border-[#246a59]/20">
                          {grade.streams.length} streams
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                      <span>{grade.classCount} classes</span>
                    </div>
                  </button>
                  ))}
                  
                  {/* Expand/Collapse Button */}
                  {hasMoreGrades && (
                    <button
                      onClick={handleExpandGrades}
                      className="w-full p-3 text-center rounded-lg transition-all duration-200 group cursor-pointer bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#246a59]/30 hover:shadow-md"
                    >
                      <div className="text-sm font-mono text-[#246a59] group-hover:text-[#246a59]/80 transition-colors">
                        Show {Math.min(5, filteredGrades.length - visibleGrades)} more grades
                      </div>
                    </button>
                  )}
                  
                  {/* Collapse Button - Show when more than 5 grades are visible */}
                  {visibleGrades > 5 && (
                    <button
                      onClick={handleCollapseGrades}
                      className="w-full p-3 text-center rounded-lg transition-all duration-200 group cursor-pointer bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#246a59]/30 hover:shadow-md"
                    >
                      <div className="text-sm font-mono text-[#246a59] group-hover:text-[#246a59]/80 transition-colors">
                        Show less
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Other filter types */}
        {type !== 'stores' && type !== 'api-keys' && type !== 'credentials' && type !== 'providers' && type !== 'logs' && type !== 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              {currentConfig.title}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentConfig.filters.map((filter, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {filter.label}
                  </Label>
                  {filter.type === 'select' && isSelectFilter(filter) ? (
                    <Select 
                      defaultValue="all" 
                      onValueChange={handleItemClick}
                    >
                      <SelectTrigger className="h-10 font-mono text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : filter.type === 'date' ? (
                    <Input 
                      type="date"
                      className="h-10 font-mono text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <Button className="w-full h-10 bg-[#246a59] hover:bg-[#246a59]/90 font-mono text-xs tracking-wide uppercase">
              Apply Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 