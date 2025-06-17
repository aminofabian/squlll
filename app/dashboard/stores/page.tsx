"use client"

import { useState, useMemo } from 'react'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { Button } from "@/components/ui/button"
import { Plus, Circle, Users, ShoppingBag, CreditCard, TrendingUp, Wallet, Building2, ArrowUpRight } from "lucide-react"
import { MobileNav } from "@/components/dashboard/MobileNav"

// Define the store type
interface Store {
  id: number
  name: string
  status: string
  apiKey: string
  requests: string
  lastActive: string
  providers: string[]
  created_at: string
}

// Type for the mock store details
interface StoreDetails {
  [key: number]: Store
}

// Mock store data with more details
const mockStoreDetails: StoreDetails = {
  1: {
    id: 1,
    name: "GameStore Alpha",
    status: "active",
    apiKey: "gapi_k2n3j4n23k4...",
    requests: "15,420",
    lastActive: "2 minutes ago",
    providers: ["GAMEROOM", "GAMEVAULT"],
    created_at: "2024-01-15T10:30:00Z"
  },
  2: {
    id: 2,
    name: "BetaCasino",
    status: "active",
    apiKey: "gapi_8h9j2k3h4k...",
    requests: "8,934",
    lastActive: "5 minutes ago",
    providers: ["GAMEROOM"],
    created_at: "2024-01-16T14:20:00Z"
  },
  3: {
    id: 3,
    name: "Lucky Games",
    status: "active",
    apiKey: "gapi_9k8l7j6h5g...",
    requests: "12,345",
    lastActive: "10 minutes ago",
    providers: ["GAMEROOM", "GAMEVAULT"],
    created_at: "2024-01-17T09:15:00Z"
  },
  4: {
    id: 4,
    name: "VIP Casino",
    status: "active",
    apiKey: "gapi_4f5g6h7j8k...",
    requests: "21,567",
    lastActive: "1 hour ago",
    providers: ["GAMEVAULT"],
    created_at: "2024-01-18T11:45:00Z"
  },
  5: {
    id: 5,
    name: "Royal Gaming",
    status: "active",
    apiKey: "gapi_2d3f4g5h6j...",
    requests: "18,789",
    lastActive: "30 minutes ago",
    providers: ["GAMEROOM", "GAMEVAULT"],
    created_at: "2024-01-19T16:30:00Z"
  }
}

const storeStats = [
  {
    title: "Total Stores",
    value: "24",
    change: "+3 this month",
    icon: Building2,
    color: "text-custom-blue"
  },
  {
    title: "Active Users",
    value: "15.2K",
    change: "+12% vs last month",
    icon: Users,
    color: "text-green-600"
  },
  {
    title: "Total Revenue",
    value: "$142.5K",
    change: "+23% vs last month",
    icon: Wallet,
    color: "text-purple-600"
  },
  {
    title: "Avg Transaction",
    value: "$48.50",
    change: "+$3.20 vs baseline",
    icon: TrendingUp,
    color: "text-emerald-600"
  }
]

export default function StoresPage() {
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter stores based on search term
  const filteredStores = useMemo(() => {
    const stores = Object.values(mockStoreDetails)
    if (!searchTerm) return stores

    const term = searchTerm.toLowerCase()
    return stores.filter(store => 
      store.name.toLowerCase().includes(term) ||
      store.apiKey.toLowerCase().includes(term)
    )
  }, [searchTerm])

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    // Reset selection when searching
    setSelectedStore('all')
  }

  // Get the selected store details
  const currentStore = selectedStore !== 'all' ? mockStoreDetails[parseInt(selectedStore)] : null

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      searchFilter={
        <SearchFilter 
          type="stores" 
          onStoreSelect={handleStoreSelect}
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
                Store Management
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                Game Stores
              </h1>
              <Button className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs tracking-wide uppercase">
                <Plus className="mr-2 h-4 w-4" />
                New Store
              </Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Manage game stores and their API access credentials
            </p>
          </div>
        </div>

        {/* Show message when no stores match search */}
        {filteredStores.length === 0 && (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            <p className="font-mono">No stores found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}

        {/* Show message when no store is selected */}
        {!currentStore && filteredStores.length > 0 && (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            <p className="font-mono">Select a store from the list to view details</p>
          </div>
        )}

        {/* Show overview when no store is selected */}
        {!currentStore && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {storeStats.map((stat) => (
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Stores */}
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
                  <h2 className="font-mono font-bold">Top Performing Stores</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {Object.values(mockStoreDetails)
                      .slice(0, 3)
                      .map(store => (
                        <div key={store.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-custom-blue/20 dark:bg-custom-blue/30 text-custom-blue rounded flex items-center justify-center">
                              <ShoppingBag className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-mono font-medium">{store.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {store.requests} requests
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="text-xs font-mono">+12%</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
                  <h2 className="font-mono font-bold">Recent Transactions</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {[
                      { store: "GameStore Alpha", amount: "$125.00", type: "Deposit", time: "2 mins ago" },
                      { store: "BetaCasino", amount: "$75.50", type: "Withdrawal", time: "5 mins ago" },
                      { store: "Lucky Games", amount: "$250.00", type: "Deposit", time: "12 mins ago" }
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded flex items-center justify-center">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-mono font-medium">{tx.store}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {tx.type}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-medium">{tx.amount}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {tx.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Activity */}
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
                <h2 className="font-mono font-bold">Provider Activity</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono">GAMEROOM</span>
                      <span className="text-xs font-mono">15.2K requests</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-custom-blue rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono">GAMEVAULT</span>
                      <span className="text-xs font-mono">12.8K requests</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-purple-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show store details when a store is selected */}
        {currentStore && (
          <div className="space-y-6">
            {/* Store Overview */}
            <div className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-mono font-bold">{currentStore.name}</h2>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                  <span className="text-xs font-mono uppercase">{currentStore.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">API Key</label>
                    <div className="font-mono text-sm mt-1">{currentStore.apiKey}</div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Total Requests</label>
                    <div className="font-mono text-sm mt-1">{currentStore.requests}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Last Active</label>
                    <div className="font-mono text-sm mt-1">{currentStore.lastActive}</div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Created</label>
                    <div className="font-mono text-sm mt-1">
                      {new Date(currentStore.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Providers */}
            <div className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <h3 className="text-sm font-mono uppercase text-slate-500 mb-4">Active Providers</h3>
              <div className="flex gap-2">
                {currentStore.providers.map((provider) => (
                  <div 
                    key={provider}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                  >
                    <span className="font-mono text-sm">{provider}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 