import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const [showTimeout, setShowTimeout] = useState(false)

  // Add timeout fallback in case loading gets stuck
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setShowTimeout(true)
      }, 10000) // 10 second timeout

      return () => clearTimeout(timeout)
    } else {
      setShowTimeout(false)
    }
  }, [loading])

  if (loading && !showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (showTimeout) {
    console.error('Auth loading timeout - redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
