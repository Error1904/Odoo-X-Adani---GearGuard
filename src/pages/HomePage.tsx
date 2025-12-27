import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, LayoutGrid, Calendar, Users, ArrowRight, Database } from 'lucide-react'
import { checkDatabaseHealth, testTeamCreation } from '@/lib/dbCheck'
import { useState } from 'react'

export function HomePage() {
  const [checking, setChecking] = useState(false)

  const handleDatabaseCheck = async () => {
    setChecking(true)
    const result = await checkDatabaseHealth()
    console.log('Database Health:', result)
    alert(`Database Check:\n${result.connection ? '✅ Connected' : '❌ Connection Failed'}\n\nTables:\n${Object.entries(result.tables).map(([k, v]) => `${v ? '✅' : '❌'} ${k}`).join('\n')}\n\n${result.errors.length > 0 ? 'Errors:\n' + result.errors.join('\n') : ''}`)
    setChecking(false)
  }

  const handleTestTeam = async () => {
    setChecking(true)
    const result = await testTeamCreation()
    console.log('Test Result:', result)
    alert(result.success ? '✅ Team created successfully!\nCheck the console and Teams page.' : `❌ Failed: ${result.error}`)
    setChecking(false)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to GearGuard</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your complete maintenance management system for tracking equipment and managing maintenance requests
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleDatabaseCheck} disabled={checking} variant="outline">
            <Database className="mr-2 h-4 w-4" />
            {checking ? 'Checking...' : 'Check Database'}
          </Button>
          <Button onClick={handleTestTeam} disabled={checking} variant="outline">
            Test Team Creation
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Package className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Equipment</CardTitle>
            <CardDescription>
              Manage your company assets and track their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/equipment">
                View Equipment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <LayoutGrid className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Kanban Board</CardTitle>
            <CardDescription>
              Track maintenance requests with drag-and-drop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/maintenance/kanban">
                View Kanban <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Schedule and view preventive maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/maintenance/calendar">
                View Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              Manage your maintenance teams and members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/teams">
                View Teams <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Set up your teams</h3>
              <p className="text-sm text-muted-foreground">
                Create teams and add team members who will handle maintenance
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Add your equipment</h3>
              <p className="text-sm text-muted-foreground">
                Register all your company assets with details and assign maintenance teams
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Create maintenance requests</h3>
              <p className="text-sm text-muted-foreground">
                Report issues or schedule preventive maintenance for your equipment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
