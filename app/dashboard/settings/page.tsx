"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database,
  Key,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { useState } from "react"

const systemStats = [
  {
    title: "System Uptime",
    value: "15 days, 4 hours",
    status: "healthy",
    icon: CheckCircle,
  },
  {
    title: "Database Status",
    value: "Connected",
    status: "healthy", 
    icon: Database,
  },
  {
    title: "API Endpoints",
    value: "All operational",
    status: "healthy",
    icon: Globe,
  },
  {
    title: "Security Status",
    value: "Secure",
    status: "warning",
    icon: Shield,
  },
]

const providers = [
  { name: "GAMEROOM", status: "active", url: "https://agentserver.gameroom777.com" },
  { name: "GAMEVAULT", status: "active", url: "https://agent.gamevault999.com" },
  { name: "PLAYTECH", status: "inactive", url: "https://api.playtech.com" },
]

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      searchFilter={<SearchFilter />}
      mobileNav={<MobileNav />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-muted-foreground">Manage your account, security, and system preferences</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
            <Button size="sm" className="h-9">
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </Button>
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {systemStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.title} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Icon className={`h-8 w-8 ${
                      stat.status === 'healthy' ? 'text-green-600' : 
                      stat.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <div>
                      <h3 className="font-medium text-sm">{stat.title}</h3>
                      <p className="text-xs text-muted-foreground">{stat.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value="admin" 
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  defaultValue="admin@SQUL.com"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                Update Account
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="current-password" 
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input 
                    id="new-password" 
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch id="2fa" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout">Auto-logout</Label>
                    <p className="text-xs text-muted-foreground">Automatically logout after inactivity</p>
                  </div>
                  <Switch id="session-timeout" defaultChecked />
                </div>
              </div>

              <Button className="w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Provider Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Provider Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{provider.name}</h3>
                      <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                        {provider.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{provider.url}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8">
                      Test Connection
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="error-notifications">Error Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified of API errors</p>
                </div>
                <Switch id="error-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="usage-alerts">Usage Alerts</Label>
                  <p className="text-xs text-muted-foreground">High usage warnings</p>
                </div>
                <Switch id="usage-alerts" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-stores">New Store Notifications</Label>
                  <p className="text-xs text-muted-foreground">When new stores are created</p>
                </div>
                <Switch id="new-stores" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-xs text-muted-foreground">Automated summary reports</p>
                </div>
                <Switch id="weekly-reports" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input 
                  id="notification-email" 
                  type="email"
                  defaultValue="admin@SQUL.com"
                  placeholder="Enter notification email"
                />
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Default Rate Limit (per minute)</Label>
                <Input 
                  id="rate-limit" 
                  type="number"
                  defaultValue="1000"
                  placeholder="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum API calls per minute per store
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                <Input 
                  id="timeout" 
                  type="number"
                  defaultValue="30"
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-retention">Log Retention (days)</Label>
                <Select>
                  <SelectTrigger id="log-retention">
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <p className="text-xs text-muted-foreground">Enable detailed logging</p>
                </div>
                <Switch id="debug-mode" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">Temporarily disable API access</p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              System Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Clear Cache</h3>
                <p className="text-xs text-muted-foreground">
                  Clear system cache to improve performance
                </p>
                <Button variant="outline" className="w-full">
                  Clear Cache
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm">Database Cleanup</h3>
                <p className="text-xs text-muted-foreground">
                  Remove old SQUL and optimize database
                </p>
                <Button variant="outline" className="w-full">
                  Cleanup Database
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm">Export Logs</h3>
                <p className="text-xs text-muted-foreground">
                  Download system logs for analysis
                </p>
                <Button variant="outline" className="w-full">
                  Export Logs
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                    Backup Recommendation
                  </h3>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Last backup was 3 days ago. It&apos;s recommended to backup your data regularly.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 h-8">
                    Create Backup Now
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 