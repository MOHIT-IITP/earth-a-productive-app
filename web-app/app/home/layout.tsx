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
    <div className="flex h-screen relative">
      {/* Sidebar */}
      {sidebarVisible && (
        <div className="w-64 border-r border-gray-200 relative z-20 bg-white dark:bg-gray-900">
          <Sidebar onNavigate={handleNavigate} activeSection={activeSection} />
          {/* Hide Sidebar Button */}
          <button
            onClick={handleToggleSidebar}
            className="absolute -right-4 top-4 bg-gray-200 dark:bg-gray-800 rounded-full p-1 shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            aria-label="Hide sidebar"
            tabIndex={0}
          >
            {/* Left arrow icon */}
            <svg className='size-6' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5H13V19H5V5ZM19 19H15V5H19V19ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4C21 3.44772 20.5523 3 20 3H4ZM7 12L11 8.5V15.5L7 12Z"></path></svg>
          </button>
        </div>
      )}

      {/* Show Sidebar Button (when hidden) */}
      {!sidebarVisible && (
        <button
          onClick={handleToggleSidebar}
          className="absolute left-2 top-4 z-30 bg-gray-200 dark:bg-gray-800 rounded-full p-1 shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          aria-label="Show sidebar"
          tabIndex={0}
        >
          {/* Right arrow icon */}
          <svg className='size-6' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5H13V19H5V5ZM19 19H15V5H19V19ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4C21 3.44772 20.5523 3 20 3H4ZM11 12L7 8.5V15.5L11 12Z"></path></svg>
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
