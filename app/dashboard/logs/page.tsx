"use client"

import { useState, useMemo } from 'react'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { Activity, CheckCircle, XCircle, Clock } from "lucide-react"

interface Log {
  id: number
  store_name: string
  provider: 'GAMEROOM' | 'GAMEVAULT'
  operation: string
  status: 'success' | 'failed'
  timestamp: string
  request_id: string
  request_data: {
    user_id: string
    amount?: number
    currency?: string
    [key: string]: string | number | undefined
  }
  response_data: {
    balance?: number
    error?: string
    [key: string]: string | number | undefined
  }
  duration_ms: number
}

// Mock logs data with more details
const mockLogs: { [key: number]: Log } = {
  1: {
    id: 1,
    store_name: "GameStore Alpha",
    provider: "GAMEROOM",
    operation: "get_user_balance",
    status: "success",
    timestamp: "2024-01-15T10:30:00Z",
    request_id: "req_abc123",
    request_data: {
      user_id: "user_123",
      currency: "USD"
    },
    response_data: {
      balance: 150.50
    },
    duration_ms: 245
  },
  2: {
    id: 2,
    store_name: "BetaCasino",
    provider: "GAMEVAULT",
    operation: "recharge",
    status: "failed",
    timestamp: "2024-01-15T10:35:00Z",
    request_id: "req_def456",
    request_data: {
      user_id: "user_456",
      amount: 100,
      currency: "EUR"
    },
    response_data: {
      error: "Insufficient funds"
    },
    duration_ms: 189
  }
}

const logStats = [
  {
    title: "Total Requests",
    value: "45.2K",
    change: "+12% vs last month",
    icon: Activity,
    color: "text-blue-600"
  },
  {
    title: "Success Rate",
    value: "99.2%",
    change: "+0.3% improvement",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    title: "Avg Response",
    value: "156ms",
    change: "-23ms from baseline",
    icon: Clock,
    color: "text-purple-600"
  },
  {
    title: "Error Rate",
    value: "0.8%",
    change: "Within SLA",
    icon: XCircle,
    color: "text-red-600"
  }
]

export default function LogsPage() {
  const [selectedLog, setSelectedLog] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return Object.values(mockLogs)
    return Object.values(mockLogs).filter(log => 
      log.store_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleLogSelect = (logId: string) => {
    setSelectedLog(logId)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setSelectedLog('all')
  }

  // Get the selected log details
  const currentLog = selectedLog !== 'all' ? mockLogs[parseInt(selectedLog)] : null

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      searchFilter={
        <SearchFilter 
          type="logs" 
          onStoreSelect={handleLogSelect}
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
              <span className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                System Logs
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                Request Logs
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Monitor and analyze API requests and responses
            </p>
          </div>
        </div>

        {/* Show overview when no log is selected */}
        {!currentLog && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {logStats.map((stat) => (
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
              {/* Recent Errors */}
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
                  <h2 className="font-mono font-bold">Recent Errors</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {Object.values(mockLogs)
                      .filter(log => log.status === 'failed')
                      .map(log => (
                        <div key={log.id} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{log.store_name}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs font-mono">{log.operation}</span>
                            </div>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {log.response_data.error}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs font-mono text-slate-500">{log.request_id}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs font-mono text-slate-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Response Time Breakdown */}
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
                  <h2 className="font-mono font-bold">Response Time Breakdown</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono">GAMEROOM</span>
                        <span className="text-xs font-mono">145ms avg</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-blue-500 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono">GAMEVAULT</span>
                        <span className="text-xs font-mono">167ms avg</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-purple-500 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-mono uppercase text-slate-500">Fastest Response</p>
                        <p className="font-mono font-bold mt-1">89ms</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase text-slate-500">Slowest Response</p>
                        <p className="font-mono font-bold mt-1">892ms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show message when no log is selected */}
        {!currentLog && (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            <p className="font-mono">Select a log from the list to view details</p>
          </div>
        )}

        {/* Show log details when one is selected */}
        {currentLog && (
          <div className="space-y-6">
            {/* Log Overview */}
            <div className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-mono font-bold">{currentLog.store_name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-mono rounded">
                      {currentLog.provider}
                    </div>
                    <div className="text-xs font-mono">{currentLog.operation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {currentLog.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-mono">{currentLog.duration_ms}ms</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Request Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-mono uppercase text-slate-500">Request</h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(currentLog.request_data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Response Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-mono uppercase text-slate-500">Response</h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(currentLog.response_data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Request ID</label>
                    <div className="font-mono text-sm mt-1">{currentLog.request_id}</div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Timestamp</label>
                    <div className="font-mono text-sm mt-1">
                      {new Date(currentLog.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Status</label>
                    <div className="font-mono text-sm mt-1">{currentLog.status}</div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-500">Duration</label>
                    <div className="font-mono text-sm mt-1">{currentLog.duration_ms}ms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Use filteredLogs when rendering the logs list */}
        <div className="space-y-4">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-mono">{log.store_name}</span>
                <span className="text-sm text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
} 