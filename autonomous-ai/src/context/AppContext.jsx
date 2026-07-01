import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home')
  const [planningData, setPlanningData] = useState(null)
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      role: 'ai',
      content: 'Namaste! Main Autonomous AI hoon. Aap kya banana chahte hain? Web app, mobile app, ya kuch aur? Mujhe batayein, main aapki planning aur development dono karunga! 🚀',
      timestamp: new Date().toISOString()
    }
  ])
  const [workspaceProjects, setWorkspaceProjects] = useState([])
  const [isPlanningMode, setIsPlanningMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((role, content) => {
    const newMessage = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date().toISOString()
    }
    setChatHistory(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const generatePlanning = useCallback((userPrompt) => {
    setIsLoading(true)

    // Simulate AI planning generation
    setTimeout(() => {
      const planning = {
        id: Date.now(),
        title: userPrompt,
        type: 'web', // web, mobile, or both
        features: [
          'User Authentication (Login/Signup)',
          'Dashboard with Analytics',
          'Responsive Design',
          'API Integration',
          'Database Setup',
          'Deployment Pipeline'
        ],
        techStack: {
          frontend: ['React', 'Tailwind CSS', 'Framer Motion'],
          backend: ['Node.js', 'Express', 'MongoDB'],
          deployment: ['Vercel', 'Docker']
        },
        timeline: '2-3 weeks',
        estimatedCost: '$500-1000',
        createdAt: new Date().toISOString()
      }

      setPlanningData(planning)
      setIsLoading(false)
      setIsPlanningMode(true)
    }, 2000)
  }, [])

  const navigateToWorkspace = useCallback(() => {
    setCurrentPage('workspace')
    if (planningData) {
      setWorkspaceProjects(prev => [planningData, ...prev])
    }
  }, [planningData])

  const value = {
    currentPage,
    setCurrentPage,
    planningData,
    setPlanningData,
    chatHistory,
    addMessage,
    workspaceProjects,
    setWorkspaceProjects,
    isPlanningMode,
    setIsPlanningMode,
    isLoading,
    setIsLoading,
    generatePlanning,
    navigateToWorkspace
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}