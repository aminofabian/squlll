import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, Key, Activity, AlertTriangle, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Stores",
    value: "24",
    change: "+3 this month",
    icon: Store,
  },
  {
    title: "Active API Keys",
    value: "19",
    change: "+2 this week",
    icon: Key,
  },
  {
    title: "API Calls Today",
    value: "1,234",
    change: "+12% from yesterday",
    icon: Activity,
  },
  {
    title: "Success Rate",
    value: "98.5%",
    change: "+0.3% this week",
    icon: TrendingUp,
  },
]

const recentActivity = [
  { id: 1, store: "GameStore Alpha", action: "API Key Generated", status: "Success", time: "2 min ago" },
  { id: 2, store: "BetaCasino", action: "Credential Updated", status: "Success", time: "5 min ago" },
  { id: 3, store: "GammaGames", action: "Provider Connection Failed", status: "Error", time: "8 min ago" },
  { id: 4, store: "DeltaPlay", action: "Store Created", status: "Success", time: "12 min ago" },
  { id: 5, store: "EpsilonBet", action: "API Call", status: "Success", time: "15 min ago" },
]

const topProviders = [
  { name: "GAMEROOM", calls: 856, successRate: 99.2 },
  { name: "GAMEVAULT", calls: 743, successRate: 97.8 },
  { name: "PLAYTECH", calls: 432, successRate: 98.9 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'Warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">SQUL Dashboard</h1>
          <p className="text-muted-foreground">Monitor your game provider integrations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="h-9">
            Export Report
          </Button>
          <Button size="sm" className="h-9">
            Add Store
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across your stores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{activity.store}</h3>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Provider Performance</CardTitle>
            <CardDescription>
              API call statistics by provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProviders.map((provider) => (
                <div key={provider.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">{provider.calls} calls today</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{provider.successRate}%</p>
                    <p className="text-xs text-muted-foreground">Success rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div>
                <p className="text-sm font-medium">High API usage detected</p>
                <p className="text-xs text-muted-foreground">Store &quot;GammaGames&quot; approaching rate limit</p>
              </div>
              <Button variant="outline" size="sm" className="h-7">
                View
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-custom-blue/10 dark:bg-custom-blue/20 border border-custom-blue/20 dark:border-custom-blue/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">New provider available</p>
                <p className="text-xs text-muted-foreground">NEWGAMING provider can now be configured</p>
              </div>
              <Button variant="outline" size="sm" className="h-7">
                Setup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 