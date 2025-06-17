"use client"

import { useState, useMemo } from 'react'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { Button } from "@/components/ui/button"
import { 
  Key, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Gamepad2,
  Database,
  Circle,
  CheckCircle
} from "lucide-react"

interface Credential {
  id: number
  store_name: string
  provider: 'GAMEROOM' | 'GAMEVAULT'
  username: string
  password?: string
  status: 'active' | 'inactive'
  created_at: string
}

// Mock credentials data
const mockCredentials: { [key: number]: Credential } = {
  1: {
    id: 1,
    store_name: "GameStore Alpha",
    provider: "GAMEROOM",
    username: "gamestore_alpha",
    password: "********",
    status: "active",
    created_at: "2024-01-15T10:30:00Z"
  },
  2: {
    id: 2,
    store_name: "BetaCasino",
    provider: "GAMEVAULT",
    username: "betacasino_gv",
    password: "********",
    status: "active",
    created_at: "2024-01-16T14:20:00Z"
  },
  3: {
    id: 3,
    store_name: "Lucky Games",
    provider: "GAMEROOM",
    username: "lucky_games",
    password: "********",
    status: "inactive",
    created_at: "2024-01-17T09:15:00Z"
  }
}

const credentialStats = [
  {
    title: "Total Credentials",
    value: "12",
    change: "+2 this month",
    icon: Key,
    color: "text-blue-600"
  },
  {
    title: "Active Providers",
    value: "8",
    change: "66.7% connected",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    title: "GAMEROOM Configs",
    value: "5",
    change: "83.3% success rate",
    icon: Gamepad2,
    color: "text-purple-600"
  },
  {
    title: "GAMEVAULT Configs",
    value: "3",
    change: "95.2% success rate",
    icon: Database,
    color: "text-emerald-600"
  },
]

export default function CredentialsPage() {
  const [selectedCredential, setSelectedCredential] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleCredentialSelect = (credId: string) => {
    setSelectedCredential(credId)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setSelectedCredential('all')
  }

  // Get the selected credential details
  const currentCredential = selectedCredential !== 'all' ? mockCredentials[parseInt(selectedCredential)] : null

  // Add filtering logic
  const filteredCredentials = useMemo(() => {
    if (!searchTerm) return Object.values(mockCredentials)
    return Object.values(mockCredentials).filter(cred => 
      cred.store_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      searchFilter={
        <SearchFilter 
          type="credentials" 
          onStoreSelect={handleCredentialSelect}
          onSearch={handleSearch}
        />
      }
      mobileNav={<MobileNav />}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-8">
          <div className="flex flex-col gap-2">
            <div className="inline-block w-fit px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
              <span className="text-xs font-mono tracking-wide text-slate-600 dark:text-slate-400 uppercase">
                Provider Access
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                Provider Credentials
              </h1>
              <Button className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs tracking-wide uppercase">
                <Plus className="mr-2 h-4 w-4" />
                New Credential
              </Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Manage provider access credentials for game stores
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {credentialStats.map((stat) => (
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

        {/* Overview Table when no credential is selected */}
        {!currentCredential && (
          <div className="border-2 border-slate-200 dark:border-slate-700">
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
                        Provider
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Username
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
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700">
                  {filteredCredentials.map((cred) => (
                    <tr key={cred.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium">{cred.store_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex px-2 py-1 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800">
                          {cred.provider}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm">{cred.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Circle className={`w-2 h-2 ${
                            cred.status === 'active' 
                              ? 'fill-emerald-500 text-emerald-500' 
                              : 'fill-red-500 text-red-500'
                          }`} />
                          <span className="text-xs font-mono uppercase">
                            {cred.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {formatDate(cred.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => handleCredentialSelect(cred.id.toString())}
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
        )}

        {/* Show credential details when one is selected */}
        {currentCredential && (
          <div className="space-y-6">
            {/* Credential Overview */}
            <div className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-mono font-bold">{currentCredential.store_name}</h2>
                <div className="flex items-center gap-2">
                  <Circle className={`w-2 h-2 ${
                    currentCredential.status === 'active' 
                      ? 'fill-emerald-500 text-emerald-500' 
                      : 'fill-red-500 text-red-500'
                  }`} />
                  <span className="text-xs font-mono uppercase">{currentCredential.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Provider</label>
                    <div className="font-mono text-sm mt-1">{currentCredential.provider}</div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Username</label>
                    <div className="font-mono text-sm mt-1">{currentCredential.username}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Created</label>
                    <div className="font-mono text-sm mt-1">
                      {new Date(currentCredential.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Password</label>
                    <div className="font-mono text-sm mt-1">{currentCredential.password}</div>
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
                  Update Credential
                </Button>
                <Button 
                  variant="outline"
                  className="h-9 px-4 border-2 font-mono text-xs tracking-wide uppercase text-red-500 hover:text-red-600"
                >
                  Delete Credential
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 