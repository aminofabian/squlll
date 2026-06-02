'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MobileDashboard } from './components/MobileDashboard'
import { DesktopDashboard } from './components/DesktopDashboard'
import { DesktopSidebar } from './components/DesktopSidebar'
import { MobileHeader } from './components/MobileHeader'
import { MobileBottomNav } from './components/MobileBottomNav'
import { NotificationsPanel } from './components/NotificationsPanel'
import { ContentRenderer } from './components/ContentRenderer'
import { ParentPortalEmptyState } from './components/ParentPortalEmptyState'
import { useParentPortal } from '@/lib/parent/useParentPortal'
import { useParentDashboardData } from '@/lib/parent/useParentDashboardData'
import { useNotificationsOptional } from '@/lib/notifications/NotificationProvider'

const ParentsPortal = () => {
  const params = useParams()
  const subdomain = params.subdomain as string

  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedChild, setSelectedChild] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const {
    portalChildren,
    consolidatedFees,
    loading: portalLoading,
    error: portalError,
    refetchAll,
  } = useParentPortal(subdomain, selectedChild)

  const notifCtx = useNotificationsOptional()

  useEffect(() => {
    if (selectedChild >= portalChildren.length && portalChildren.length > 0) {
      setSelectedChild(0)
    }
  }, [portalChildren.length, selectedChild])

  const selectedChildData = portalChildren[selectedChild]

  const dashboard = useParentDashboardData(
    subdomain,
    selectedChildData,
    Boolean(selectedChildData?.studentId),
  )

  const notifications = useMemo(() => {
    if (!notifCtx?.notifications?.length) return []
    return notifCtx.notifications.slice(0, 20).map((n) => ({
      id: n.id,
      type: n.type.includes('fee')
        ? 'payment'
        : n.type.includes('exam') || n.type.includes('assignment')
          ? 'grade'
          : n.type.includes('broadcast')
            ? 'event'
            : 'event',
      message: n.body ? `${n.title}: ${n.body}` : n.title,
      time: new Date(n.createdAt).toLocaleString(),
      read: n.read,
    }))
  }, [notifCtx?.notifications])

  const portalGate = (content: React.ReactNode) => {
    if (portalLoading && portalChildren.length === 0) {
      return <ParentPortalEmptyState variant="loading" />
    }
    if (portalError && portalChildren.length === 0) {
      return (
        <ParentPortalEmptyState
          variant="error"
          error={portalError}
          onRetry={() => void refetchAll()}
        />
      )
    }
    if (!portalLoading && portalChildren.length === 0) {
      return <ParentPortalEmptyState variant="no-children" />
    }
    return content
  }

  const renderDesktopLayout = () => (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <DesktopSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subdomain={subdomain}
        notifications={notifications}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-10">
          {portalGate(
            activeTab === 'dashboard' ? (
              <DesktopDashboard
                children={portalChildren}
                selectedChild={selectedChild}
                setSelectedChild={setSelectedChild}
                todaySchedule={dashboard.todaySchedule}
                recentGrades={dashboard.recentGrades}
                upcomingEvents={[]}
                notifications={notifications}
                parentName={dashboard.parentName}
                averageGpa={dashboard.averageGpa}
                dashboardLoading={dashboard.loading}
                consolidatedFees={consolidatedFees}
                feesLoading={portalLoading}
                onFeesRefresh={() => void refetchAll()}
                onSelectChildByStudentId={(studentId) => {
                  const index = portalChildren.findIndex(
                    (c) => c.studentId === studentId,
                  )
                  if (index >= 0) {
                    setSelectedChild(index)
                    setActiveTab('payments')
                  }
                }}
              />
            ) : (
              <ContentRenderer
                activeTab={activeTab}
                subdomain={subdomain}
                todaySchedule={dashboard.todaySchedule}
                notifications={notifications}
                children={portalChildren}
                selectedChild={selectedChild}
                setSelectedChild={setSelectedChild}
                portalError={portalError}
              />
            ),
          )}
        </div>
      </div>

      <NotificationsPanel notifications={notifications} variant="desktop" />
    </div>
  )

  const renderMobileLayout = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <MobileHeader subdomain={subdomain} />

      <div className="flex-1 overflow-y-auto pb-24">
        {portalGate(
          activeTab === 'dashboard' ? (
            <MobileDashboard
              children={portalChildren}
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
              todaySchedule={dashboard.todaySchedule}
              recentGrades={dashboard.recentGrades}
              notifications={notifications}
              subdomain={subdomain}
              averageGpa={dashboard.averageGpa}
              dashboardLoading={dashboard.loading}
              consolidatedFees={consolidatedFees}
              feesLoading={portalLoading}
              onFeesRefresh={() => void refetchAll()}
              onSelectChildByStudentId={(studentId) => {
                const index = portalChildren.findIndex(
                  (c) => c.studentId === studentId,
                )
                if (index >= 0) {
                  setSelectedChild(index)
                  setActiveTab('payments')
                }
              }}
            />
          ) : (
            <div className="p-6">
              <ContentRenderer
                activeTab={activeTab}
                subdomain={subdomain}
                todaySchedule={dashboard.todaySchedule}
                notifications={notifications}
                children={portalChildren}
                selectedChild={selectedChild}
                setSelectedChild={setSelectedChild}
                portalError={portalError}
              />
            </div>
          ),
        )}
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
      />

      <NotificationsPanel
        notifications={notifications}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        variant="mobile"
      />
    </div>
  )

  return (
    <>
      <div className="hidden lg:block">{renderDesktopLayout()}</div>
      <div className="lg:hidden">{renderMobileLayout()}</div>
    </>
  )
}

export default ParentsPortal
