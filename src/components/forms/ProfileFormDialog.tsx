import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProfileFormDialogProps {
  trigger?: React.ReactNode
  teamId?: string
}

export function ProfileFormDialog({ trigger, teamId }: ProfileFormDialogProps) {
  const { canManageTeams } = useAuth()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    user_id: '',
    full_name: '',
    email: '',
    team_id: teamId || '',
    role: 'technician' as 'manager' | 'technician' | 'admin',
    phone: '',
  })

  // Only admins and managers can add team members
  if (!canManageTeams) {
    return null
  }

  // Fetch teams for dropdown
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('teams')
        .select('id, name')
        .order('name')

      if (error) throw error
      return data
    },
  })

  // Fetch existing users who don't have teams assigned
  const { data: unassignedUsers } = useQuery({
    queryKey: ['unassigned-users'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .is('team_id', null)

      if (error) throw error
      return data as any[]
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { userId: string; team_id: string; role: string; phone?: string }) => {
      console.log('Updating profile:', profileData)
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update({
          team_id: profileData.team_id,
          role: profileData.role,
          phone: profileData.phone || null,
        })
        .eq('id', profileData.userId)
        .select()

      console.log('Result:', { data, error })

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      console.log('Profile updated successfully')
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['unassigned-users'] })
      setOpen(false)
      setFormData({
        user_id: '',
        full_name: '',
        email: '',
        team_id: teamId || '',
        role: 'technician',
        phone: '',
      })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      alert(`Error assigning team member: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.user_id && formData.team_id) {
      updateProfileMutation.mutate({
        userId: formData.user_id,
        team_id: formData.team_id,
        role: formData.role,
        phone: formData.phone,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Team Member</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
          <DialogDescription>
            Assign a registered user to a team. Users must sign up first.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Select User *</Label>
            <Select
              value={formData.user_id}
              onValueChange={(value) => {
                const user = unassignedUsers?.find((u: any) => u.id === value)
                setFormData({
                  ...formData,
                  user_id: value,
                  full_name: user?.full_name || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                })
              }}
            >
              <SelectTrigger id="user">
                <SelectValue placeholder="Select a user to assign" />
              </SelectTrigger>
              <SelectContent>
                {unassignedUsers && unassignedUsers.length > 0 ? (
                  unassignedUsers.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No unassigned users
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only users without teams are shown. New users must sign up first.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="e.g., 555-0123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">Team *</Label>
            <Select
              value={formData.team_id}
              onValueChange={(value) =>
                setFormData({ ...formData, team_id: value })
              }
              disabled={!!teamId}
            >
              <SelectTrigger id="team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team: any) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'manager' | 'technician' | 'admin') =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfileMutation.isPending || !formData.user_id}>
              {updateProfileMutation.isPending ? 'Assigning...' : 'Assign to Team'}
            </Button>
          </DialogFooter>

          {updateProfileMutation.isError && (
            <p className="text-sm text-red-600 mt-2">
              Error: {(updateProfileMutation.error as Error).message}
            </p>
          )}

          {updateProfileMutation.isSuccess && (
            <p className="text-sm text-green-600 mt-2">
              Team member assigned successfully!
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
