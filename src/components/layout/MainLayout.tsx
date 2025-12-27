import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Wrench, Calendar, LayoutGrid, Users, Package, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'

export function MainLayout() {
  const { user, profile, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">GearGuard</h1>
            </Link>
            <nav className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/equipment" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Equipment
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/maintenance/kanban" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/maintenance/calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/teams" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Teams
                </Link>
              </Button>

              {isAuthenticated && (
                <>
                  <div className="h-6 w-px bg-border mx-2" />
                  <div className="flex items-center gap-2 px-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{profile?.full_name || user?.email}</span>
                      {profile && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {profile.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}

              {!isAuthenticated && (
                <Button asChild>
                  <Link to="/login">Login</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
