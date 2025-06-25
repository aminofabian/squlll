'use client'

import { SchoolTypeSetup } from '../components/schooltype/SchoolTypeSetup'
import { ClassHeader } from './components/ClassCard'

export default function SchoolHome() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <ClassHeader />
        </div>
        <SchoolTypeSetup />
      </div>
    </main>
  )
}
