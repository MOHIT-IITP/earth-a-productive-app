'use client'

import Draw from '@/components/Draw/Draw'
import Notes from '@/components/Notes/Notes'
import Sidebar from '@/components/Sidebar'
import Todo from '@/components/Todo/Todo'
import React, { useState, ReactNode } from 'react'

export default function HomeLayout({
  children,
}: {
  children: ReactNode
}) {
  const [activeSection, setActiveSection] = useState('home')
  const [sidebarVisible, setSidebarVisible] = useState(true)

  const handleNavigate = (section: string) => {
    setActiveSection(section)
  }

  const handleToggleSidebar = () => {
    setSidebarVisible((prev) => !prev)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'notes':
        return <Notes />
      case 'todo':
        return <Todo />
      case 'draw':
        return <Draw />
      default:
        return children
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-300">
      <div className="flex h-screen relative">
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-zinc-200/70 shadow-xl relative z-20">
            <Sidebar onNavigate={handleNavigate} activeSection={activeSection} />
            {/* Hide Sidebar Button */}
            <button
              onClick={handleToggleSidebar}
              className="absolute -right-4 top-4 bg-white/90 backdrop-blur-sm border border-zinc-200/70 rounded-full p-2 shadow-lg hover:shadow-xl hover:bg-zinc-100 transition-all duration-200"
              aria-label="Hide sidebar"
              tabIndex={0}
            >
              {/* Left arrow icon */}
              <svg className='size-5 text-zinc-700' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5H13V19H5V5ZM19 19H15V5H19V19ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4C21 3.44772 20.5523 3 20 3H4ZM7 12L11 8.5V15.5L7 12Z"></path></svg>
            </button>
          </div>
        )}

        {/* Show Sidebar Button (when hidden) */}
        {!sidebarVisible && (
          <button
            onClick={handleToggleSidebar}
            className="absolute left-4 top-4 z-30 bg-white/90 backdrop-blur-sm border border-zinc-200/70 rounded-xl p-3 shadow-lg hover:shadow-xl hover:bg-zinc-100 transition-all duration-200"
            aria-label="Show sidebar"
            tabIndex={0}
          >
            {/* Right arrow icon */}
            <svg className='size-5 text-zinc-700' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5H13V19H5V5ZM19 19H15V5H19V19ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4C21 3.44772 20.5523 3 20 3H4ZM11 12L7 8.5V15.5L11 12Z"></path></svg>
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="h-full flex items-center justify-center">
              <div className="w-full max-w-full">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
