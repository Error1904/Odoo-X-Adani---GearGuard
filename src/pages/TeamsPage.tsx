import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, UserPlus } from 'lucide-react'
import { TeamFormDialog } from '@/components/forms/TeamFormDialog'
import { ProfileFormDialog } from '@/components/forms/ProfileFormDialog'
import { Skeleton } from '@/components/ui/skeleton'

export function TeamsPage() {
  const { data: teams, isLoading, error: queryError } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      console.log('Fetching teams with members...')
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:profiles(id, full_name, role, email)
        `)
        .order('name')

      if (error) {
        console.error('Error fetching teams:', error)
        throw error
      }

      console.log('Teams data:', data)
      return data
    },
  })

  if (queryError) {
    console.error('Query error:', queryError)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage your maintenance teams</p>
        </div>
        <div className="flex gap-2">
          <ProfileFormDialog
            trigger={
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            }
          />
          <TeamFormDialog
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Team
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))
        ) : (
          teams?.map((team: any) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>
                    {Array.isArray(team.members) ? team.members.length : 0} members
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.isArray(team.members) && team.members.length > 0 ? (
                <div className="space-y-2">
                  {team.members.slice(0, 5).map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <span className="text-sm">{member.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                  {team.members.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      +{team.members.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members yet</p>
              )}

              <ProfileFormDialog
                teamId={team.id}
                trigger={
                  <Button variant="outline" className="w-full mt-4">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                }
              />
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {!isLoading && teams?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No teams found</p>
            <TeamFormDialog
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Team
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
