"use client"

import { useState } from 'react'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { Button } from "@/components/ui/button"
import { Circle, Database, Activity, Signal, Globe } from "lucide-react"

interface Provider {
  id: number
  name: 'GAMEROOM' | 'GAMEVAULT'
  base_url: string
  status: 'active' | 'inactive'
  total_stores: number
  total_requests: string
  uptime: string
  created_at: string
}

// Mock providers data
const mockProviders: { [key: number]: Provider } = {
  1: {
    id: 1,
    name: "GAMEROOM",
    base_url: "https://agentserver.gameroom777.com",
    status: "active",
    total_stores: 15,
    total_requests: "1.2M",
    uptime: "99.9%",
    created_at: "2024-01-15T10:30:00Z"
  },
  2: {
    id: 2,
    name: "GAMEVAULT",
    base_url: "https://agent.gamevault999.com",
    status: "active",
    total_stores: 8,
    total_requests: "856K",
    uptime: "99.7%",
    created_at: "2024-01-16T14:20:00Z"
  }
}

const providerStats = [
  {
    title: "Total Providers",
    value: "2",
    change: "All systems operational",
    icon: Globe,
    color: "text-blue-600"
  },
  {
    title: "Active Connections",
    value: "23",
    change: "Across all providers",
    icon: Signal,
    color: "text-green-600"
  },
  {
    title: "Total Requests",
    value: "2.1M",
    change: "+12% this month",
    icon: Activity,
    color: "text-purple-600"
  },
  {
    title: "Average Uptime",
    value: "99.8%",
    change: "Last 30 days",
    icon: Database,
    color: "text-emerald-600"
  }
]

export default function ProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('all')

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
  }

  // Get the selected provider details
  const currentProvider = selectedProvider !== 'all' ? mockProviders[parseInt(selectedProvider)] : null

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      searchFilter={
        <SearchFilter 
          type="providers" 
          onStoreSelect={handleProviderSelect}
        />
      }
      mobileNav={<MobileNav />}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-8">
          <div className="flex flex-col gap-2">
            <div className="inline-block w-fit px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
              <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Game Providers
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                Provider Status
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Monitor game provider status and performance
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providerStats.map((stat) => (
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

        {/* Overview Table when no provider is selected */}
        {!currentProvider && (
          <div className="border-2 border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Provider
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Status
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Base URL
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Stores
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Uptime
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
                  {Object.values(mockProviders).map((provider) => (
                    <tr key={provider.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium">{provider.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Circle className={`w-2 h-2 ${
                            provider.status === 'active' 
                              ? 'fill-emerald-500 text-emerald-500' 
                              : 'fill-red-500 text-red-500'
                          }`} />
                          <span className="text-xs font-mono uppercase">
                            {provider.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {provider.base_url}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm">{provider.total_stores}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm">{provider.uptime}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost"
                          className="h-8 px-3 font-mono text-xs tracking-wide uppercase"
                          onClick={() => handleProviderSelect(provider.id.toString())}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Show provider details when one is selected */}
        {currentProvider && (
          <div className="space-y-6">
            <div className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-mono font-bold">{currentProvider.name}</h2>
                <div className="flex items-center gap-2">
                  <Circle className={`w-2 h-2 ${
                    currentProvider.status === 'active' 
                      ? 'fill-emerald-500 text-emerald-500' 
                      : 'fill-red-500 text-red-500'
                  }`} />
                  <span className="text-xs font-mono uppercase">{currentProvider.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Base URL</label>
                    <div className="font-mono text-sm mt-1">{currentProvider.base_url}</div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Total Stores</label>
                    <div className="font-mono text-sm mt-1">{currentProvider.total_stores}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Total Requests</label>
                    <div className="font-mono text-sm mt-1">{currentProvider.total_requests}</div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Uptime</label>
                    <div className="font-mono text-sm mt-1">{currentProvider.uptime}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 