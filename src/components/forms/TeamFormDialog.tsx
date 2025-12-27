import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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

interface TeamFormDialogProps {
  trigger?: React.ReactNode
}

export function TeamFormDialog({ trigger }: TeamFormDialogProps) {
  const { canManageTeams } = useAuth()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [name, setName] = useState('')

  // Only admins and managers can create teams
  if (!canManageTeams) {
    return null
  }

  const createMutation = useMutation({
    mutationFn: async (teamName: string) => {
      console.log('Creating team:', teamName)
      const { data, error } = await (supabase as any)
        .from('teams')
        .insert({ name: teamName })
        .select()

      console.log('Result:', { data, error })

      if (error) {
        console.error('Error creating team:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      console.log('Team created successfully')
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setOpen(false)
      setName('')
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      alert(`Error creating team: ${error.message}`)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      createMutation.mutate(name)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Team</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a maintenance team to manage equipment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mechanics, IT Support"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>

          {createMutation.isError && (
            <p className="text-sm text-red-600 mt-2">
              Error: {(createMutation.error as Error).message}
            </p>
          )}

          {createMutation.isSuccess && (
            <p className="text-sm text-green-600 mt-2">
              Team created successfully!
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
