"use client"

import { useState } from 'react'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { Button } from "@/components/ui/button"
import { 
  Key, 
  Plus, 
  MoreHorizontal, 
  Copy, 
  RefreshCw, 
  Eye, 
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Circle
} from "lucide-react"

const apiKeyStats = [
  {
    title: "Total API Keys",
    value: "24",
    change: "+3 this month",
    icon: Key,
    color: "text-blue-600"
  },
  {
    title: "Active Keys",
    value: "21",
    change: "87.5% usage rate",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    title: "Total Requests",
    value: "1.2M",
    change: "+15% vs last month",
    icon: Activity,
    color: "text-purple-600"
  },
  {
    title: "Success Rate",
    value: "98.7%",
    change: "+0.2% vs last month",
    icon: TrendingUp,
    color: "text-emerald-600"
  },
]

// Define the API key type
interface APIKey {
  id: number
  key: string
  store_id: number
  store_name: string
  usage_count: number
  created_at: string
  updated_at: string
  status: 'active' | 'inactive'
}

// Mock API key data
const mockAPIKeys: { [key: number]: APIKey } = {
  1: {
    id: 1,
    key: "gapi_k2n3j4n23k4...",
    store_id: 1,
    store_name: "GameStore Alpha",
    usage_count: 15420,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    status: "active"
  },
  2: {
    id: 2,
    key: "gapi_8h9j2k3h4k...",
    store_id: 2,
    store_name: "BetaCasino",
    usage_count: 8934,
    created_at: "2024-01-16T14:20:00Z",
    updated_at: "2024-01-16T14:20:00Z",
    status: "active"
  },
  3: {
    id: 3,
    key: "gapi_9k8l7j6h5g...",
    store_id: 3,
    store_name: "Lucky Games",
    usage_count: 12345,
    created_at: "2024-01-17T09:15:00Z",
    updated_at: "2024-01-17T09:15:00Z",
    status: "inactive"
  }
}

export default function APIKeysPage() {
  const [selectedKey, setSelectedKey] = useState<string>('all')

  const handleKeySelect = (keyId: string) => {
    setSelectedKey(keyId)
  }

  const handleSearch = () => {
    setSelectedKey('all')
  }

  // Get the selected API key details
  const currentKey = selectedKey !== 'all' ? mockAPIKeys[parseInt(selectedKey)] : null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      searchFilter={
        <SearchFilter 
          type="api-keys" 
          onStoreSelect={handleKeySelect}
          onSearch={handleSearch}
        />
      }
      mobileNav={<MobileNav />}
    >
      <div className="space-y-6 md:space-y-8">
        {/* Page Header */}
        <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-6 md:pb-8">
          <div className="flex flex-col gap-2">
            <div className="inline-block w-fit px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
              <span className="text-xs font-mono tracking-wide text-slate-600 dark:text-slate-400 uppercase">
                Security
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                API Keys
              </h1>
              <Button className="w-full sm:w-auto h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs tracking-wide uppercase">
                <Plus className="mr-2 h-4 w-4" />
                Generate Key
              </Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Manage API keys and access credentials for game stores
            </p>
          </div>
        </div>

        {/* Stats Grid - Added for better overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apiKeyStats.map((stat) => (
            <div key={stat.title} className="border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <div className="flex items-center gap-3">
                <div className={`${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-mono font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show message when no API key is selected */}
        {!currentKey && (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            <p className="font-mono">Select an API key from the list to view details</p>
          </div>
        )}

        {/* Show API key details when one is selected */}
        {currentKey && (
          <div className="space-y-6">
            {/* API Key Overview */}
            <div className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-mono font-bold">{currentKey.store_name}</h2>
                <div className="flex items-center gap-2">
                  <Circle className={`w-2 h-2 ${
                    currentKey.status === 'active' 
                      ? 'fill-emerald-500 text-emerald-500' 
                      : 'fill-red-500 text-red-500'
                  }`} />
                  <span className="text-xs font-mono uppercase">{currentKey.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">API Key</label>
                    <div className="font-mono text-sm mt-1">{currentKey.key}</div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Usage Count</label>
                    <div className="font-mono text-sm mt-1">{currentKey.usage_count.toLocaleString()}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Created</label>
                    <div className="font-mono text-sm mt-1">
                      {new Date(currentKey.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Last Updated</label>
                    <div className="font-mono text-sm mt-1">
                      {new Date(currentKey.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <h3 className="text-sm font-mono uppercase text-slate-500 mb-4">Actions</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="h-9 px-4 border-2 font-mono text-xs tracking-wide uppercase"
                >
                  Regenerate Key
                </Button>
                <Button 
                  variant="outline"
                  className="h-9 px-4 border-2 font-mono text-xs tracking-wide uppercase text-red-500 hover:text-red-600"
                >
                  Revoke Key
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile List View */}
        <div className="block md:hidden space-y-4">
          {Object.values(mockAPIKeys).map((key) => (
            <div 
              key={key.id}
              className="border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-medium">{key.store_name}</div>
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                    <span className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
                      {key.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">
                    API Key
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400 truncate">
                      {key.key}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() => copyToClipboard(key.key)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">
                      Created
                    </div>
                    <div className="text-xs mt-1">{new Date(key.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">
                      Last Used
                    </div>
                    <div className="text-xs mt-1">{new Date(key.updated_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">
                      Usage
                    </div>
                    <div className="font-mono text-sm mt-1">{key.usage_count.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t-2 border-slate-200 dark:border-slate-700 p-4 flex justify-end gap-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 font-mono text-xs tracking-wide uppercase"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 font-mono text-xs tracking-wide uppercase"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rotate
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border-2 border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Store
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      API Key
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Status
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Created
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Last Used
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Usage
                    </span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700">
                {Object.values(mockAPIKeys).map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium">{key.store_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {key.key}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                        <span className="text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
                          {key.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {new Date(key.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(key.updated_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm">{key.usage_count.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-amber-700 dark:text-amber-400">
              <span className="font-bold uppercase tracking-wide">Security Notice:</span>
              {" "}API keys grant full access to the SQUL system. Keep them secure and rotate regularly.
              Never share or expose API keys in client-side code or public repositories.
            </div>
          </div>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            Showing 2 of 2 API keys
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              className="h-8 px-3 border-2 border-slate-200 dark:border-slate-700 font-mono text-xs tracking-wide uppercase"
              disabled
            >
              Previous
            </Button>
            <Button 
              variant="outline"
              className="h-8 px-3 border-2 border-slate-200 dark:border-slate-700 font-mono text-xs tracking-wide uppercase"
              disabled
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 